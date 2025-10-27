import React, { useMemo, useState } from "react";
import { det, format } from "mathjs";

const makeA = (n) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => ""));
const makeB = (n) => Array.from({ length: n }, () => "");

export default function CramersRule() {
  const [n, setN] = useState(3);
  const [A, setA] = useState(makeA(3));
  const [B, setB] = useState(makeB(3));
  const [X, setX] = useState([]);

  const DECIMALS = 6;

  const handleResize = (val) => {
    const m = Math.max(1, Math.min(8, Number(val) || 1));
    setN(m);
    setA(makeA(m));
    setB(makeB(m));
    setX([]);
  };

  const reset = () => {
    setA(makeA(n));
    setB(makeB(n));
    setX([]);
  };

  const toNumberMatrix = useMemo(() => {
    try {
      const An = A.map((row) => row.map((v) => Number(v)));
      const Bn = B.map((v) => Number(v[0] ?? v));
      if (An.flat().some((v) => !Number.isFinite(v)) || Bn.some((v) => !Number.isFinite(v))) {
        return null;
      }
      return { An, Bn };
    } catch {
      return null;
    }
  }, [A, B]);

  const calculate = () => {
    setX([]);
    const { An, Bn } = toNumberMatrix;

    const detA = det(An);
    if (Math.abs(detA) < 1e-12) {
      return;
    }

    const xs = [];
    for (let i = 0; i < n; i++) {
      const Ai = An.map((row, r) => row.map((val, c) => (c === i ? Bn[r] : val)));
      const detAi = det(Ai);
      xs.push(detAi / detA);
    }
    setX(xs);
  };

  const fmt = (v) =>
    Number.isFinite(v)
      ? format(v, { notation: "fixed", precision: DECIMALS })
      : "—";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Cramer's Rule</h1>

      {/* Controls (ไม่มี ε แล้ว) */}
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
      {X.length === n && (
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
