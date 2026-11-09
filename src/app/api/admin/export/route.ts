import { requireStaff, errorResponse } from "@/lib/auth";
import { list, put } from "@/lib/store";
import { columns, values, makeWorkbook } from "@/lib/excel";
import type { Enquiry } from "@/lib/types";
import { randomUUID } from "node:crypto";
export async function GET(req: Request) {
  try {
    const staff = await requireStaff("enquiries");
    const url = new URL(req.url);
    let records = await list<Enquiry>("enquiries");
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.toLowerCase();
    if (status) records = records.filter((x) => x.status === status);
    if (q)
      records = records.filter((x) =>
        `${x.name} ${x.email} ${x.phone} ${x.destination}`
          .toLowerCase()
          .includes(q),
      );
    await put("auditEvents", randomUUID(), {
      at: new Date().toISOString(),
      actor: staff.email,
      action: "exported enquiries",
      item: `${records.length} records`,
    });
    if (url.searchParams.get("format") === "xlsx") {
      const buffer = await makeWorkbook(records).xlsx.writeBuffer();
      return new Response(new Uint8Array(buffer as ArrayBuffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition":
            'attachment; filename="pickthemap-enquiries.xlsx"',
          "Cache-Control": "no-store",
        },
      });
    }
    const escape = (v: string) => '"' + v.replaceAll('"', '""') + '"';
    const csv = [columns.map(([, name]) => name), ...records.map(values)]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    return new Response("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="pickthemap-enquiries.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
