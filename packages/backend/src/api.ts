import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwk } from "hono/jwk";
import { serve } from "@hono/node-server";
import {
  db,
  getChatMessages,
  updateChatMessageContent,
  updateChatMessageTitle,
} from "@openchat/db";

import { chatTable, messageTable } from "@openchat/db/schema";
import { uuid } from "@openchat/uuid";
import { streamText, generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";

import { auth } from "./auth";

type JWT = {
  mode: "access" | "refresh";
  type: string;
  properties: {
    id: string;
  };
  aud: string;
  iss: string;

  sub: string;
  exp: number;
};

type GroqChatModelId =
  | "deepseek-r1-distill-llama-70b"
  | "gemma2-9b-it"
  | "gemma-7b-it"
  | "llama-3.3-70b-versatile"
  | "llama-3.1-8b-instant"
  | "llama3-70b-8192"
  | "llama3-8b-8192"
  | "mixtral-8x7b-32768"
  | (string & {});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const api = new Hono<{ Variables: { jwtPayload: JWT } }>().basePath("/api");

api.use("*", cors());

api.use(
  "*",
  jwk({
    jwks_uri: `${process.env.AUTH_URL}/.well-known/jwks.json`,
  }),
);

api.get("/user", async (c) => {
  const jwt = c.get("jwtPayload");
  return new Response(jwt.properties.id);
});

api.post("/chat", async (c) => {
  const jwt = c.get("jwtPayload");

  const form = await c.req.formData();

  const chatId = uuid();

  await db.insert(chatTable).values({
    id: chatId,
    ownerId: jwt.sub,
  });

  const messageId = uuid();

  await db.insert(messageTable).values({
    id: messageId,
    chatId: chatId,
    role: form.get("role"),
    content: form.get("message"),
  });

  processMessage(chatId);
  createTitle(chatId, form.get("message") as string);

  return c.json({ chatId });
});

api.post("/chat/:chatId", async (c) => {
  const { chatId } = c.req.param();

  const form = await c.req.formData();

  const messageId = uuid();

  await db.insert(messageTable).values({
    id: messageId,
    chatId: chatId,
    role: form.get("role"),
    content: form.get("message"),
  });

  processMessage(chatId);

  return new Response(null, { status: 200 });
});

auth.route("/", api);

serve({
  fetch: auth.fetch,
  port: 3000,
});

async function processMessage(
  chatId: string,
  modelId: GroqChatModelId = "llama3-8b-8192",
) {
  const messages = await getChatMessages(chatId);

  const messageId = uuid();

  const stream = [];

  await db.insert(messageTable).values({
    id: messageId,
    chatId,
    role: "assistant",
    content: "",
  });

  const { textStream } = streamText({
    model: groq(modelId),
    messages,
  });

  for await (const part of textStream) {
    stream.push(part);
    await updateChatMessageContent(messageId, stream.join(""));
  }
}

async function createTitle(chatId: string, message: string) {
  const { text } = await generateText({
    model: groq("llama3-8b-8192"),
    prompt: `convert the following into a concise, brief, and no more than five or six words title, answer with the title only, without quotes: ${message}`,
  });

  await updateChatMessageTitle(chatId, text);
}
