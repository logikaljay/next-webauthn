import { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('account')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'integer', 
      col => col.references('user.id').onDelete('cascade')
    )
    .addColumn('session_id', 'varchar(64)')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .dropTable('account')
    .execute()
}