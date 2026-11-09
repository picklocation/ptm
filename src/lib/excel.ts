import ExcelJS from "exceljs";
import { mkdir, rename, open, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { list, get, put } from "./store";
import type { Enquiry } from "./types";
export const columns = [
  ["id", "Enquiry ID"],
  ["createdAt", "Submitted at"],
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["destination", "Destination"],
  ["itemTitle", "Trip / resort"],
  ["kind", "Trip type"],
  ["startDate", "Start date"],
  ["endDate", "End date"],
  ["flexible", "Flexible dates"],
  ["adults", "Adults"],
  ["children", "Children"],
  ["childAges", "Children ages"],
  ["rooms", "Rooms"],
  ["departure", "Departure city"],
  ["budget", "Budget"],
  ["currency", "Currency"],
  ["budgetBasis", "Budget basis"],
  ["preferences", "Preferences"],
  ["vehicle", "Vehicle / luggage"],
  ["mealPlan", "Meal plan"],
  ["contactMethod", "Contact preference"],
  ["method", "Submission method"],
  ["status", "Admin status"],
  ["assignedTo", "Admin assigned to"],
  ["followUp", "Admin follow-up"],
  ["updatedAt", "Updated at"],
  ["notes", "Latest admin note"],
  ["demo", "Development record"],
] as const;
const manual = [
  "Tracking status",
  "Tracking notes",
  "Tracking owner",
  "Tracking follow-up",
];
export function safeCell(v: unknown) {
  const s = typeof v === "boolean" ? (v ? "Yes" : "No") : String(v ?? "");
  return /^[=+@\-\t\r]/.test(s) ? "'" + s : s;
}
export function values(e: Enquiry) {
  return columns.map(([key]) =>
    safeCell(key === "notes" ? e.notes.at(-1)?.text || "" : e[key]),
  );
}
function tableColumns() {
  return [
    ...columns.map(([, name]) => ({ name, filterButton: true })),
    ...manual.map((name) => ({ name, filterButton: true })),
  ];
}
export function makeWorkbook(enquiries: Enquiry[]) {
  const w = new ExcelJS.Workbook();
  const s = w.addWorksheet("Enquiries", {
    views: [{ state: "frozen", ySplit: 1, xSplit: 2 }],
  });
  s.addTable({
    name: "PickTheMapEnquiries",
    ref: "A1",
    headerRow: true,
    style: { theme: "TableStyleMedium4", showRowStripes: true },
    columns: tableColumns(),
    rows: enquiries.map((e) => [...values(e), "", "", "", ""]),
  });
  s.columns.forEach((c, i) => {
    c.width = i === 0 ? 38 : i === 19 ? 45 : 22;
  });
  s.getRow(1).height = 30;
  return w;
}
export async function syncExcel() {
  const target = path.resolve(
    process.env.EXCEL_PATH ||
      path.join(process.cwd(), ".local", "enquiries.xlsx"),
  );
  if (!target.toLowerCase().endsWith(".xlsx"))
    throw new Error("EXCEL_PATH must name an .xlsx file.");
  await mkdir(path.dirname(target), { recursive: true });
  const lockPath = target + ".lock";
  const lock = await open(lockPath, "wx");
  const pending = (
    await list<{ id: string; status: string; attempts: number }>("excelJobs")
  ).filter((j) => j.status !== "synced");
  try {
    if (!pending.length) return { synced: 0, path: target };
    let workbook = new ExcelJS.Workbook();
    let exists = false;
    try {
      await stat(target);
      exists = true;
    } catch {}
    if (exists) await workbook.xlsx.readFile(target);
    else workbook = makeWorkbook([]);
    const sheet = workbook.getWorksheet("Enquiries");
    if (!sheet)
      throw new Error(
        "Workbook needs an Enquiries sheet. Use a separate new workbook for this integration.",
      );
    if (!sheet.getTable("PickTheMapEnquiries"))
      throw new Error("Workbook needs the PickTheMapEnquiries table.");
    for (let i = 0; i < columns.length; i++)
      if (sheet.getRow(1).getCell(i + 1).text !== columns[i][1])
        throw new Error(
          "Workbook columns have changed; restore the managed headings before retrying.",
        );
    const rows: ExcelJS.CellValue[][] = [];
    for (let n = 2; n <= sheet.rowCount; n++) {
      const r = sheet.getRow(n);
      if (r.getCell(1).text)
        rows.push(
          Array.from(
            { length: columns.length + manual.length },
            (_, i) => r.getCell(i + 1).value,
          ),
        );
    }
    const records: Enquiry[] = [];
    for (const job of pending) {
      const e = await get<Enquiry>("enquiries", job.id);
      if (!e) continue;
      records.push(e);
      const index = rows.findIndex((r) => String(r[0]) === e.id);
      const retained =
        index >= 0 ? rows[index].slice(columns.length) : ["", "", "", ""];
      const row = [...values(e), ...retained];
      if (index >= 0) rows[index] = row;
      else rows.push(row);
    }
    // Loaded tables need rebuilding from worksheet values. Owner tracking stays intact.
    sheet.removeTable("PickTheMapEnquiries");
    sheet.addTable({
      name: "PickTheMapEnquiries",
      ref: "A1",
      headerRow: true,
      style: { theme: "TableStyleMedium4", showRowStripes: true },
      columns: tableColumns(),
      rows,
    });
    const temp = target + ".pending.xlsx";
    await workbook.xlsx.writeFile(temp);
    await rename(temp, target);
    for (const e of records) {
      await put("excelJobs", e.id, {
        id: e.id,
        status: "synced",
        attempts: 0,
        updatedAt: new Date().toISOString(),
      });
      const current = await get<Enquiry>("enquiries", e.id);
      if (current?.updatedAt === e.updatedAt)
        await put("enquiries", e.id, { ...current, excelStatus: "synced" });
      else if (current)
        await put("excelJobs", e.id, {
          id: e.id,
          status: "pending",
          attempts: 0,
          updatedAt: current.updatedAt,
        });
    }
    return { synced: records.length, path: target };
  } catch (error) {
    for (const job of pending)
      await put("excelJobs", job.id, {
        ...job,
        status: "failed",
        attempts: job.attempts + 1,
        error: "Workbook update failed; check file lock, path and permissions.",
        updatedAt: new Date().toISOString(),
      });
    throw error;
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}
