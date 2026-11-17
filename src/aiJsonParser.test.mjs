import assert from "node:assert/strict";
import test from "node:test";
import { parseAiJsonResponse } from "./aiJsonParser.mjs";

test("parses a fenced response with a trailing comma", () => {
  const result = parseAiJsonResponse('```json\n{"name":"Cursor","parts":["shine",],}\n```');
  assert.deepEqual(result, { name: "Cursor", parts: ["shine"] });
});

test("extracts the JSON object after prose and braces inside strings", () => {
  const result = parseAiJsonResponse('Note: {not JSON}\n{"name":"Cursor {with} braces","settings":{"ok":true}}');
  assert.deepEqual(result, { name: "Cursor {with} braces", settings: { ok: true } });
});

test("repairs raw line breaks and Windows path escapes in model strings", () => {
  const raw = String.raw`{"name":"Line one
Line two","path":"C:\work\cursor","parts":["shine",]}`;
  const result = parseAiJsonResponse(raw);
  assert.equal(result.name, "Line one\nLine two");
  assert.equal(result.path, "C:\\work\\cursor");
});

test("reports a useful error when no JSON object can be parsed", () => {
  assert.throws(
    () => parseAiJsonResponse("I could not produce a cursor preset."),
    /malformed JSON/
  );
});
