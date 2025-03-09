import { relations, sql } from "drizzle-orm";
import {
  uuid,
  pgTable,
  text,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
    precision: 3,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true,
    precision: 3,
  })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
};

export const userTable = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    email: text("email").notNull().unique(),
    ...timestamps,
  },
  (table) => [index().on(table.id)],
);

export const userRelations = relations(userTable, ({ many }) => ({
  chats: many(chatTable),
}));

export const chatTable = pgTable(
  "chat",
  {
    id: uuid("id").primaryKey(),
    name: text("name"),
    ownerId: uuid("owner_id").references(() => userTable.id, {
      onDelete: "cascade",
    }),
    ...timestamps,
  },
  (table) => [index().on(table.id)],
);

export const chatRelations = relations(chatTable, ({ one, many }) => ({
  owner: one(userTable, {
    fields: [chatTable.ownerId],
    references: [userTable.id],
  }),
  messages: many(messageTable),
}));

export const messageRoleEnum = pgEnum("role", ["user", "assistant"]);

export const messageTable = pgTable(
  "message",
  {
    id: uuid("id").primaryKey(),
    role: messageRoleEnum(),
    chatId: uuid("chat_id").references(() => chatTable.id, {
      onDelete: "cascade",
    }),
    content: text(),
    ...timestamps,
  },
  (table) => [index().on(table.id)],
);

export const messageRelations = relations(messageTable, ({ one }) => ({
  chat: one(chatTable, {
    fields: [messageTable.chatId],
    references: [chatTable.id],
  }),
}));
