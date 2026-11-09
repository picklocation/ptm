import test from "node:test";
import assert from "node:assert/strict";
import {
  isDatabaseUnavailable,
  publicReadDeadline,
} from "../src/lib/service-errors";
test("database availability classification does not hide access or programming errors", () => {
  assert.equal(
    isDatabaseUnavailable({ code: 8, message: "Quota exceeded." }),
    true,
  );
  assert.equal(isDatabaseUnavailable(new Error("Quota exceeded.")), true);
  assert.equal(
    isDatabaseUnavailable({ code: 7, message: "Permission denied" }),
    false,
  );
  assert.equal(isDatabaseUnavailable(new TypeError("Bad data")), false);
});
test("public read timeout is bounded and successful reads are preserved", async () => {
  assert.equal(await publicReadDeadline(Promise.resolve("value"), 50), "value");
  await assert.rejects(
    publicReadDeadline(new Promise(() => {}), 10),
    /Database timeout/,
  );
});
