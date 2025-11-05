import { NextResponse } from "next/server";
import { BEDROCK_MODELS, getAllProviders } from "@/lib/bedrock/models";

export async function GET() {
  try {
    return NextResponse.json({
      models: BEDROCK_MODELS,
      providers: getAllProviders(),
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
