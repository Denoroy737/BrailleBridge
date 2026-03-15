/**
 * src/app/api/convert/route.ts
 * POST /api/convert
 * Body: { text: string; direction: "encode"|"decode"; grade?: 1|2 }
 */

import { NextRequest, NextResponse } from "next/server";
import { encodeToBraille }          from "@/lib/braille/encoder";
import { decodeFromBraille }        from "@/lib/braille/decoder";
import { encodeToGrade2Braille }    from "@/lib/braille/grade2/encoder2";
import { decodeFromGrade2Braille }  from "@/lib/braille/grade2/decoder2";

interface ConvertRequest {
  text:      string;
  direction: "encode" | "decode";
  grade?:    1 | 2;
}

interface ConvertResponse {
  result:    string;
  warnings?: string[] | undefined;
}

interface ErrorResponse { error: string }

export async function POST(
  req: NextRequest
): Promise<NextResponse<ConvertResponse | ErrorResponse>> {
  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ErrorResponse>({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof body !== "object" || body === null ||
    !("text"      in body) ||
    !("direction" in body)
  ) {
    return NextResponse.json<ErrorResponse>(
      { error: 'Body must include "text" and "direction".' }, { status: 400 }
    );
  }

  const raw = body as Record<string, unknown>;
  const text      = raw["text"];
  const direction = raw["direction"];
  const gradeRaw  = raw["grade"] ?? 1;

  if (typeof text !== "string")
    return NextResponse.json<ErrorResponse>({ error: '"text" must be a string.' }, { status: 400 });
  if (direction !== "encode" && direction !== "decode")
    return NextResponse.json<ErrorResponse>(
      { error: '"direction" must be "encode" or "decode".' }, { status: 400 }
    );
  if (gradeRaw !== 1 && gradeRaw !== 2)
    return NextResponse.json<ErrorResponse>(
      { error: '"grade" must be 1 or 2.' }, { status: 400 }
    );
  if (text.length > 50_000)
    return NextResponse.json<ErrorResponse>(
      { error: "Input too long (max 50,000 characters)." }, { status: 413 }
    );

  const grade = gradeRaw as 1 | 2;

  try {
    if (direction === "encode") {
      const result = grade === 2
        ? encodeToGrade2Braille(text)
        : encodeToBraille(text);
      return NextResponse.json<ConvertResponse>({ result });
    } else {
      const { text: result, warnings } = grade === 2
        ? decodeFromGrade2Braille(text)
        : decodeFromBraille(text);
      return NextResponse.json<ConvertResponse>({
        result,
        ...(warnings.length > 0 ? { warnings } : {}),
      });
    }
  } catch (err) {
    console.error("[BrailleBridge API] Conversion error:", err);
    return NextResponse.json<ErrorResponse>({ error: "Internal conversion error." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
