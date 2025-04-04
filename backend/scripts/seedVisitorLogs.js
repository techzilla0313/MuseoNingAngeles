// seedVisitorLogs.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seedVisitorLogs() {
  // Create a connection pool
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Generate logs for the past 90 days (or modify as needed)
  const today = new Date();
  const totalLogs = 200; // number of logs to generate
  for (let i = 0; i < totalLogs; i++) {
    // Pick a random day in the past 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const randomDate = new Date();
    randomDate.setDate(today.getDate() - daysAgo);

    // Format the date as MySQL datetime "YYYY-MM-DD HH:MM:SS"
    const formattedDate = randomDate.toISOString().slice(0, 19).replace('T', ' ');

    const ip = `192.168.0.${Math.floor(Math.random() * 255)}`;
    const userAgent = 'Mozilla/5.0 (Dummy Data)';
    const referrer = 'http://example.com';

    const query = `
      INSERT INTO visitor_logs (ip_address, user_agent, referrer, created_at)
      VALUES (?, ?, ?, ?)
    `;
    try {
      await pool.query(query, [ip, userAgent, referrer, formattedDate]);
    } catch (error) {
      console.error('Error inserting log:', error);
    }
  }
  console.log('Visitor logs seeded successfully.');
  process.exit(0);
}

seedVisitorLogs().catch((err) => {
  console.error('Error seeding data:', err);
});
