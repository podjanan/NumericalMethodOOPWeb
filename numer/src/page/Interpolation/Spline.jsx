import { useEffect, useState } from "react";

function Spline() {
  const [Points, setPoints] = useState(3);
  const [rows, setRows] = useState(() =>
    Array.from({ length: 3 }, () => ["", ""]) // [x_i, y_i]
  );
  const [Xval, setXval] = useState("");
  const [mode, setMode] = useState("linear"); // 'linear' | 'quadratic' | 'cubic'
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");

  // resize table (keep existing values)
  useEffect(() => {
    setRows((prev) => {
      const next = Array.from({ length: Points }, () => ["", ""]);
      for (let i = 0; i < Math.min(prev.length, Points); i++) next[i] = [...prev[i]];
      return next;
    });
    setResult(null);
    setMsg("");
  }, [Points]);

  const setA = (row, col, value) => {
    setRows((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = value;
      return next;
    });
  };

  // ---------- helpers ----------
  const parseInputs = () => {
    const xs = rows.map((r) => (r[0] === "" ? NaN : Number(r[0])));
    const ys = rows.map((r) => (r[1] === "" ? NaN : Number(r[1])));
    const X = Xval === "" ? NaN : Number(Xval);
    if (xs.some((v) => !Number.isFinite(v)) || ys.some((v) => !Number.isFinite(v))) {
      throw new Error("กรอก x_i และ f(x_i) ให้ครบและเป็นตัวเลข");
    }
    if (!Number.isFinite(X)) throw new Error("กรอก X value ให้เป็นตัวเลข");

    // ห้าม x ซ้ำ
    const seen = new Set();
    for (const xv of xs) {
      if (seen.has(xv)) throw new Error("ค่า x_i ซ้ำกัน");
      seen.add(xv);
    }

    // จัดเรียงตาม x (จำเป็นต่อ spline)
    const idx = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
    const xsS = idx.map((i) => xs[i]);
    const ysS = idx.map((i) => ys[i]);
    return { xs: xsS, ys: ysS, X };
  };

  const findInterval = (xs, X) => {
    const n = xs.length;
    if (X <= xs[0]) return 0;
    if (X >= xs[n - 1]) return n - 2;
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= X) lo = mid; else hi = mid;
    }
    return lo; // X in [xs[lo], xs[lo+1]]
  };

  const evalLinear = (xs, ys, X) => {
    const i = findInterval(xs, X);
    const x0 = xs[i], x1 = xs[i + 1];
    const y0 = ys[i], y1 = ys[i + 1];
    const t = (X - x0) / (x1 - x0);
    return y0 + t * (y1 - y0);
  };

  // local quadratic (3 จุดรอบ ๆ X) – ไม่ใช่ spline แท้ แต่ตรงชื่อโหมดที่ผู้ใช้ระบุ
  const evalQuadraticLocal = (xs, ys, X) => {
    const n = xs.length;
    if (n < 3) throw new Error("Quadratic ต้องมีอย่างน้อย 3 จุด");
    let i = findInterval(xs, X);
    // เลือกสามจุดต่อเนื่อง
    if (i === 0) i = 0;
    else if (i >= n - 2) i = n - 3;
    else i = i - 1;
    const x0 = xs[i],   y0 = ys[i];
    const x1 = xs[i+1], y1 = ys[i+1];
    const x2 = xs[i+2], y2 = ys[i+2];
    // Lagrange degree-2
    const L0 = ((X - x1)*(X - x2))/((x0 - x1)*(x0 - x2));
    const L1 = ((X - x0)*(X - x2))/((x1 - x0)*(x1 - x2));
    const L2 = ((X - x0)*(X - x1))/((x2 - x0)*(x2 - x1));
    return y0*L0 + y1*L1 + y2*L2;
  };

  // Natural Cubic Spline
  const buildNaturalCubic = (xs, ys) => {
    const n = xs.length;
    if (n < 2) throw new Error("ต้องมีอย่างน้อย 2 จุด");
    const h = Array(n - 1);
    for (let i = 0; i < n - 1; i++) {
      h[i] = xs[i + 1] - xs[i];
      if (h[i] === 0) throw new Error("พบ x ที่ซ้ำ");
    }

    // ตั้งระบบ tridiagonal สำหรับ second derivatives z (z0 = zn-1 = 0)
    const a = Array(n).fill(0), b = Array(n).fill(0), c = Array(n).fill(0), d = Array(n).fill(0);
    b[0] = 1; d[0] = 0; c[0] = 0; a[0] = 0;
    b[n - 1] = 1; d[n - 1] = 0; a[n - 1] = 0; c[n - 1] = 0;

    for (let i = 1; i < n - 1; i++) {
      a[i] = h[i - 1];
      b[i] = 2 * (h[i - 1] + h[i]);
      c[i] = h[i];
      d[i] = 6 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1]);
    }

    // Thomas algorithm
    for (let i = 1; i < n; i++) {
      const w = a[i] / b[i - 1];
      b[i] -= w * c[i - 1];
      d[i] -= w * d[i - 1];
    }
    const z = Array(n).fill(0);
    z[n - 1] = d[n - 1] / b[n - 1];
    for (let i = n - 2; i >= 0; i--) {
      z[i] = (d[i] - c[i] * z[i + 1]) / b[i];
    }

    return { h, z };
  };

  const evalCubic = (xs, ys, X, h, z) => {
    const i = findInterval(xs, X);
    const xi = xs[i], xi1 = xs[i + 1];
    const hi = h[i];
    const zi = z[i], zi1 = z[i + 1];
    const Ai = (xi1 - X) / hi;
    const Bi = (X - xi) / hi;
    // สูตร spline ส่วน i
    return Ai * ys[i] + Bi * ys[i + 1]
         + ((Ai**3 - Ai) * zi * (hi**2)) / 6
         + ((Bi**3 - Bi) * zi1 * (hi**2)) / 6;
  };

  const calculate = () => {
    try {
      setMsg("");
      setResult(null);
      if (Points < 2) throw new Error("ต้องมีอย่างน้อย 2 จุด");

      const { xs, ys, X } = parseInputs();

      // ถ้า X ตรงกับจุดข้อมูล คืนค่า y ทันที
      for (let i = 0; i < xs.length; i++) {
        if (X === xs[i]) { setResult(ys[i]); return; }
      }

      let yX;
      if (mode === "linear") {
        yX = evalLinear(xs, ys, X);
      } else if (mode === "quadratic") {
        if (xs.length < 3) throw new Error("Quadratic ต้องมีอย่างน้อย 3 จุด");
        yX = evalQuadraticLocal(xs, ys, X);
      } else {
        // cubic natural spline
        if (xs.length < 3) {
          // ถ้ามีน้อยกว่า 3 จุด cubic จะเท่ากับ linear อยู่ดี
          yX = evalLinear(xs, ys, X);
        } else {
          const { h, z } = buildNaturalCubic(xs, ys);
          yX = evalCubic(xs, ys, X, h, z);
        }
      }

      setResult(yX);
    } catch (e) {
      setMsg(e.message || "เกิดข้อผิดพลาดในการคำนวณ");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center m-3">Spline interpolation</h1>

      <div className="flex justify-center items-center flex-wrap gap-2">
        <label>Points</label>
        <input
          type="number"
          className="border p-2 m-1"
          value={Points}
          min={2}
          max={50}
          onChange={(e) =>
            setPoints(Math.max(2, Math.min(50, parseInt(e.target.value || "2", 10))))
          }
        />

        <label>X value</label>
        <input
          type="number"
          className="border p-2 m-1"
          value={Xval}
          onChange={(e) => setXval(e.target.value)}
        />

        <select
          className="m-1 p-2 border rounded"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="linear">Linear</option>
          <option value="quadratic">Quadratic</option>
          <option value="cubic">Cubic</option>
        </select>

        <button className="border px-4 py-2 rounded-xl bg-green-300" onClick={calculate}>
          Calculate
        </button>
      </div>

      <div className="grid justify-center items-center mt-4">
        {Array.from({ length: Points }).map((_, i) => (
          <div key={i}>
            <label className="m-1">{i}.</label>
            <input
              className="border p-1 m-2"
              type="number"
              placeholder={`x${i}`}
              value={rows[i]?.[0] ?? ""}
              onChange={(e) => setA(i, 0, e.target.value)}
            />
            <input
              className="border p-1 m-2"
              type="number"
              placeholder={`f(x${i})`}
              value={rows[i]?.[1] ?? ""}
              onChange={(e) => setA(i, 1, e.target.value)}
            />
          </div>
        ))}
      </div>

      {msg && (
        <div className="max-w-xl mx-auto mt-3 p-3 rounded bg-yellow-50 border text-sm">
          {msg}
        </div>
      )}
      {result !== null && (
        <div className="max-w-xl mx-auto mt-4 p-3 border rounded text-center">
          P({Xval}) = <b>{result}</b>
        </div>
      )}
    </>
  );
}

export default Spline;
