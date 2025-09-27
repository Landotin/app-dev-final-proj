// config/db.js

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
        balance NUMERIC,
        type TEXT,
        status VARCHAR(20) DEFAULT 'pending', -- 👈 ADDED: For pending, validated status
        validated_at TIMESTAMPTZ,              -- 👈 ADDED: To track when validation happens
        annual_renewal_date DATE,             -- 👈 ADDED: For 1-year expiry
        card_expiry_date DATE,                -- 👈 ADDED: For 5-year expiry
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✅ Users table is ready');

    await sql`
      CREATE TABLE IF NOT EXISTS taps (
        id SERIAL PRIMARY KEY,
        rfid VARCHAR(255) NOT NULL REFERENCES users(rfid),
        tap_type TEXT CHECK (tap_type IN ('entry','exit')) NOT NULL,
        tap_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        user_name TEXT,
        user_balance NUMERIC,
        user_type TEXT
      )
    `;
    console.log('✅ Taps table with entry/exit is ready');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    process.exit(1);
  }
}

export default sql;