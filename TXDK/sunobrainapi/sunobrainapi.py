"""SunoBrain API — Suno v5.5 lyric optimization engine powered by Gemini or DeepSeek.

API keys are read from env vars (GEMINI_API_KEY, DEEPSEEK_API_KEY). The
`api_key` field on requests is ignored when env vars are set, allowed as a
fallback for local dev when env vars are missing.
"""

import base64
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import httpx
from google import genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from parser import parse_draft_response, parse_full_response
from prompts import PROMPTS, ALBUM_COVER_PROMPT


def _load_env_local() -> None:
    """Load KEY=VALUE pairs from ./env.local into os.environ (no overwrite)."""
    env_file = Path(__file__).parent / "env.local"
    if not env_file.exists():
        return
    for raw in env_file.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_env_local()

DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"


def _resolve_api_key(provider: str, request_key: str) -> str:
    """Prefer env var; fall back to request-body key for local dev only."""
    env_var = "DEEPSEEK_API_KEY" if provider == "deepseek" else "GEMINI_API_KEY"
    return os.environ.get(env_var) or request_key

logger = logging.getLogger("sunobrainapi")
logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class GenerateRequest(BaseModel):
    mode: Literal[
        "lyrics", "theme_oneshot", "theme_draft", "optimize_draft",
        "builder_oneshot", "builder_draft",
        "refresh_title", "refresh_styles", "refresh_exclude", "refresh_lyrics",
    ]
    input: str = Field(..., min_length=1, max_length=20000)
    api_key: str = Field(default="")  # ignored if env var is set
    model: str = Field(default="gemini-2.5-pro")
    provider: Literal["gemini", "deepseek"] = Field(default="gemini")


class AnalysisOutput(BaseModel):
    vibe_dna: str = ""
    phonetic_mapping: str = ""
    semantic_weight: str = ""


class GenerateResponse(BaseModel):
    styles: str = ""
    exclude_styles: str = ""
    lyrics: str = ""
    plain_lyrics: str = ""
    analysis: AnalysisOutput = AnalysisOutput()
    title: str = ""  # populated by refresh_title only


class AlbumCoverRequest(BaseModel):
    plain_lyrics: str = Field(..., min_length=1, max_length=10000)
    song_title: str = Field(default="UNTITLED")
    styles: str = Field(default="")
    api_key: str = Field(default="")  # ignored if env var is set
    model: str = Field(default="imagen-4.0-fast-generate-001")


class AlbumCoverResponse(BaseModel):
    image_base64: str
    mime_type: str


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


class ErrorBody(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] = []


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SunoBrain API starting on port 8094")
    yield
    logger.info("SunoBrain API shutting down")


app = FastAPI(
    title="SunoBrain API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5205"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"}},
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "sunobrainapi"}


async def _call_gemini(api_key: str, model: str, system_prompt: str, user_input: str) -> str:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model,
        contents=user_input,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
        ),
    )
    return response.text


async def _call_deepseek(api_key: str, model: str, system_prompt: str, user_input: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input},
        ],
        "stream": False,
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(DEEPSEEK_URL, headers=headers, json=payload)

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid DeepSeek API key")
    if response.status_code == 402:
        raise HTTPException(
            status_code=402,
            detail="DeepSeek: insufficient balance for this model",
        )
    if response.status_code >= 400:
        try:
            body = response.json()
            msg = body.get("error", {}).get("message") or response.text
        except Exception:
            msg = response.text
        raise HTTPException(status_code=502, detail=f"DeepSeek error: {msg}")

    data = response.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"DeepSeek returned unexpected response shape: {e}",
        )


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    system_prompt = PROMPTS.get(req.mode)
    if not system_prompt:
        raise HTTPException(status_code=400, detail=f"Unknown mode: {req.mode}")

    api_key = _resolve_api_key(req.provider, req.api_key)
    if not api_key:
        env_var = "DEEPSEEK_API_KEY" if req.provider == "deepseek" else "GEMINI_API_KEY"
        raise HTTPException(
            status_code=500, detail=f"Server is missing {env_var} env var",
        )

    try:
        if req.provider == "deepseek":
            raw_text = await _call_deepseek(
                api_key, req.model, system_prompt, req.input,
            )
        else:
            raw_text = await _call_gemini(
                api_key, req.model, system_prompt, req.input,
            )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "401" in error_msg or "403" in error_msg:
            provider_name = "DeepSeek" if req.provider == "deepseek" else "Gemini"
            raise HTTPException(status_code=401, detail=f"Invalid {provider_name} API key")
        logger.error(f"{req.provider} API error: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"{req.provider} API error: {error_msg}")

    if req.mode.startswith("refresh_"):
        from parser import _strip_to_plain  # type: ignore[attr-defined]
        text = raw_text.strip()
        if req.mode == "refresh_title":
            return GenerateResponse(title=text)
        if req.mode == "refresh_styles":
            return GenerateResponse(styles=text)
        if req.mode == "refresh_exclude":
            return GenerateResponse(exclude_styles=text)
        # refresh_lyrics
        return GenerateResponse(lyrics=text, plain_lyrics=_strip_to_plain(text))

    if req.mode in ("theme_draft", "builder_draft"):
        parsed = parse_draft_response(raw_text)
    else:
        parsed = parse_full_response(raw_text)

    return GenerateResponse(
        styles=parsed["styles"],
        exclude_styles=parsed["exclude_styles"],
        lyrics=parsed["lyrics"],
        plain_lyrics=parsed["plain_lyrics"],
        analysis=AnalysisOutput(**parsed["analysis"]),
    )


@app.post("/api/album-cover", response_model=AlbumCoverResponse)
async def album_cover(req: AlbumCoverRequest):
    prompt = ALBUM_COVER_PROMPT.format(
        plain_lyrics=req.plain_lyrics[:2000],
        styles=req.styles[:500] if req.styles else "cinematic, moody, atmospheric",
    )

    api_key = _resolve_api_key("gemini", req.api_key)
    if not api_key:
        raise HTTPException(
            status_code=500, detail="Server is missing GEMINI_API_KEY env var",
        )

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_images(
            model=req.model,
            prompt=prompt,
            config=genai.types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
                image_size="1K",
            ),
        )

        if not response.generated_images:
            reasons = []
            for attr in ("rai_filtered_reasons", "positive_prompt_safety_attributes"):
                val = getattr(response, attr, None)
                if val:
                    reasons.append(f"{attr}={val}")
            detail = "No image was generated"
            if reasons:
                detail += f" (likely safety filter: {'; '.join(reasons)})"
            else:
                detail += f" \u2014 model '{req.model}' returned empty result. Try a different model."
            raise HTTPException(status_code=502, detail=detail)

        image = response.generated_images[0].image
        image_b64 = base64.b64encode(image.image_bytes).decode("utf-8")

        return AlbumCoverResponse(
            image_base64=image_b64,
            mime_type=image.mime_type or "image/png",
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "401" in error_msg or "403" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid Gemini API key")
        logger.error(f"Imagen API error: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"Imagen API error: {error_msg}")
