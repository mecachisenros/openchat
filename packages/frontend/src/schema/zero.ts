import {
  createSchema,
  definePermissions,
  NOBODY_CAN,
  ANYONE_CAN,
  table,
  string,
  number,
  relationships,
  enumeration,
} from '@rocicorp/zero'

import type { ExpressionBuilder, Row, PermissionsConfig } from '@rocicorp/zero'

const timestamps = {
  createdAt: number().from('created_at'),
  updatedAt: number().from('updated_at'),
}

const user = table('user')
  .from('user')
  .columns({
    id: string(),
    name: string().optional(),
    email: string(),
    ...timestamps,
  })
  .primaryKey('id')

const chat = table('chat')
  .from('chat')
  .columns({
    id: string(),
    name: string().optional(),
    ownerId: string().from('owner_id'),
    ...timestamps,
  })
  .primaryKey('id')

const message = table('message')
  .from('message')
  .columns({
    id: string(),
    role: enumeration<'user' | 'assistant'>(),
    chatId: string().from('chat_id'),
    content: string(),
    ...timestamps,
  })
  .primaryKey('id')

const userRelations = relationships(user, ({ many }) => ({
  chats: many({
    sourceField: ['id'],
    destField: ['ownerId'],
    destSchema: chat,
  }),
}))

const chatRelations = relationships(chat, ({ one, many }) => ({
  owner: one({
    sourceField: ['ownerId'],
    destField: ['id'],
    destSchema: user,
  }),
  messages: many({
    sourceField: ['id'],
    destField: ['chatId'],
    destSchema: message,
  }),
}))

const messageRelations = relationships(message, ({ one }) => ({
  chat: one({
    sourceField: ['chatId'],
    destField: ['id'],
    destSchema: chat,
  }),
}))

export const schema = createSchema(1, {
  tables: [user, chat, message],
  relationships: [userRelations, chatRelations, messageRelations],
})

export type Schema = typeof schema
export type User = Row<typeof schema.tables.user>
export type Chat = Row<typeof schema.tables.chat>
export type Message = Row<typeof schema.tables.message>

type AuthData = {
  properties: {
    id: string | null
  }
  sub: string
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  const allowIfChatOwner = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, 'chat'>,
  ) => {
    return cmp('ownerId', '=', authData.sub)
  }

  const allowIfMessageOwner = (
    authData: AuthData,
    { exists }: ExpressionBuilder<Schema, 'message'>,
  ) => {
    return exists('chat', (cq) => {
      return cq.whereExists('owner', (uq) => {
        return uq.where('id', authData.sub)
      })
    })
  }

  return {
    user: NOBODY_CAN,
    chat: {
      row: {
        select: [allowIfChatOwner],
        insert: [allowIfChatOwner],
        update: [allowIfChatOwner],
        delete: [allowIfChatOwner],
      },
    },
    message: {
      row: {
        select: [allowIfMessageOwner],
        insert: [allowIfMessageOwner],
        update: [allowIfMessageOwner],
        delete: [allowIfMessageOwner],
      },
    },
  }
})
