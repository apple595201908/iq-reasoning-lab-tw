import { createSession } from "../../../lib/assessment/session.server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST() {
  return Response.json(createSession(), {
    headers: { "Cache-Control": "no-store" },
  });
}
