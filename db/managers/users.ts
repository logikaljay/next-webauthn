import { db } from "@/db"
import { User, UserSetting } from "../schema"
import { Insertable, Selectable, Updateable } from "kysely"

export class UserNotFound extends Error {
  constructor() {
    super("User not found")
    this.name = 'UserNotFound'
    this.message = "No user could be found with that email address"
  }
}

async function getUserByEmail(email: string) {
  let user = await db.selectFrom('user')
    .leftJoin('user_setting', 'user_setting.user_id', 'user.id')
    .selectAll()
    .where('user.email', '=', email)
    .executeTakeFirst()

  return user
}

async function getUserCredential(externalId: string) {
  let credentials = await db.selectFrom('credential')
    .leftJoin('user', 'credential.user_id', 'user.id')
    .selectAll()
    .where('credential.external_id', '=', externalId)
    .executeTakeFirst()

  return credentials
}

async function getUserSettings(id: number) {
  let userSettings = await db.selectFrom('user_setting')
    .where('user_setting.user_id', '=', id)
    .selectAll()
    .executeTakeFirst()

  return userSettings
}

async function getCredentialsForUserId(userId: number) {
  let user = await db.selectFrom('user')
    .innerJoin('credential', 'credential.user_id', 'user.id')
    .where('user.id', '=', userId)
    .selectAll()
    .executeTakeFirst()

  return user
}

async function getAllCredentialsForUserId(userId: number) {
  let credentials = await db.selectFrom('credential')
    .where('user_id', '=', userId)
    .selectAll()
    .execute()
  return credentials
}

async function updateSettings(id: number, settings: Updateable<UserSetting>) {
  await db.updateTable('user_setting')
    .set(settings)
    .where('user_id', '=', id)
    .execute()
}

async function updateCredentialSignCount(externalId: string, signCount: number) {
  await db.updateTable('credential')
    .set({
      sign_count: signCount,
      updated_at: new Date()
    })
    .where('credential.external_id', '=', externalId)
    .execute()
}

/**
 * 
 * @param user the user to update the password for
 * @param newPassword The users password
 */
async function updateUser({ id, ...user }: Omit<Updateable<User>, "created_at" | "updated_at">) {
  await db.updateTable('user')
    .set({
      email: user.email,
      salt: user.salt,
      hash: user.hash,
      updated_at: new Date()
    })
    .where("id", '=', id)
    .execute()
}

const users = {
  getUserByEmail,
  getCredentialsForUserId,
  getAllCredentialsForUserId,
  getUserCredential,
  getUserSettings,
  updateSettings,
  updateCredentialSignCount,
  updateUser
}

export { users }