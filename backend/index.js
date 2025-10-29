import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

import roots from "./roots.routes.js";
import connection from "./db.js"; // ถ้ามีไฟล์ db.js ที่ export mysql connection

export const app = express();

// ----- Core middlewares -----
app.use(cors({
  // ถ้าต้องล็อก origin: origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors()); // preflight

app.use(express.json({ limit: "1mb" })); // กัน payload ใหญ่เกินไป
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ----- Health check -----
// เช็ค DB จริง ๆ ด้วย ping (หรือ SELECT 1)
app.get("/health/db", (req, res) => {
  connection.ping((err) => {
    if (err) {
      console.error("DB ping failed:", err?.message || err);
      return res.status(500).json({ ok: false, db: false });
    }
    res.json({ ok: true, db: true });
  });
});

// ----- Routes -----
app.use("/roe", roots);

// ----- 404 -----
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Not found" });
});

// ----- 500 (error handler) -----
// ถ้ามี next(err) จาก route/middleware อื่น ๆ
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ ok: false, message: "Internal Server Error" });
});

// ----- Start server -----
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);
});

// ----- Graceful shutdown -----
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(() => {
    // ปิด mysql connection ถ้าเป็น single connection
    if (connection && typeof connection.end === "function") {
      connection.end(() => {
        console.log("DB connection closed.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });

  // กันเคสแฮงค์
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
