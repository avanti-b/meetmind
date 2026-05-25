import json
from datetime import datetime, timezone

from groq import Groq
from fastapi import HTTPException, status

from app.core.config import settings


# Lazy client — only instantiated when first used
_client: Groq | None = None


def _get_client() -> Groq:
    global _client

    if _client is None:
        if not settings.GROQ_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Groq API key is not configured",
            )

        _client = Groq(
            api_key=settings.GROQ_API_KEY
        )

    return _client


# ─── Prompt ───────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert meeting analyst.

Your job is to extract structured intelligence from meeting transcripts.

You MUST respond with ONLY valid JSON.

The JSON must contain exactly these three keys:

{
  "summary": "...",
  "action_items": "...",
  "decisions": "..."
}

Rules:
- summary = concise 2-4 sentence overview
- action_items = newline-separated bullet list starting with "- "
- decisions = newline-separated bullet list starting with "- "
- If nothing exists for a category, return "None identified."
"""

USER_PROMPT_TEMPLATE = """Analyze the following meeting transcript:

---
{transcript}
---

Return ONLY valid JSON.
"""


# ─── AI Service ───────────────────────────────────────────────────────────────

class AIService:

    def analyze_transcript(self, transcript: str) -> dict:

        if not transcript or not transcript.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Cannot analyze an empty transcript.",
            )

        client = _get_client()

        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                temperature=0.2,
                max_tokens=1500,
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": USER_PROMPT_TEMPLATE.format(
                            transcript=transcript[:12000]
                        ),
                    },
                ],
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq request failed: {str(e)}",
            )

        raw_content = response.choices[0].message.content or ""

        # Extract JSON safely even if model adds extra text
        try:
            start = raw_content.find("{")
            end = raw_content.rfind("}") + 1

            if start == -1 or end == 0:
                raise ValueError("No JSON object found")

            json_content = raw_content[start:end]

            parsed = json.loads(json_content)

        except Exception:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI returned malformed JSON. Raw response: {raw_content}",
            )

        required_keys = {
            "summary",
            "action_items",
            "decisions"
        }

        missing = required_keys - parsed.keys()

        if missing:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI response missing expected fields: {missing}",
            )

        return {
            "summary": str(parsed["summary"]).strip(),
            "action_items": str(parsed["action_items"]).strip(),
            "decisions": str(parsed["decisions"]).strip(),
            "analyzed_at": datetime.now(timezone.utc),
        }