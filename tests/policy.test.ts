import test from "node:test";
import assert from "node:assert/strict";
import { parsePolicy } from "../src/lib/policy";
import { legalDefaults } from "../src/lib/legal-defaults";
test("policy markup becomes headings, paragraphs and lists", () => {
  assert.deepEqual(
    parsePolicy("# One\nIntro line\nsecond line\n\n- a\n- b\n\nEnd"),
    [
      { type: "heading", text: "One" },
      { type: "paragraph", text: "Intro line\nsecond line" },
      { type: "list", items: ["a", "b"] },
      { type: "paragraph", text: "End" },
    ],
  );
  // Plain text written in admin still reads as paragraphs.
  assert.deepEqual(parsePolicy("Just a paragraph.\n\nAnother."), [
    { type: "paragraph", text: "Just a paragraph." },
    { type: "paragraph", text: "Another." },
  ]);
  // Markup characters are plain text, never HTML.
  assert.equal(parsePolicy("<b>x</b>")[0].type, "paragraph");
});
test("default policies are complete and make no refund promises", () => {
  for (const [key, text] of Object.entries(legalDefaults)) {
    const blocks = parsePolicy(text);
    assert.ok(blocks.filter((b) => b.type === "heading").length >= 5, key);
    assert.doesNotMatch(
      text,
      /not been published|placeholder|lorem|TODO/i,
      key,
    );
    // No invented percentages or refund deadlines.
    assert.doesNotMatch(
      text,
      /\d+\s?%|within \d+|\d+ (working |business )?days/i,
      key,
    );
  }
  // The privacy text matches how the website works.
  assert.match(legalDefaults.privacy, /Supabase/);
  assert.match(
    legalDefaults.privacy,
    /do not use advertising or analytics cookies/,
  );
});
