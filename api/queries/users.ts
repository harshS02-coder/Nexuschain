import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function createUser(data: InsertUser) {
  await getDb().insert(schema.users).values(data);
  const user = await findUserByEmail(data.email!);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function updateUserLastSignIn(id: number) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, id));
}