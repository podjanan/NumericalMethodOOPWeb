// src/page/Interpolation/InterpSwitcher.jsx
import { useMemo, useState } from "react";
import Plot from "react-plotly.js";
import {
  LagrangeEngine,
  NewtonDividedEngine,
  SplineEngine,
} from "./index.jsx";

export default function InterpSwitcher() {
  const [method, setMethod] = useState("lagrange"); // lagrange | newton | spline-linear | spline-quadratic | spline-cubic
  const [points, setPoints] = useState([
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
  ]);
  const [Xval, setXval] = useState("");
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");

  const resize = (n) => {
    const m = Math.max(2, Math.min(50, parseInt(n || "2", 10)));
    setPoints((prev) =>
      Array.from({ length: m }, (_, i) => prev[i] || { x: "", y: "" })
    );
    setResult(null);
    setMsg("");
  };

  const engine = useMemo(() => {
    if (method === "lagrange") return new LagrangeEngine();
    if (method === "newton") return new NewtonDividedEngine();
    if (method.startsWith("spline")) {
      const mode = method.split("-")[1] || "linear";
      return new SplineEngine(mode);
    }
    return new LagrangeEngine();
  }, [method]);

  const handlePointChange = (i, key, value) => {
    setPoints((prev) => {
      const next = prev.map((p) => ({ ...p }));
      next[i][key] = value;
      return next;
    });
  };

  const numericPoints = () =>
    points
      .map((p) => ({ x: Number(p.x), y: Number(p.y) }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  const calculate = () => {
    try {
      setMsg("");
      setResult(null);
      const pts = numericPoints();
      if (pts.length < 2) {
        setMsg("ใส่จุดอย่างน้อย 2 จุด และให้เป็นตัวเลขทั้งหมด");
        return;
      }
      // ตรวจ x ซ้ำ
      const seen = new Set();
      for (const p of pts) {
        if (seen.has(p.x)) {
          setMsg("พบค่า x_i ซ้ำกัน");
          return;
        }
        seen.add(p.x);
      }

      const X = Number(Xval);
      if (!Number.isFinite(X)) {
        setMsg("กรอก X ให้เป็นตัวเลข");
        return;
      }

      const { result } = engine.solve(pts, X);
      setResult(result);
    } catch (e) {
      setMsg(e.message || "คำนวณไม่สำเร็จ");
    }
  };

  // --------- สร้างข้อมูลกราฟ ----------
  const { curveXs, curveYs, ptsXs, ptsYs, resX, resY } = useMemo(() => {
    const pts = numericPoints();
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);

    const out = {
      curveXs: [],
      curveYs: [],
      ptsXs: xs,
      ptsYs: ys,
      resX: null,
      resY: null,
    };

    if (pts.length >= 2) {
      // ช่วงสำหรับวาดเส้น
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const pad = (maxX - minX) || 1;
      const x0 = minX - 0.05 * pad;
      const x1 = maxX + 0.05 * pad;

      const N = 400;
      const grid = Array.from({ length: N }, (_, i) => x0 + (i * (x1 - x0)) / (N - 1));
      const ygrid = grid.map((gx) => {
        try {
          // ใช้ engine.solve แบบคำนวณเป็นจุด ๆ (ง่ายและพอสำหรับ UI)
          const { result } = engine.solve(pts, gx);
          return Number.isFinite(result) ? result : null;
        } catch {
          return null;
        }
      });

      out.curveXs = grid;
      out.curveYs = ygrid;
    }

    // จุดผลลัพธ์ (ถ้ามี)
    const X = Number(Xval);
    if (Number.isFinite(X) && Number.isFinite(result)) {
      out.resX = X;
      out.resY = result;
    }
    return out;
  }, [points, Xval, result, engine]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Interpolation</h1>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="text-sm text-gray-600">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="block border rounded px-3 py-2"
          >
            <option value="lagrange">Lagrange</option>
            <option value="newton">Newton&apos;s Divided Difference</option>
            <option value="spline-linear">Spline: Linear</option>
            <option value="spline-quadratic">Spline: Quadratic (local)</option>
            <option value="spline-cubic">Spline: Cubic (natural)</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600"># Points</label>
          <input
            type="number"
            min={2}
            max={50}
            value={points.length}
            onChange={(e) => resize(e.target.value)}
            className="block w-28 border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">X</label>
          <input
            type="number"
            value={Xval}
            onChange={(e) => setXval(e.target.value)}
            className="block w-36 border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={calculate}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Calculate
        </button>
      </div>

      {/* Points editor */}
      <div
        className="grid gap-2 mb-6"
        style={{ gridTemplateColumns: "repeat(3, minmax(140px, 1fr))" }}
      >
        <div className="text-sm text-gray-500 font-medium">Index</div>
        <div className="text-sm text-gray-500 font-medium">xᵢ</div>
        <div className="text-sm text-gray-500 font-medium">f(xᵢ)</div>

        {points.map((p, i) => (
          <RowEditor
            key={i}
            i={i}
            x={p.x}
            y={p.y}
            onChange={(k, v) => handlePointChange(i, k, v)}
          />
        ))}
      </div>

      {/* Messages / Result */}
      {msg && (
        <div className="mt-3 p-3 rounded bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          {msg}
        </div>
      )}

      {Number.isFinite(result) && !msg && (
        <div className="mt-2 mb-4">
          Result at X = <b>{Xval}</b> : <b>{result}</b>
        </div>
      )}

      {/* Plot: จุดข้อมูล + เส้นโค้ง + จุดผลลัพธ์ */}
      <div className="rounded-2xl p-2 bg-white">
        <Plot
          data={[
            // Curve
            curveXs.length > 0
              ? {
                  x: curveXs,
                  y: curveYs,
                  type: "scatter",
                  mode: "lines",
                  name: "Interpolation",
                }
              : null,
            // Points
            ptsXs.length > 0
              ? {
                  x: ptsXs,
                  y: ptsYs,
                  type: "scatter",
                  mode: "markers",
                  name: "Data points",
                  marker: { size: 8 },
                }
              : null,
            // Result point
            Number.isFinite(resX) && Number.isFinite(resY)
              ? {
                  x: [resX],
                  y: [resY],
                  type: "scatter",
                  mode: "markers",
                  name: "Result",
                  marker: { size: 10, symbol: "x" },
                }
              : null,
          ].filter(Boolean)}
          layout={{
            title: "Interpolation Graph",
            xaxis: { title: "x", zeroline: true },
            yaxis: { title: "f(x)", zeroline: true },
            width: 900,
            height: 520,
            showlegend: true,
          }}
        />
      </div>
    </div>
  );
}

function RowEditor({ i, x, y, onChange }) {
  return (
    <>
      <div className="flex items-center text-sm text-gray-600">{i}</div>
      <input
        className="border rounded px-2 py-2 text-center"
        type="number"
        value={x}
        onChange={(e) => onChange("x", e.target.value)}
        placeholder={`x${i}`}
      />
      <input
        className="border rounded px-2 py-2 text-center"
        type="number"
        value={y}
        onChange={(e) => onChange("y", e.target.value)}
        placeholder={`f(x${i})`}
      />
    </>
  );
}
