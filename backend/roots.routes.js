import { Router } from "express";
import connection from "./db.js";

const router = Router();

router.get("/", (req, res) => {
  const sql = "SELECT * FROM roe";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ ok: false, message: "Database query failed" });
    }
    res.json({results});
  });
});

router.post("/", (req, res) => {
  const { equation } = req.body;
  if (!equation) {
      return res.status(400).json({ ok: false, message: "Missing 'equation' field" });
    }
  const sql = "INSERT INTO roe(equation) VALUES (?)";
  connection.query(sql, [equation], (err, result) => {
    if (err) {
      return "error";
    }
    res.json("ok");
  });
});


export default router;