"""Parse Gemini responses using delimiter-based section extraction."""

import re


def parse_full_response(raw: str) -> dict:
    """Parse a full Gemini response (ANALYSIS + STYLES + EXCLUDE + LYRICS) into sections."""
    sections = _split_sections(raw)

    analysis_raw = sections.get("analysis", "")
    analysis = _parse_analysis(analysis_raw)

    lyrics = sections.get("lyrics", "").strip()

    return {
        "styles": sections.get("styles", "").strip(),
        "exclude_styles": sections.get("exclude", "").strip(),
        "lyrics": lyrics,
        "plain_lyrics": _strip_to_plain(lyrics),
        "analysis": analysis,
    }


def parse_draft_response(raw: str) -> dict:
    """Parse a draft-only Gemini response (LYRICS only) into sections."""
    sections = _split_sections(raw)

    lyrics = sections.get("lyrics", raw.strip())

    return {
        "styles": "",
        "exclude_styles": "",
        "lyrics": lyrics,
        "plain_lyrics": _strip_to_plain(lyrics),
        "analysis": {"vibe_dna": "", "phonetic_mapping": "", "semantic_weight": ""},
    }


def _split_sections(raw: str) -> dict[str, str]:
    """Split raw text on ---SECTION--- delimiters."""
    sections: dict[str, str] = {}
    current_section: str | None = None
    current_lines: list[str] = []

    for line in raw.split("\n"):
        stripped = line.strip()
        match = re.match(r"^---([A-Z]+)---$", stripped)
        if match:
            if current_section is not None:
                sections[current_section] = "\n".join(current_lines)
            current_section = match.group(1).lower()
            current_lines = []
        else:
            current_lines.append(line)

    if current_section is not None:
        sections[current_section] = "\n".join(current_lines)

    return sections


def _parse_analysis(raw: str) -> dict:
    """Extract Vibe DNA, Phonetic Mapping, Semantic Weight from analysis text."""
    result = {"vibe_dna": "", "phonetic_mapping": "", "semantic_weight": ""}

    field_map = {
        "vibe dna": "vibe_dna",
        "phonetic mapping": "phonetic_mapping",
        "semantic weight": "semantic_weight",
    }

    current_field: str | None = None
    current_lines: list[str] = []

    for line in raw.split("\n"):
        matched = False
        for label, key in field_map.items():
            pattern = rf"^\**{re.escape(label)}\**\s*:\s*(.*)"
            m = re.match(pattern, line.strip(), re.IGNORECASE)
            if m:
                if current_field is not None:
                    result[current_field] = "\n".join(current_lines).strip()
                current_field = key
                current_lines = [m.group(1)] if m.group(1) else []
                matched = True
                break
        if not matched and current_field is not None:
            current_lines.append(line)

    if current_field is not None:
        result[current_field] = "\n".join(current_lines).strip()

    return result


# Section tags to convert to plain labels (keep as section headers)
_SECTION_LABELS = {
    "intro": "Intro",
    "verse": "Verse",
    "verse 1": "Verse 1",
    "verse 2": "Verse 2",
    "verse 3": "Verse 3",
    "pre-chorus": "Pre-Chorus",
    "chorus": "Chorus",
    "post-chorus": "Post-Chorus",
    "bridge": "Bridge",
    "outro": "Outro",
}


def _strip_to_plain(lyrics: str) -> str:
    """Strip Suno metatags and production cues, keeping only section labels and lyric text."""
    lines = lyrics.split("\n")
    result: list[str] = []
    skip_patterns = re.compile(
        r"^\[(?:Title|Style|End|Drum|Synthesizer|Guitar|Bass|Piano|Rhodes|Strings?|Synth|"
        r"Gentle|Rain|Sustained|Electric|Ambient).*\]$",
        re.IGNORECASE,
    )

    for line in lines:
        stripped = line.strip()

        # Skip empty lines (preserve them for spacing)
        if not stripped:
            result.append("")
            continue

        # Skip title, style, end, and instrumental cue-only lines
        if skip_patterns.match(stripped):
            continue

        # Drop all bracketed tags including section labels (Verse/Chorus/Bridge/etc)
        # and production cues. Keep a blank line for visual spacing between stanzas.
        if re.match(r"^\[([^\]]+)\]$", stripped):
            if result and result[-1] != "":
                result.append("")
            continue

        # Remove inline parenthetical backing vocals like (on asphalt black)
        cleaned = re.sub(r"\s*\([^)]*\)\s*", " ", stripped).strip()

        # Remove inline bracketed cues like [Drum Fill]
        cleaned = re.sub(r"\s*\[[^\]]*\]\s*", " ", cleaned).strip()

        if cleaned:
            result.append(cleaned)

    # Clean up excessive blank lines
    text = "\n".join(result)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
