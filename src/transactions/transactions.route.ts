import { Hono, type Context } from "hono";
import { getTransactions } from "./transactions.controller.js";

export const transactions_route = new Hono();

// Define routes for transactions
transactions_route.get("/",getTransactions);