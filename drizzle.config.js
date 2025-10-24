import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./services/schema.ts",
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_4xJyZBMI8FsP@ep-cold-surf-ad1y05ju-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  }
});