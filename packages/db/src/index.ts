import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "./schema";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("missing DATABASE_URL env");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({
  schema,
  client: pool,
});

export async function getOrCreateUserByEmail(email: string) {
  let user = await db.query.userTable.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });

  if (!user) {
    user = await db
      .insert(schema.userTable)
      .values({
        email,
      })
      .returning()
      .then((list) => list.at(0));
  }

  return user?.id;
}

export async function getChatMessages(chatId: string) {
  return db.query.messageTable.findMany({
    where: (message, { eq }) => eq(message.chatId, chatId),
    columns: {
      id: true,
      role: true,
      content: true,
    },
    orderBy: (message, { asc }) => [asc(message.createdAt)],
  });
}

export async function updateChatMessageContent(
  messageId: string,
  content: string,
) {
  return db
    .update(schema.messageTable)
    .set({ content })
    .where(eq(schema.messageTable.id, messageId));
}

export async function updateChatMessageTitle(chatId: string, name: string) {
  return db
    .update(schema.chatTable)
    .set({ name })
    .where(eq(schema.chatTable.id, chatId));
}
