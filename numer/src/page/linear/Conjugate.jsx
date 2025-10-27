import React, { useState } from "react";
import { format } from "mathjs";

// ---------- helpers to create inputs ----------
const makeA = (n) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => ""));
const makeB = (n) => Array.from({ length: n }, () => "");

// ---------- Component ----------
function ConjugateGradient() {
  const [n, setN] = useState(3);
  const [A, setA] = useState(makeA(3));
  const [B, setB] = useState(makeB(3));

  const [useCustomX0, setUseCustomX0] = useState(false);
  const [X0, setX0] = useState(Array(3).fill(""));

  const [X, setX] = useState([]);
  const [iters, setIters] = useState(0);
  const [residual, setResidual] = useState(null);
  const [warn, setWarn] = useState("");

  const [tol, setTol] = useState(1e-8);
  const [maxIter, setMaxIter] = useState(1000);

  const DECIMALS = 6;

  // ---------- UI actions ----------
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
    setWarn("");
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

  const isSymmetric = (M, eps = 1e-10) => {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(M[i][j] - M[j][i]) > eps) return false;
      }
    }
    return true;
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

  const dot = (u, v) => {
    let s = 0;
    for (let i = 0; i < u.length; i++) s += u[i] * v[i];
    return s;
  };

  const axpy = (y, a, x) => {
    const out = new Array(y.length);
    for (let i = 0; i < y.length; i++) out[i] = y[i] + a * x[i];
    return out;
  };

  // ---------- main CG ----------
  const calculate = () => {
    const { a, b } = toNumeric();
    setWarn("");

    if (!isSymmetric(a)) {
      setWarn("Warning: A is not symmetric. CG may fail or converge poorly.");
    }

    // initial guess
    let x = useCustomX0
      ? Array.from({ length: n }, (_, i) => {
          const v = parseFloat(X0[i]);
          return Number.isFinite(v) ? v : 0;
        })
      : new Array(n).fill(0);

    let r = axpy(b, -1, matVec(a, x)); // r0 = b - A x0
    let p = r.slice();
    let rsold = dot(r, r);

    const maxK = Math.max(1, Number(maxIter) || 1000);
    const tolVal = Math.max(0, Number(tol) || 1e-8);
    const EPS_DENOM = 1e-30;

    if (Math.sqrt(rsold) <= tolVal) {
      setX(x);
      setIters(0);
      setResidual(Math.sqrt(rsold));
      return;
    }

    let k = 0;
    for (; k < maxK; k++) {
      const Ap = matVec(a, p);
      const pAp = dot(p, Ap);
      if (pAp <= EPS_DENOM) {
        setWarn((w) => (w ? w + " " : "") + "Breakdown: pᵀAp ≤ 0. A may not be SPD.");
        break;
      }

      const alpha = rsold / pAp;
      x = axpy(x, alpha, p);        // x_{k+1}
      r = axpy(r, -alpha, Ap);      // r_{k+1}

      const rsnew = dot(r, r);
      const resNorm = Math.sqrt(rsnew);
      if (resNorm <= tolVal) {
        k += 1; // current iter done
        setX(x);
        setIters(k);
        setResidual(resNorm);
        return;
      }

      const beta = rsnew / rsold;
      for (let i = 0; i < n; i++) p[i] = r[i] + beta * p[i];
      rsold = rsnew;
    }

    setX(x);
    setIters(k);
    setResidual(Math.sqrt(rsold));
  };

  // ---------- format ----------
  const fmt = (v) =>
    Number.isFinite(v)
      ? format(v, { notation: "fixed", precision: DECIMALS })
      : "—";

  // ---------- render ----------
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Conjugate Gradient Method</h1>

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
            onChange={(e) => { setTol(e.target.value); clearResult(); }}
            className="block w-36 border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">max iterations</label>
          <input
            type="number"
            value={maxIter}
            onChange={(e) => { setMaxIter(e.target.value); clearResult(); }}
            className="block w-36 border rounded px-3 py-2"
            min={1}
          />
        </div>

        <label className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={useCustomX0}
            onChange={(e) => { setUseCustomX0(e.target.checked); clearResult(); }}
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
          Solve
        </button>
      </div>

      {warn && (
        <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-900 border border-yellow-200">
          {warn}
        </div>
      )}

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

        {/* x preview (disabled) */}
        <div>
          <div className="text-center mb-2 text-sm text-gray-500">{`{x}`}</div>
          <div
            className="grid"
            style={{ gridTemplateRows: `repeat(${n}, 1fr)`, gap: "8px" }}
          >
            {Array.from({ length: n }).map((_, r) => (
              <input
                key={`x-preview-${r}`}
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
          <h3 className="font-semibold">Solution</h3>
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
              <> &nbsp; | &nbsp; Final ‖r‖₂:{" "}
                <b>{format(residual, { notation: "exponential", precision: 3 })}</b>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConjugateGradient;
