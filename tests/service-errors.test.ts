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
import { resilient } from "../src/lib/service-errors";
test("resilient serves fresh data when the read succeeds", async () => {
  const read = resilient(async () => [1, 2]);
  assert.deepEqual(await read(), { items: [1, 2], unavailable: false });
});
test("resilient serves the last good snapshot during an outage", async () => {
  let fail = false;
  const read = resilient(async () => {
    if (fail) throw { code: 8, message: "Quota exceeded." };
    return ["a"];
  });
  await read();
  fail = true;
  assert.deepEqual(await read(), { items: ["a"], unavailable: false });
});
test("resilient reports unavailable when there is no snapshot", async () => {
  const read = resilient(async () => {
    throw { code: "UNAVAILABLE" };
  });
  assert.deepEqual(await read(), { items: [], unavailable: true });
});
test("resilient rethrows non-outage errors", async () => {
  const read = resilient(async () => {
    throw new Error("permission denied");
  });
  await assert.rejects(read(), /permission denied/);
});
test("resilient recovers once the database comes back", async () => {
  let fail = true;
  const read = resilient(async () => {
    if (fail) throw { code: 14 };
    return ["fresh"];
  });
  assert.equal((await read()).unavailable, true);
  fail = false;
  assert.deepEqual(await read(), { items: ["fresh"], unavailable: false });
});
