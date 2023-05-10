import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('account')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'integer', 
      col => col.references('user.id').onDelete('cascade')
    )
    .addColumn('session_id', 'varchar(64)')
    .execute()

  await db.schema
    .createTable('session')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('key', 'uuid', col => col.notNull().unique())
    .addColumn('user_id', 'integer', col => col.references('user.id'))
    .addColumn('created_at', 'timestamp', col => col.defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(sql`now()`))
    .addColumn('expires_at', 'timestamp', col => col.defaultTo(sql`now() + interval '1 day'`))
    .addColumn('data', 'jsonb')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .dropTable('session')
    .execute()

  await db.schema
    .dropTable('account')
    .execute()
}