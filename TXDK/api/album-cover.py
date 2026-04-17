"""Vercel serverless function — POST /api/album-cover.

Always routes to Google Imagen via Gemini — DeepSeek does not support image generation.
The Gemini key comes from the GEMINI_API_KEY Vercel env var.
"""

import base64
import json
import os
from http.server import BaseHTTPRequestHandler

# Inlined from former _prompts.py (avoids Vercel Python bundler dropping
# underscore-prefixed helper modules during function packaging).
_TEMPLATE = """\
Generate album cover ARTWORK ONLY — no text, no typography, no letters, no logos, no watermarks.

LYRICS (derive visual mood, imagery, and symbolism from these):
{plain_lyrics}

MUSICAL STYLE: {styles}

ARTWORK REQUIREMENTS:
- Create a massive, surreal central subject in the mid-ground, inspired by the lyrics
- Natural landscape background with cinematic depth and atmosphere
- The central subject should be surreal, high-contrast, and visually striking against the landscape
- Adapt the color theme and aesthetic to match the emotional core of the lyrics
- Dynamic textures: iridescent glass, bioluminescence, liquid gold, ethereal mist — whatever \
fits the lyrics' mood
- Rich, vibrant color palette with high contrast
- Cinematic lighting, editorial quality, gallery-worthy composition
- Leave the top ~15% of the image as slightly darker/simpler sky area (text will be overlaid later)
- Leave the bottom ~12% slightly darker (branding will be overlaid later)
- Square 1:1 aspect ratio composition
- CRITICAL: Do NOT render ANY text, words, letters, typography, logos, or watermarks anywhere \
in the image. The image must be purely visual artwork."""


def _json_response(handler: BaseHTTPRequestHandler, status: int, body: dict) -> None:
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(json.dumps(body).encode("utf-8"))


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
        model = body.get("model", "imagen-4.0-generate-preview-06-06")

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

        prompt = _TEMPLATE.format(plain_lyrics=plain_lyrics, styles=styles)

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
