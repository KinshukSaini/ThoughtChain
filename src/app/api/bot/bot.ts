import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper: Generate a response to the user's question
export async function generateResponse(input: string, messages: Array<{role: string, content: string}>) {
  console.log("[generateResponse] Called with input:", input);
  console.log("[generateResponse] Message history length:", messages.length);
  
  const conversationHistory = messages.map(msg => 
    `${msg.role === 'user' ? 'Student' : 'ThoughtChain'}: ${msg.content}`
  ).join('\n');

  const prompt = `You are ThoughtChain, an AI study assistant helping students prepare for exams.
Based on the conversation history and the user's question, provide a helpful, clear, and educational response.

Conversation History:
${conversationHistory}

Current question:
${input}

Provide a direct, helpful answer to the user's question. Keep it educational and relevant to their studies. keep it concise (50 words) and to the point with markdown formatting where appropriate.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  
  return response.text();
}

// Helper: decide whether to create a node using the agent.
export async function decideCreateNode(input: string, state: any) {
  const prompt = `you are thought chain agent that is made to help students study in exam by automatically creating nodes for the mindmap, your task is to decide whether a new node should be created based on the user input and the current state of the mindmap.\n
  Respond ONLY with a single valid JSON object with two keys: \n- createNode: 'yes'/ 'no' (tells the system whether to make a new node or not)\n- title: if yes, then the title for the node , if no then just null\nMake sure the response is parseable JSON. The current state is:\n${JSON.stringify(
    state,
    null,
    2
  )}\n\nUser request:\n${input}\n\n
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const raw = response.text();

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    parsed = raw;
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
