import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import "dotenv/config";

console.log(process.env.DATABASE_URL);
const sql = neon('postgresql://neondb_owner:npg_4xJyZBMI8FsP@ep-cold-surf-ad1y05ju-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
export const db = drizzle({ client: sql });

