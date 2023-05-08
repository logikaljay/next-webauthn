import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Account {
  id: Generated<number>;
  user_id: number | null;
  session_id: string | null;
}

export interface Credential {
  id: Generated<number>;
  external_id: string;
  public_key: string;
  sign_count: Generated<number | null>;
  created_at: Generated<Timestamp | null>;
  updated_at: Generated<Timestamp | null>;
  user_id: number | null;
}

export interface User {
  id: Generated<number>;
  email: string;
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
  user: User;
  user_setting: UserSetting;
}
