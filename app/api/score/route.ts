import { scoreAssessment, validateResponses } from "../../../lib/assessment/scoring.server";
import { isValidSessionToken } from "../../../lib/assessment/session.server";
import type { QualityRecord, ResponseRecord } from "../../../lib/assessment/types";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type ScoreBody = {
  token?: string;
  responses?: ResponseRecord[];
  quality?: QualityRecord;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScoreBody;
    if (
      !body.token ||
      !isValidSessionToken(body.token) ||
      !Array.isArray(body.responses) ||
      !validateResponses(body.responses) ||
      !body.quality
    ) {
      return Response.json({ error: "資料不完整或階段失效，請返回測驗後重試。" }, { status: 400 });
    }
    const result = scoreAssessment(body.token, body.responses, body.quality);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Score route error:", error);
    return Response.json({ error: "無法計算本次結果，請再試一次。" }, { status: 400 });
  }
}
