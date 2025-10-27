import express from "express";
import cors from "cors";
import morgan from "morgan";
import 'dotenv/config';

import roots from "./roots.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health/db", (req, res) => {
  res.json({ ok: true });
});

// routes
app.use("/roe",roots);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Not found" });
});



app.listen(5000,()=>{
    console.log('Server started')
})