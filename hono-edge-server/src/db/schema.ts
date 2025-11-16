// schema.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// UUID generator function
const generateUUID = () => crypto.randomUUID();

// Products Table
export const products = sqliteTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;