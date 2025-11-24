import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY!,
});

const agent = createAgent({
  model,
});

// Helper: decide whether to create a node using the agent.
export async function decideCreateNode(input: string, state: any) {
  // Build the same prompt used by the POST handler
  const prompt = `you are thought chain agent that is made to help students study in exam by automatically creating nodes for the mindmap, your task is to decide whether a new node should be created based on the user input and the current state of the mindmap.\n
  Respond ONLY with a single valid JSON object with two keys: \n- createNode: yes or no to tell the system whether to make a new node or not\n- title: if yes, then the title for the node , if no then just null\nMake sure the response is parseable JSON. The current state is:\n${JSON.stringify(
    state,
    null,
    2
  )}\n\nUser request:\n${input}\n\n
  `;

  let raw: any;
  const anyAgent = agent as any;
  if (typeof anyAgent.call === "function") {
    raw = await anyAgent.call(prompt);
  } else if (typeof anyAgent.invoke === "function") {
    raw = await anyAgent.invoke(prompt);
  } else if (typeof anyAgent.run === "function") {
    raw = await anyAgent.run(prompt);
  } else {
    raw = `Agent is not callable in this langchain version. Prompt: ${prompt}`;
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    parsed = String(raw);
  }

  // Normalize output
  let create: "yes" | "no" = "no";
  let title: string | null = null;
  const tryExtract = (obj: any) => {
    if (!obj) return;
    const rawCreate = obj.createNode ?? obj.create ?? obj.create_node ?? obj.shouldCreate ?? obj.create?.toString();
    if (typeof rawCreate === "boolean") create = rawCreate ? "yes" : "no";
    else if (typeof rawCreate === "string") create = rawCreate.trim().toLowerCase().startsWith("y") ? "yes" : "no";

    if (create === "no") {
      const free = (obj.message ?? obj.text ?? obj.reply ?? "").toString().toLowerCase();
      if (free.includes("create") && free.includes("yes")) create = "yes";
      else if (free.includes("no")) create = "no";
    }

    const rawTitle = obj.title ?? obj.name ?? obj.nodeTitle ?? null;
    if (typeof rawTitle === "string" && rawTitle.trim() !== "") title = rawTitle.trim();
  };

  if (typeof parsed === "string") {
    const s = parsed.toLowerCase();
    if (s.includes("yes")) create = "yes";
    else if (s.includes("no")) create = "no";
  } else if (typeof parsed === "object") {
    tryExtract(parsed);
  }

  if (create === "no") title = null;
  return { create, title };
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Accept both `{ input, state }` and legacy `{ message, nodes }` shapes.
  const input: string = body.input ?? body.message ?? "";
  const state = body.state ?? body.nodes ?? {};

  // Prompt the LLM to return JSON with a friendly message and an updatedState.
  const prompt = `You are a stateful assistant. The current state is:\n${JSON.stringify(
    state,
    null,
    2
  )}\n\nUser request:\n${input}\n\n
  you are thought chain agent that is made to help students study in exam by automatically creating nodes for the mindmap, your task is to decide whether a new node should be created based on the user input and the current state of the mindmap.\n
  Respond ONLY with a single valid JSON object with two keys: \n- createNode: yes or no to tell the system whether to make a new node or not\n- title: if yes, then the title for the node , if no then just null\nMake sure the response is parseable JSON.`;

  try {

    let raw: any;
    const anyAgent = agent as any;
    if (typeof anyAgent.call === "function") {
      raw = await anyAgent.call(prompt);
    } else if (typeof anyAgent.invoke === "function") {
      raw = await anyAgent.invoke(prompt);
    } else if (typeof anyAgent.run === "function") {
      raw = await anyAgent.run(prompt);
    } else {
      raw = `Agent is not callable in this langchain version. Prompt: ${prompt}`;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      // If the model didn't return strict JSON, fall back to the raw text.
      parsed = String(raw);
    }

    // Normalize the model output to a stable contract: { create: 'yes'|'no', title: string|null }
    let create: "yes" | "no" = "no";
    let title: string | null = null;

    const tryExtract = (obj: any) => {
      if (!obj) return;
      // possible keys from the model
      const rawCreate = obj.createNode ?? obj.create ?? obj.create_node ?? obj.shouldCreate ?? obj.create?.toString();
      if (typeof rawCreate === "boolean") create = rawCreate ? "yes" : "no";
      else if (typeof rawCreate === "string") create = rawCreate.trim().toLowerCase().startsWith("y") ? "yes" : "no";

      // fallback: inspect free text for yes/no hints
      if (create === "no") {
        const free = (obj.message ?? obj.text ?? obj.reply ?? "").toString().toLowerCase();
        if (free.includes("create") && free.includes("yes")) create = "yes";
        else if (free.includes("no")) create = "no";
      }

      const rawTitle = obj.title ?? obj.name ?? obj.nodeTitle ?? null;
      if (typeof rawTitle === "string" && rawTitle.trim() !== "") title = rawTitle.trim();
    };

    if (typeof parsed === "string") {
      // Try to detect yes/no in free-form string
      const s = parsed.toLowerCase();
      if (s.includes("yes")) create = "yes";
      else if (s.includes("no")) create = "no";
    } else if (typeof parsed === "object") {
      tryExtract(parsed);
    }

    if (create === "no") title = null;

    return NextResponse.json({ create, title });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Bot endpoint is live. Send POST {input, state}." });
}
