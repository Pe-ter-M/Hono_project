// src/db/schema.ts
import { pgTable, serial, text, timestamp, integer, decimal, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Account table
export const accounts = pgTable('accounts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    accountType: text('account_type').notNull(),
    accountNumber: text('account_number').notNull().unique(),
    balance: decimal('balance', { precision: 15, scale: 2 }).notNull().default('0.00'),
    currency: text('currency').notNull().default('USD'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Transaction status enum
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);

// Transaction table
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id').notNull().references(() => accounts.id),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    type: text('type').notNull(),
    description: text('description'),
    status: transactionStatusEnum('status').notNull().default('pending'),
    reference: text('reference').unique(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Order status enum
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

// Order table
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    orderNumber: text('order_number').notNull().unique(),
    totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
    status: orderStatusEnum('status').notNull().default('pending'),
    shippingAddress: text('shipping_address'),
    billingAddress: text('billing_address'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Order items table
export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').notNull().references(() => orders.id),
    productId: integer('product_id').notNull(),
    productName: text('product_name').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// RELATIONS - UPDATED SYNTAX for Drizzle 0.45+
export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    orders: many(orders),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
    transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    account: one(accounts, {
        fields: [transactions.accountId],
        references: [accounts.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;