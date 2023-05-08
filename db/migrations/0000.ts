import { Kysely } from "kysely";

export async function up(db: Kysely<any>) {
  db.schema
    .createTable('user')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('email', 'varchar', col => col.notNull().unique())
    .addColumn('created_at', 'timestamp', col => col.defaultTo(new Date()))
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(new Date()))
    .addColumn('salt', 'varchar(12)', col => col.notNull())
    .addColumn('hash', 'varchar(64)', col => col.notNull())
    .execute()

  db.schema
    .createTable('credential')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('external_id', 'varchar', col => col.notNull().unique())
    .addColumn('public_key', 'varchar', col => col.notNull().unique())
    .addColumn('sign_count', 'integer', col => col.defaultTo(0))
    .addColumn('created_at', 'timestamp', col => col.defaultTo(new Date()))
    .addColumn('updated_at', 'timestamp', col => col.defaultTo(new Date()))
    .addColumn('user_id', 'integer', 
      col => col.references('user.id').onDelete('cascade')
    )
    .execute()
    
  db.schema
    .createTable('user_setting')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('user_id', 'integer', 
      col => col.references('user.id').onDelete('cascade')
    )
    .addColumn('should_change_password', 'boolean', col => col.defaultTo(false))
    .addColumn('require_passkey', 'boolean', col => col.defaultTo(false))
    .execute()
}

export async function down(db: Kysely<any>) {

  db.schema
    .dropTable('user_setting')
    .execute()

  db.schema
    .dropTable('credential')
    .execute()

  db.schema
    .dropTable('user')
    .execute()
}