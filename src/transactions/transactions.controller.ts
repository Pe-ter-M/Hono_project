import type { Context } from "hono";
import { logger } from "../lib/logger/index.js";

export const getTransactions = (c: Context) => {
    const requestId = c.get('requestId') as string

    logger.info("Fetching transactions", { requestId });
    return c.json({ message: "Get Transactions" });
}