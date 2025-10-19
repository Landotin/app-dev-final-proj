import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        rfid VARCHAR(255) PRIMARY KEY,
        student_id TEXT UNIQUE,
        name TEXT,
        email TEXT UNIQUE,
        program TEXT,
        school TEXT,
        address TEXT,
        contact_number VARCHAR(50),
        balance NUMERIC,
        type TEXT,
        status VARCHAR(20) DEFAULT 'pending', 
        validated_at TIMESTAMPTZ,
        annual_renewal_date DATE,
        card_expiry_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✅ Users table is ready');

    // MODIFIED: Simplified the taps table for the new gate logic.
    // 'journey' type is no longer needed as we now have distinct 'entry' and 'exit' taps.
    await sql`
      CREATE TABLE IF NOT EXISTS taps (
        id SERIAL PRIMARY KEY,
        rfid VARCHAR(255) NOT NULL REFERENCES users(rfid),
        tap_type TEXT CHECK (tap_type IN ('entry','exit', 'journey', 'admin_correction', 'admin_penalty')) NOT NULL,
        tap_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        user_name TEXT,
        user_balance NUMERIC,
        user_type TEXT,
        origin_station TEXT,
        destination_station TEXT,
        fare_amount NUMERIC,
        discount_applied BOOLEAN
      )
    `;
    console.log('✅ Taps table is ready');

  } catch (err) {
    console.error('❌ Error creating tables:', err);
    process.exit(1);
  }
}

export default sql;
