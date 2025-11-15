import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
	schema: "src/prisma/schema.prisma",
	migrations: {
		path: "src/prisma/migrations",
	},
	engine: "classic",
	datasource: {
		url: "postgresql://postgres:root@localhost:5432/darbi",
	},
});
