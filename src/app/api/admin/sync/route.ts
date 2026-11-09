import { requireStaff, checkOrigin, errorResponse } from "@/lib/auth";
import { syncExcel } from "@/lib/excel";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    await requireStaff("enquiries");
    if (process.env.VERCEL)
      return Response.json(
        {
          error:
            "Run the Excel worker on the computer that holds the workbook.",
        },
        { status: 409 },
      );
    const r = await syncExcel();
    return Response.json({ message: `${r.synced} enquiries synced to Excel.` });
  } catch (e) {
    return errorResponse(e);
  }
}
