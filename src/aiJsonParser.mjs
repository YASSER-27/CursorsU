function removeTrailingCommas(text) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (inString) {
      result += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      result += character;
      continue;
    }

    if (character === ",") {
      let next = i + 1;
      while (/\s/.test(text[next] || "")) next++;
      if (text[next] === "}" || text[next] === "]") continue;
    }

    result += character;
  }

  return result;
}

function escapeInvalidStringCharacters(text) {
  let result = "";
  let inString = false;

  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    if (!inString) {
      result += character;
      if (character === '"') inString = true;
      continue;
    }

    if (character === '"') {
      result += character;
      inString = false;
      continue;
    }

    if (character === "\\") {
      const next = text[i + 1];
      if (next === "'" ) {
        result += "'";
        i++;
        continue;
      }
      if (["\"", "\\", "/", "b", "f", "n", "r", "t"].includes(next)) {
        result += character + next;
        i++;
        continue;
      }
      if (next === "u" && /^[\da-f]{4}$/i.test(text.slice(i + 2, i + 6))) {
        result += text.slice(i, i + 6);
        i += 5;
        continue;
      }
      result += "\\\\";
      continue;
    }

    if (character === "\n") result += "\\n";
    else if (character === "\r") result += "\\r";
    else if (character === "\t") result += "\\t";
    else if (character.charCodeAt(0) < 0x20) {
      result += `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
    } else result += character;
  }

  return result;
}

function parseCandidate(text) {
  const attempts = [
    text,
    removeTrailingCommas(text),
    removeTrailingCommas(escapeInvalidStringCharacters(text))
  ];

  for (const candidate of attempts) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === "object" && !Array.isArray(value)) return value;
      if (typeof value === "string") {
        const nested = JSON.parse(value);
        if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested;
      }
    } catch {}
  }

  return null;
}

function findObjectEnd(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const character = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') inString = true;
    else if (character === "{") depth++;
    else if (character === "}" && --depth === 0) return i;
  }

  return -1;
}

export function parseAiJsonResponse(raw) {
  const text = String(raw || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const direct = parseCandidate(text);
  if (direct) return direct;

  for (let start = text.indexOf("{"); start >= 0; start = text.indexOf("{", start + 1)) {
    const end = findObjectEnd(text, start);
    if (end < 0) continue;
    const parsed = parseCandidate(text.slice(start, end + 1));
    if (parsed) return parsed;
    start = end;
  }

  throw new Error("AI returned malformed JSON. Try again or select a model that supports JSON output.");
}
