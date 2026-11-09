import fs from "node:fs";
let env = fs.readFileSync(".env.local", "utf8");
const vars = {
  DATA_BACKEND: "firebase",
  FIREBASE_PROJECT_ID: "demo-pickthemap",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:9199",
  FIREBASE_STORAGE_BUCKET: "demo-pickthemap.appspot.com",
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-pickthemap-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "localhost",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-pickthemap",
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL: "http://127.0.0.1:9099",
};
for (const [key, value] of Object.entries(vars)) {
  const re = new RegExp("^" + key + "=.*$", "m");
  env = re.test(env)
    ? env.replace(re, key + "=" + value)
    : env + "\n" + key + "=" + value;
}
fs.writeFileSync(".env.local", env + "\n");
console.log(
  "Local environment configured for the Firebase emulators. No secrets were printed.",
);
