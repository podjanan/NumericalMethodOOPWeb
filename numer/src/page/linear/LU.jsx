import React, { useMemo, useState } from "react";
import { format } from "mathjs";

const makeA = (n) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => ""));
const makeB = (n) => Array.from({ length: n }, () => "");

function LU() {
  const [n, setN] = useState(3);
  const [A, setA] = useState(makeA(3));
  const [B, setB] = useState(makeB(3));
  const [X, setX] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const DECIMALS = 6;
  const EPS = 1e-12;

  const handleResize = (val) => {
    const m = Math.max(1, Math.min(8, Number(val) || 1));
    setN(m);
    setA(makeA(m));
    setB(makeB(m));
    setX([]);
    setErrorMsg("");
  };

  const reset = () => {
    setA(makeA(n));
    setB(makeB(n));
    setX([]);
    setErrorMsg("");
  };

  // ---------- LU (Doolittle) with Partial Pivoting: PA = LU ----------
  function luDecompose(Ain) {
    const n = Ain.length;
    const U = Ain.map((row) => row.slice());
    const L = Array.from({ length: n }, () => Array(n).fill(0));
    const P = Array.from({ length: n }, (_, i) => i); // permutation vector

    for (let k = 0; k < n; k++) {
      // pivot: row with max |U[i][k]| for i >= k
      let piv = k;
      for (let r = k + 1; r < n; r++) {
        if (Math.abs(U[r][k]) > Math.abs(U[piv][k])) piv = r;
      }
      if (Math.abs(U[piv][k]) < EPS) {
        throw new Error("Matrix is singular or nearly singular at column " + (k + 1));
      }

      // swap rows in U
      if (piv !== k) {
        [U[piv], U[k]] = [U[k], U[piv]];
        // swap rows in L (only first k columns are valid)
        for (let c = 0; c < k; c++) {
          [L[piv][c], L[k][c]] = [L[k][c], L[piv][c]];
        }
        // swap permutation
        [P[piv], P[k]] = [P[k], P[piv]];
      }

      // Doolittle steps
      for (let i = k + 1; i < n; i++) {
        L[i][k] = U[i][k] / U[k][k];
        for (let j = k; j < n; j++) {
          U[i][j] -= L[i][k] * U[k][j];
        }
      }
    }

    // set diag(L)=1
    for (let i = 0; i < n; i++) L[i][i] = 1;

    return { L, U, P };
  }

  function forwardSubstitution(L, b) {
    const n = L.length;
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
      // L[i][i] = 1 in Doolittle
      y[i] = b[i] - sum;
    }
    return y;
  }

  function backSubstitution(U, y) {
    const n = U.length;
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) sum += U[i][j] * x[j];
      const denom = U[i][i];
      if (Math.abs(denom) < EPS) throw new Error("Zero pivot on back substitution");
      x[i] = (y[i] - sum) / denom;
    }
    return x;
  }

  const calculate = () => {
    setErrorMsg("");
    // แปลงอินพุตเป็นตัวเลข
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

    try {
      // 1) LU with partial pivoting: PA = LU
      const { L, U, P } = luDecompose(a);

      // 2) Pb (apply permutation to b)
      const Pb = P.map((pi) => b[pi]);

      // 3) Solve Ly = Pb
      const y = forwardSubstitution(L, Pb);

      // 4) Solve Ux = y
      const x = backSubstitution(U, y);

      setX(x);
    } catch (err) {
      setX([]);
      setErrorMsg(err.message || "คำนวณไม่สำเร็จ");
    }
  };

  const fmt = (v) =>
    Number.isFinite(v) ? format(v, { notation: "fixed", precision: DECIMALS }) : "—";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">LU Decomposition Method</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
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

        <button
          onClick={reset}
          className="px-3 py-2 rounded bg-red-500 text-white self-end"
          title="Reset"
        >
          ⟲
        </button>

        <button
          onClick={calculate}
          className="px-4 py-2 rounded bg-blue-600 text-white self-end"
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
                  }}
                  placeholder={`a${r + 1}${c + 1}`}
                  className="border rounded px-2 py-2 text-center"
                />
              ))
            )}
          </div>
        </div>

        <div className="self-center text-xl text-gray-500">×</div>

        {/* x (preview) */}
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
                }}
                placeholder={`b${r + 1}`}
                className="border rounded px-2 py-2 text-center"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {errorMsg && (
        <p className="mt-4 text-center text-red-600 font-medium">{errorMsg}</p>
      )}

      {X.length === n && !errorMsg && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Solution</h3>
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
        </div>
      )}
    </div>
  );
}
export default LU;
