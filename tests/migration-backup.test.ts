import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { validateBackup } from "../scripts/migration/validate-backup";

async function fixture(records: unknown[], run: (directory: string) => Promise<void>, complete=true) {
  const directory = await mkdtemp(path.join(tmpdir(),"ptm-backup-test-"));
  try {
    const files = {"firestore.json":JSON.stringify(records),"auth-identities.json":"[]"};
    const hashes: Record<string,string> = {};
    const counts: Record<string,number> = {};
    for (const record of records as {path:string;exists:boolean}[]) if(record.exists) counts[record.path.split("/")[0]]=(counts[record.path.split("/")[0]]||0)+1;
    for(const [name,value] of Object.entries(files)) {
      await writeFile(path.join(directory,name),value);
      hashes[name]=createHash("sha256").update(value).digest("hex");
    }
    await writeFile(path.join(directory,"manifest.json"),JSON.stringify({complete,project:"pickthemap-fe68b",counts,authUsers:0,sha256:hashes}));
    await run(directory);
  } finally {
    const relative = path.relative(path.resolve(tmpdir()),path.resolve(directory));
    if (relative.startsWith("..") || path.isAbsolute(relative) || !relative.startsWith("ptm-backup-test-")) throw new Error("Unsafe test cleanup path");
    await rm(path.resolve(directory),{recursive:true,force:true});
  }
}
test("backup validator accepts intact records without changing payloads",async()=>{
  const records=[{path:"content/a",exists:true,data:{id:"a",title:"Original",customField:[1,2]}}];
  await fixture(records,async dir=>assert.deepEqual((await validateBackup(dir)).records,records));
});
test("backup validator rejects incomplete export",async()=>{
  await fixture([],async dir=>{await assert.rejects(validateBackup(dir),/incomplete/);},false);
});
test("backup validator rejects tampering",async()=>{
  await fixture([],async dir=>{await writeFile(path.join(dir,"firestore.json"),"[{}]");await assert.rejects(validateBackup(dir),/checksum/);});
});
test("backup validator blocks broken publication references",async()=>{
  await fixture([{path:"publishedContent/a",exists:true,data:{id:"a",status:"published"}}],async dir=>{await assert.rejects(validateBackup(dir),/parent/);});
});
test("backup validator blocks unmapped collections",async()=>{
  await fixture([{path:"unknown/a",exists:true,data:{id:"a"}}],async dir=>{await assert.rejects(validateBackup(dir),/Unmapped/);});
});
