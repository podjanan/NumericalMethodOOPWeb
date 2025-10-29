// db.js
import "dotenv/config";
import mysql from "mysql2/promise";

const isTiDB = (process.env.DB_HOST || "").includes("tidbcloud.com");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || (isTiDB ? 4000 : 3306)),
  user: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isTiDB
    ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
    : undefined,
});

export default pool;
