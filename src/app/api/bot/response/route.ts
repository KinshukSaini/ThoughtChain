import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "../bot";

export async function POST(req: NextRequest) {
  try {
    console.log("[API] Received POST request to /api/bot/response");
    const body = await req.json();
    console.log("[API] Request body:", { input: body.input, messageCount: body.messages?.length });
    const { input, messages } = body;

    if (!input || !messages) {
      console.log("[API] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: input and messages" },
        { status: 400 }
      );
    }

    console.log("[API] Calling generateResponse...");
    const response = await generateResponse(input, messages);
    console.log("[API] Response generated:", response.substring(0, 100) + "...");

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("[API] Error generating response:", error);
    console.error("[API] Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });
    
    // Return more detailed error to client
    return NextResponse.json(
      { 
        error: "Failed to generate response",
        details: error.message,
        isQuotaError: error.status === 429
      },
      { status: 500 }
    );
  }
}
