"""Vercel serverless function — POST /api/album-cover.

Two-step pipeline to keep raw lyrics out of Imagen:
  1. Gemini text model distills lyrics + styles + title into a short visual
     scene description (mood, imagery, symbolism — NO literal lyric text).
  2. Imagen renders artwork from that scene description only.

This prevents Imagen from treating the lyric block as text to render onto
the canvas. Title/typography and the Adrift logo are composited client-side
by coverCompositor.ts, so the image must remain text-free.
"""

import base64
import json
import os
from http.server import BaseHTTPRequestHandler

# ---------------------------------------------------------------------------
# Step 1 — Gemini text: lyrics → visual scene description
# ---------------------------------------------------------------------------
_SCENE_SYSTEM_PROMPT = """\
You are an art director briefing a visual artist for an album cover. You will \
receive a song's title, musical style, and lyrics. Your job is to translate \
the song's ESSENCE into a short visual scene description that an image model \
can render.

HARD RULES:
- Output 80-130 words, a single flowing paragraph.
- Describe IMAGERY ONLY — subject, setting, atmosphere, color palette, \
lighting, textures, composition. No meta-commentary, no headers.
- Do NOT quote or paraphrase any lyric lines. Do NOT mention the song title, \
the artist, text, typography, letters, words, logos, captions, watermarks, \
or anything written.
- Translate the song's emotional core and themes into surreal, cinematic \
visual symbolism — not literal illustration of lyric events.
- Center on ONE massive, surreal subject in the mid-ground against a natural \
landscape with cinematic depth.
- Match color palette and mood to the song's emotional arc and genre.
- Keep the top ~15% and bottom ~12% visually simpler/darker so text can be \
overlaid later (do not mention this to the image model — just compose for it).

Start your response directly with the scene description. No preamble."""


def _build_scene_user_input(title: str, styles: str, plain_lyrics: str) -> str:
    return (
        f"SONG TITLE: {title or '(untitled)'}\n\n"
        f"MUSICAL STYLE: {styles or 'cinematic, moody, atmospheric'}\n\n"
        f"LYRICS (for thematic essence only — do NOT quote, paraphrase, or "
        f"render as text):\n{plain_lyrics}"
    )


# ---------------------------------------------------------------------------
# Step 2 — Imagen prompt template (wraps the scene description)
# ---------------------------------------------------------------------------
_IMAGEN_TEMPLATE = """\
Album cover ARTWORK ONLY — purely visual, no text of any kind.

SCENE:
{scene}

STYLE DIRECTION:
- Surreal, cinematic, editorial, gallery-worthy composition
- Rich vibrant colors, high contrast, dynamic lighting
- Dynamic textures where fitting: iridescent glass, bioluminescence, liquid \
metal, ethereal mist, volumetric haze
- Square 1:1 aspect ratio
- Top ~15% and bottom ~12% slightly darker / simpler (reserved for overlays)

ABSOLUTELY CRITICAL — the image must contain ZERO text:
- No letters, no words, no numbers, no typography, no captions
- No logos, no watermarks, no signatures, no stamps
- No signs, no labels, no billboards, no writing on any object
- No books, newspapers, posters, or screens with readable content
- Pure visual artwork only."""


def _json_response(handler: BaseHTTPRequestHandler, status: int, body: dict) -> None:
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(json.dumps(body).encode("utf-8"))


def _generate_scene_description(
    api_key: str, title: str, styles: str, plain_lyrics: str
) -> str:
    """Distill lyrics into a visual scene description. Falls back to a
    style-only prompt if the text call fails."""
    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        user_input = _build_scene_user_input(title, styles, plain_lyrics)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_input,
            config=genai.types.GenerateContentConfig(
                system_instruction=_SCENE_SYSTEM_PROMPT,
            ),
        )
        text = (response.text or "").strip()
        if text:
            return text
    except Exception:  # noqa: BLE001
        pass

    # Fallback: style-only scene so Imagen never sees raw lyrics even if
    # the distillation step fails.
    return (
        f"A single massive surreal subject dominating the mid-ground of a "
        f"cinematic natural landscape, its form and materials evoking the "
        f"mood of {styles or 'cinematic, atmospheric music'}. Dramatic "
        f"lighting, rich color palette, editorial composition, ethereal "
        f"atmosphere."
    )


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):  # noqa: N802
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(length).decode("utf-8"))
        except (json.JSONDecodeError, ValueError):
            _json_response(self, 400, {"detail": "Invalid JSON body"})
            return

        plain_lyrics = (body.get("plain_lyrics") or "")[:2000]
        styles = (body.get("styles") or "cinematic, moody, atmospheric")[:500]
        song_title = (body.get("song_title") or "")[:200]
        model = body.get("model", "imagen-4.0-fast-generate-001")

        if not plain_lyrics:
            _json_response(self, 400, {"detail": "plain_lyrics is required"})
            return

        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            _json_response(
                self,
                500,
                {"detail": "Server is missing GEMINI_API_KEY \u2014 set it in Vercel env vars"},
            )
            return

        scene = _generate_scene_description(api_key, song_title, styles, plain_lyrics)
        prompt = _IMAGEN_TEMPLATE.format(scene=scene)

        try:
            from google import genai

            client = genai.Client(api_key=api_key)
            response = client.models.generate_images(
                model=model,
                prompt=prompt,
                config=genai.types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="1:1",
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
                    detail += f" \u2014 model '{model}' returned empty result. Try a different model."
                _json_response(self, 502, {"detail": detail})
                return
            image = response.generated_images[0].image
            image_b64 = base64.b64encode(image.image_bytes).decode("utf-8")
            _json_response(
                self,
                200,
                {
                    "image_base64": image_b64,
                    "mime_type": image.mime_type or "image/png",
                },
            )
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            if "API key" in msg or "401" in msg or "403" in msg:
                _json_response(self, 401, {"detail": "Invalid Gemini API key"})
            else:
                _json_response(self, 502, {"detail": f"Imagen API error: {msg}"})
