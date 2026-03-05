import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	dialect: "mysql",
	out: "./drizzle",
	schema: "./src/infrastructure/models/index.ts",
});
