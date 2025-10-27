import React, { useMemo, useState } from "react";
import { format } from "mathjs";

const makeA = (n) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => ""));
const makeB = (n) => Array.from({ length: n }, () => "");
const makeX0 = (n) => Array.from({ length: n }, () => "");

function Seidel() {
  const [n, setN] = useState(3);
  const [A, setA] = useState(makeA(3));
  const [B, setB] = useState(makeB(3));
  const [X0, setX0] = useState(makeX0(3));
  const [X, setX] = useState([]);
  const [iters, setIters] = useState(0);
  const [tol, setTol] = useState(1e-6);
  const [maxIter, setMaxIter] = useState(100);
  const [note, setNote] = useState("");

  const DECIMALS = 6;

  const handleResize = (val) => {
    const m = Math.max(1, Math.min(8, Number(val) || 1));
    setN(m);
    setA(makeA(m));
    setB(makeB(m));
    setX0(makeX0(m));
    setX([]);
    setIters(0);
    setNote("");
  };

  const reset = () => {
    setA(makeA(n));
    setB(makeB(n));
    setX0(makeX0(n));
    setX([]);
    setIters(0);
    setNote("");
  };

  // ตรวจสอบ (weak) diagonal dominance เพื่อเตือนผู้ใช้
  const diagHint = useMemo(() => {
    try {
      const a = A.map((row) => row.map((v) => parseFloat(v) || 0));
      let ok = true;
      for (let i = 0; i < n; i++) {
        const diag = Math.abs(a[i][i]);
        const off = a[i].reduce((s, v, j) => (j === i ? s : s + Math.abs(v)), 0);
        if (diag < off) ok = false;
      }
      return ok;
    } catch {
      return true;
    }
  }, [A, n]);

  const calculate = () => {
    setNote("");
    // 1) แปลงอินพุตเป็นตัวเลข
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
    // x เริ่มต้น
    let x = Array.from({ length: n }, (_, i) => {
      const v = parseFloat(X0[i]);
      return Number.isFinite(v) ? v : 0;
    });

    // 2) ตรวจศูนย์บนแนวทแยง (จำเป็นต่อการอัปเดต)
    for (let i = 0; i < n; i++) {
      if (Math.abs(a[i][i]) < 1e-15) {
        setX([]);
        setIters(0);
        setNote("พบ a[i][i] = 0 ที่แถว " + (i + 1) + " — ลองสลับแถวหรือปรับระบบสมการให้แถวนี้มีค่าสัมประสิทธิ์บนแนวทแยง ≠ 0");
        return;
      }
    }

    // 3) Gauss–Seidel iteration
    const TOL = Number(tol) || 1e-6;
    const MAX = Math.max(1, parseInt(maxIter) || 100);
    let iter = 0;
    let converged = false;

    while (iter < MAX) {
      iter++;
      let maxDelta = 0;

      for (let i = 0; i < n; i++) {
        // sigma = Σ_{j≠i} a[i][j] * x_j  (ใช้ค่าที่อัปเดตแล้วฝั่งซ้าย, ค่ารอบก่อนฝั่งขวา — ตามสูตร GS)
        let sigma = 0;
        for (let j = 0; j < n; j++) {
          if (j !== i) sigma += a[i][j] * x[j];
        }
        const xi_old = x[i];
        const xi_new = (b[i] - sigma) / a[i][i];
        x[i] = xi_new;

        const delta = Math.abs(xi_new - xi_old);
        if (delta > maxDelta) maxDelta = delta;
      }

      if (maxDelta < TOL) {
        converged = true;
        break;
      }
    }

    setX(x.slice());
    setIters(iter);
    if (!diagHint) {
      setNote((p) => (p ? p + " • " : "") + "คำเตือน: เมทริกซ์อาจไม่เด่นทแยง (not diagonally dominant) — อาจคอนเวอร์จช้า/ไม่คอนเวอร์จ");
    }
    if (!converged) {
      setNote((p) => (p ? p + " • " : "") + `ไม่คอนเวอร์จภายใน ${MAX} รอบ (ลองเพิ่ม max iterations หรือลองเดา x(0) ใหม่)`);
    }
  };

  const fmt = (v) =>
    Number.isFinite(v)
      ? format(v, { notation: "fixed", precision: DECIMALS })
      : "—";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gauss–Seidel Method</h1>

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
          <label className="text-sm text-gray-600">Tolerance</label>
          <input
            type="number"
            step="any"
            value={tol}
            onChange={(e) => setTol(e.target.value)}
            className="block w-36 border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Max Iterations</label>
          <input
            type="number"
            value={maxIter}
            onChange={(e) => setMaxIter(e.target.value)}
            className="block w-36 border rounded px-3 py-2"
            min={1}
          />
        </div>

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

      {/* Grids */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-start">
        {/* A */}
        <div>
          <div className="text-center mb-2 text-sm text-gray-500">[A]</div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(60px, 1fr))`,
              gap: "8px",
            }}
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
                  }}
                  placeholder={`a${r + 1}${c + 1}`}
                  className="border rounded px-2 py-2 text-center"
                />
              ))
            )}
          </div>
        </div>

        <div className="self-center text-xl text-gray-500">×</div>

        {/* x (initial guess editor) */}
        <div>
          <div className="text-center mb-2 text-sm text-gray-500">{`x(0)`}</div>
          <div
            className="grid"
            style={{ gridTemplateRows: `repeat(${n}, 1fr)`, gap: "8px" }}
          >
            {Array.from({ length: n }).map((_, r) => (
              <input
                key={`x0-${r}`}
                value={X0[r]}
                onChange={(e) => {
                  const v = e.target.value;
                  setX0((prev) => {
                    const copy = prev.slice();
                    copy[r] = v;
                    return copy;
                  });
                }}
                placeholder={`x${r + 1}(0)`}
                className="border rounded px-2 py-2 text-center"
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            เว้นว่าง = 0 (เดาเริ่มต้น)
          </div>
        </div>

        <div className="self-center text-xl text-gray-500">=</div>

        {/* B */}
        <div>
          <div className="text-center mb-2 text-sm text-gray-500">{`{B}`}</div>
          <div
            className="grid"
            style={{ gridTemplateRows: `repeat(${n}, 1fr)`, gap: "8px" }}
          >
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
                }}
                placeholder={`b${r + 1}`}
                className="border rounded px-2 py-2 text-center"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Note / Warnings */}
      {note && (
        <div className="mt-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
          {note}
        </div>
      )}

      {/* Results */}
      {X.length === n && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">
            Solution (after {iters} {iters === 1 ? "iteration" : "iterations"})
          </h3>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(80px, 1fr))`,
              gap: "8px",
            }}
          >
            {X.map((xi, i) => (
              <div
                key={i}
                className="border rounded px-3 py-2 text-center bg-blue-50"
              >
                x{i + 1} = <b>{fmt(xi)}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Seidel;
