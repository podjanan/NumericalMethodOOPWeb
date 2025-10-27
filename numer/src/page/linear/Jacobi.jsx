import React, { useState } from "react";
import { format } from "mathjs";

const makeA = (n) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => ""));
const makeB = (n) => Array.from({ length: n }, () => "");

function Jacobi() {
  const [n, setN] = useState(3);
  const [A, setA] = useState(makeA(3));
  const [B, setB] = useState(makeB(3));

  const [useCustomX0, setUseCustomX0] = useState(false);
  const [X0, setX0] = useState(Array(3).fill(""));

  const [X, setX] = useState([]);
  const [iters, setIters] = useState(0);
  const [msg, setMsg] = useState(""); // warning / error

  const [tol, setTol] = useState(0.000001);
  const [maxIter, setMaxIter] = useState(500);

  const [residual, setResidual] = useState(null); // ‖b - A x‖₂ ของคำตอบสุดท้าย
  const DECIMALS = 6;
  const EPS = 1e-15;

  const handleResize = (val) => {
    const m = Math.max(1, Math.min(8, Number(val) || 1));
    setN(m);
    setA(makeA(m));
    setB(makeB(m));
    setX0(Array(m).fill(""));
    clearResult();
  };

  const clearResult = () => {
    setX([]);
    setIters(0);
    setResidual(null);
    setMsg("");
  };

  const reset = () => {
    setA(makeA(n));
    setB(makeB(n));
    setX0(Array(n).fill(""));
    clearResult();
  };

  // ---------- numeric helpers ----------
  const toNumeric = () => {
    const a = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (__ , c) => {
        const v = parseFloat(A[r][c]);
        return Number.isFinite(v) ? v : 0;
      })
    );
    const b = Array.from({ length: n }, (_, r) => {
      const v = parseFloat(B[r]);
      return Number.isFinite(v) ? v : 0;
    });
    return { a, b };
  };

  const matVec = (M, x) => {
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j < n; j++) s += M[i][j] * x[j];
      y[i] = s;
    }
    return y;
  };

  const normInf = (v) => {
    let m = 0;
    for (let i = 0; i < v.length; i++) m = Math.max(m, Math.abs(v[i]));
    return m;
  };

  const dot = (u, v) => {
    let s = 0;
    for (let i = 0; i < u.length; i++) s += u[i] * v[i];
    return s;
  };

  const norm2 = (v) => Math.sqrt(dot(v, v));

  const diagDominanceHint = (a) => {
    // ตรวจว่ามีแถวใดที่ |a_ii| < sum_{j≠i} |a_ij| หรือไม่
    // ถ้ามี ให้เตือนว่าอาจไม่ลู่เข้า
    for (let i = 0; i < n; i++) {
      let off = 0;
      for (let j = 0; j < n; j++) if (j !== i) off += Math.abs(a[i][j]);
      if (Math.abs(a[i][i]) < off - 1e-14) return false;
    }
    return true;
  };

  // ---------- Jacobi main ----------
  const calculate = () => {
    clearResult(); // ล้างผลก่อนเริ่ม
    const { a, b } = toNumeric();

    // ตรวจศูนย์บนแนวทแยง
    for (let i = 0; i < n; i++) {
      if (Math.abs(a[i][i]) < EPS) {
        setMsg(`Error: a[${i + 1}][${i + 1}] เป็นศูนย์ ทำ Jacobi ไม่ได้`);
        return;
      }
    }

    // เตือนกรณีอาจไม่ลู่เข้า (ไม่ diagonal-dominant)
    if (!diagDominanceHint(a)) {
      setMsg(
        "Warning: A อาจไม่เป็น strictly diagonal-dominant → Jacobi อาจไม่ลู่เข้า (ลองสลับแถว/สเกล หรือใช้ Gauss-Seidel/SOR)"
      );
    }

    // x เริ่มต้น
    let x = useCustomX0
      ? Array.from({ length: n }, (_, i) => {
          const v = parseFloat(X0[i]);
          return Number.isFinite(v) ? v : 0;
        })
      : new Array(n).fill(0);

    const tolVal = Math.max(0, Number(tol) || 0.000001);
    const kMax = Math.max(1, Number(maxIter) || 1);

    // one iteration buffer
    let xNew = new Array(n).fill(0);

    let k = 0;
    for (; k < kMax; k++) {
      // x_i^{(k+1)} = (b_i - Σ_{j≠i} a_ij x_j^{(k)}) / a_ii
      for (let i = 0; i < n; i++) {
        let s = 0;
        for (let j = 0; j < n; j++) if (j !== i) s += a[i][j] * x[j];
        xNew[i] = (b[i] - s) / a[i][i];
      }

      // เกณฑ์หยุด: ‖x^{(k+1)} - x^{(k)}‖_∞ ≤ tol
      const delta = xNew.map((v, i) => v - x[i]);
      if (normInf(delta) <= tolVal) {
        k += 1; // นับรอบนี้ด้วย
        x = xNew.slice();
        break;
      }

      // เตรียมรอบถัดไป
      x = xNew.slice();
    }

    // บันทึกผล
    const r = b.map((bi, i) => bi - a[i].reduce((s, aij, j) => s + aij * x[j], 0));
    setX(x);
    setIters(k);
    setResidual(norm2(r));
  };

  const fmt = (v) =>
    Number.isFinite(v) ? format(v, { notation: "fixed", precision: DECIMALS }) : "—";

  // ---------- render ----------
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Jacobi Iteration</h1>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="text-sm text-gray-600">Matrix size (N×N)</label>
          <input
            type="number"
            value={n}
            onChange={(e) => handleResize(e.target.value)}
            className="block w-28 border rounded px-3 py-2"
            min={1}
            max={8}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">tolerance</label>
          <input
            type="number"
            step="any"
            value={tol}
            onChange={(e) => { setTol(e.target.value); }}
            className="block w-36 border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">max iterations</label>
          <input
            type="number"
            value={maxIter}
            onChange={(e) => { setMaxIter(e.target.value); }}
            className="block w-36 border rounded px-3 py-2"
            min={1}
          />
        </div>

        <label className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={useCustomX0}
            onChange={(e) => { setUseCustomX0(e.target.checked); }}
          />
          <span className="text-sm">Use custom initial guess {`{X}⁰`}</span>
        </label>

        <button
          onClick={reset}
          className="px-3 py-2 rounded bg-red-500 text-white"
          title="Reset"
        >
          ⟲
        </button>

        <button
          onClick={calculate}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Calculate!
        </button>
      </div>

      {/* warnings/errors */}
      {msg && (
        <div className={`mb-4 p-3 rounded border ${msg.startsWith("Error") ? "bg-red-50 text-red-900 border-red-200" : "bg-yellow-50 text-yellow-900 border-yellow-200"}`}>
          {msg}
        </div>
      )}

      {/* Grids */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-start">
        {/* A */}
        <div>
          <div className="text-center mb-2 text-sm text-gray-500">[A]</div>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(60px, 1fr))`, gap: "8px" }}
          >
            {Array.from({ length: n }).map((_, r) =>
              Array.from({ length: n }).map((__, c) => (
                <input
                  key={`a-${r}-${c}`}
                  value={A[r][c]}
                  onChange={(e) => {
                    const v = e.target.value;
                    setA((prev) => {
                      const copy = prev.map((row) => [...row]);
                      copy[r][c] = v;
                      return copy;
                    });
                    clearResult();
                  }}
                  placeholder={`a${r + 1}${c + 1}`}
                  className="border rounded px-2 py-2 text-center"
                />
              ))
            )}
          </div>
        </div>

        <div className="self-center text-xl text-gray-500">×</div>

        {/* x preview */}
        <div>
          <div className="text-center mb-2 text-sm text-gray-500">{`{x}`}</div>
          <div className="grid" style={{ gridTemplateRows: `repeat(${n}, 1fr)`, gap: "8px" }}>
            {Array.from({ length: n }).map((_, r) => (
              <input
                key={`x-${r}`}
                disabled
                placeholder={`x${r + 1}`}
                className="border rounded px-2 py-2 text-center bg-gray-50"
              />
            ))}
          </div>
        </div>

        <div className="self-center text-xl text-gray-500">=</div>

        {/* B */}
        <div>
          <div className="text-center mb-2 text-sm text-gray-500">{`{B}`}</div>
          <div className="grid" style={{ gridTemplateRows: `repeat(${n}, 1fr)`, gap: "8px" }}>
            {Array.from({ length: n }).map((_, r) => (
              <input
                key={`b-${r}`}
                value={B[r]}
                onChange={(e) => {
                  const v = e.target.value;
                  setB((prev) => {
                    const copy = prev.slice();
                    copy[r] = v;
                    return copy;
                  });
                  clearResult();
                }}
                placeholder={`b${r + 1}`}
                className="border rounded px-2 py-2 text-center"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Optional X0 */}
      {useCustomX0 && (
        <div className="mt-6">
          <div className="text-center mb-2 text-sm text-gray-500">{`{X}⁰`}</div>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(80px, 1fr))`, gap: "8px" }}
          >
            {Array.from({ length: n }).map((_, i) => (
              <input
                key={`x0-${i}`}
                value={X0[i]}
                onChange={(e) => {
                  const v = e.target.value;
                  setX0((prev) => {
                    const copy = prev.slice();
                    copy[i] = v;
                    return copy;
                  });
                  clearResult();
                }}
                placeholder={`x${i + 1}`}
                className="border rounded px-2 py-2 text-center"
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {X.length === n && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold">Solution (Jacobi)</h3>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(80px, 1fr))`, gap: "8px" }}
          >
            {X.map((xi, i) => (
              <div key={i} className="border rounded px-3 py-2 text-center bg-blue-50">
                x{i + 1} = <b>{fmt(xi)}</b>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-700">
            Iterations: <b>{iters}</b>
            {residual !== null && (
              <> &nbsp; | &nbsp; Final ‖b - A x‖₂:{" "}
                <b>{format(residual, { notation: "exponential", precision: 3 })}</b>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Jacobi;
