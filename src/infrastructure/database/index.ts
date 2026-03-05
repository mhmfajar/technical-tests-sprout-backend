import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "~/infrastructure/models";

const pool = mysql.createPool({
	uri: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { mode: "default", schema });

pool
	.getConnection()
	.then((conn) => {
		console.log("Connected to the database successfully.");
		conn.release();
	})
	.catch((err) => {
		console.error("Failed to connect to the database:", err);
	});

export type DbType = typeof db;
