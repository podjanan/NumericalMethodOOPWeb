// routes/roots.routes.js
import { Router } from "express";
import pool from "./db.js"; // ← ใช้ pool แบบ promise จาก db.js

const router = Router();

// helpers
const isNonEmptyString = (s) => typeof s === "string" && s.trim().length > 0;
const sanitizeLimit = (v, def = 10, max = 100) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(n, max);
};
const sanitizePage = (v, def = 1) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};

// GET / (mounted under /roe)
router.get("/", async (req, res) => {
  try {
    const { q = "", page, limit, order = "desc" } = req.query;
    const lim = sanitizeLimit(limit, 10, 100);
    const pg = sanitizePage(page, 1);
    const offset = (pg - 1) * lim;
    const safeOrder = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

    const where = isNonEmptyString(q) ? "WHERE equation LIKE ?" : "";
    const params = isNonEmptyString(q) ? [`%${q}%`] : [];

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM roe ${where}`,
      params
    );
    const total = countRows[0]?.total ?? 0;

    const [rows] = await pool.query(
      `SELECT id, equation
       FROM roe
       ${where}
       ORDER BY id ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, lim, offset]
    );

    res.json({
      results: rows,
      pagination: {
        page: pg,
        limit: lim,
        total,
        totalPages: Math.ceil(total / lim),
        order: safeOrder,
      },
    });
  } catch (err) {
    console.error("DB Error (LIST):", err);
    res.status(500).json({ ok: false, message: "Database query failed" });
  }
});

// GET /:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id, equation FROM roe WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Not found" });
    }
    res.json({ ok: true, result: rows[0] });
  } catch (err) {
    console.error("DB Error (GET ONE):", err);
    res.status(500).json({ ok: false, message: "Database query failed" });
  }
});

// POST /
router.post("/", async (req, res) => {
  try {
    const { equation } = req.body;
    if (!isNonEmptyString(equation)) {
      return res.status(400).json({ ok: false, message: "Missing 'equation'" });
    }
    const [result] = await pool.query(
      "INSERT INTO roe (equation) VALUES (?)",
      [equation.trim()]
    );
    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error("DB Error (CREATE):", err);
    res.status(500).json({ ok: false, message: "Database insert failed" });
  }
});

// PUT /:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { equation } = req.body;
    if (!isNonEmptyString(equation)) {
      return res.status(400).json({ ok: false, message: "Missing 'equation'" });
    }

    const [exists] = await pool.query("SELECT id FROM roe WHERE id = ?", [id]);
    if (exists.length === 0) {
      return res.status(404).json({ ok: false, message: "Not found" });
    }

    await pool.query("UPDATE roe SET equation = ? WHERE id = ?", [
      equation.trim(),
      id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("DB Error (UPDATE):", err);
    res.status(500).json({ ok: false, message: "Database update failed" });
  }
});

// PATCH /:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { equation } = req.body;

    if (!("equation" in req.body)) {
      return res.status(400).json({ ok: false, message: "No fields to update" });
    }
    if (!isNonEmptyString(equation)) {
      return res
        .status(400)
        .json({ ok: false, message: "Empty 'equation' not allowed" });
    }

    const [exists] = await pool.query("SELECT id FROM roe WHERE id = ?", [id]);
    if (exists.length === 0) {
      return res.status(404).json({ ok: false, message: "Not found" });
    }

    await pool.query("UPDATE roe SET equation = ? WHERE id = ?", [
      equation.trim(),
      id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("DB Error (PATCH):", err);
    res.status(500).json({ ok: false, message: "Database update failed" });
  }
});

// DELETE /:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [exists] = await pool.query("SELECT id FROM roe WHERE id = ?", [id]);
    if (exists.length === 0) {
      return res.status(404).json({ ok: false, message: "Not found" });
    }

    await pool.query("DELETE FROM roe WHERE id = ?", [id]);
    res.json({ ok: true, message: "Deleted" });
  } catch (err) {
    console.error("DB Error (DELETE):", err);
    res.status(500).json({ ok: false, message: "Database delete failed" });
  }
});

export default router;
