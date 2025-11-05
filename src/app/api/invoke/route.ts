import { NextRequest, NextResponse } from "next/server";
import { bedrockClient } from "@/lib/bedrock/client";

export async function POST(request: NextRequest) {
  try {
    const { modelId, prompt, params, stream } = await request.json();

    if (!modelId || !prompt) {
      return NextResponse.json(
        { error: "modelId and prompt are required" },
        { status: 400 }
      );
    }

    if (stream) {
      // For streaming responses
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            await bedrockClient.invokeModelStream(
              modelId,
              prompt,
              params,
              (text) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                );
              }
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // For non-streaming responses
      const response = await bedrockClient.invokeModel(modelId, prompt, params);
      return NextResponse.json(response);
    }
  } catch (error: any) {
    console.error("Error invoking model:", error);
    return NextResponse.json(
      { error: error.message || "Failed to invoke model" },
      { status: 500 }
    );
  }
}
