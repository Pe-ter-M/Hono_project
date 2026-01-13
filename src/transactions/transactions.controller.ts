import type { Context } from "hono";

export const getTransactions = (c: Context) => {
  return c.json({ message: "Get Transactions" });
}