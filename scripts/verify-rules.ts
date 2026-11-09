import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
const env = await initializeTestEnvironment({
  projectId: "demo-pickthemap",
  firestore: {
    host: "127.0.0.1",
    port: 8080,
    rules: readFileSync("firestore.rules", "utf8"),
  },
});
try {
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), "publishedContent", "live"), {
      status: "published",
      demo: false,
    });
    await setDoc(doc(c.firestore(), "publishedContent", "demo"), {
      status: "published",
      demo: true,
    });
    await setDoc(doc(c.firestore(), "enquiries", "private"), {
      name: "Private",
    });
  });
  const anonymous = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(anonymous, "publishedContent", "live")));
  await assertFails(getDoc(doc(anonymous, "publishedContent", "demo")));
  await assertFails(getDoc(doc(anonymous, "enquiries", "private")));
  await assertFails(
    setDoc(doc(anonymous, "enquiries", "attack"), { name: "Injected" }),
  );
  const signed = env.authenticatedContext("unprovisioned-user").firestore();
  await assertFails(
    setDoc(doc(signed, "staff", "unprovisioned-user"), { role: "owner" }),
  );
  await assertFails(getDoc(doc(signed, "enquiries", "private")));
  console.log(
    "PASS: Firestore public/private boundaries and privilege escalation checks.",
  );
} finally {
  await env.cleanup();
}
