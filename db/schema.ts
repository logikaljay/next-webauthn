import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | null | number | string;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Account {
  id: Generated<number>;
  user_id: number | null;
  session_id: string | null;
}

export interface Credential {
  id: Generated<number>;
  name: string | null;
  external_id: string;
  public_key: string;
  sign_count: Generated<number | null>;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
  user_id: number | null;
}

export interface Session {
  id: Generated<number>;
  key: string;
  user_id: number | null;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
  expires_at: Generated<Timestamp | null>;
  data: Json | null;
}

export interface User {
  id: Generated<number>;
  email: string;
  image: string | null;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
  salt: string;
  hash: string;
}

export interface UserSetting {
  id: Generated<number>;
  user_id: number | null;
  should_change_password: Generated<boolean | null>;
  require_passkey: Generated<boolean | null>;
}

export interface DB {
  account: Account;
  credential: Credential;
  session: Session;
  user: User;
  user_setting: UserSetting;
}
