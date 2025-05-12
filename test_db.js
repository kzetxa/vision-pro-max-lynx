import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const supabaseConnectionString = process.env.SUPABASE_DB_CONNECTION_STRING;
console.log("Attempting to connect with:", supabaseConnectionString);

if (!supabaseConnectionString) {
	console.error("SUPABASE_DB_CONNECTION_STRING is not set in .env");
	process.exit(1);
}

const pool = new Pool({ connectionString: supabaseConnectionString });

async function testConnection() {
	let client;
	try {
		console.log("Connecting to database...");
		client = await pool.connect();
		console.log("Successfully connected to Supabase database!");
		const res = await client.query('SELECT NOW()');
		console.log("Current time from DB:", res.rows[0]);
	} catch (err) {
		console.error("Database connection error:", err);
	} finally {
		if (client) {
			client.release();
		}
		await pool.end();
		console.log("Connection pool closed.");
	}
}

testConnection();