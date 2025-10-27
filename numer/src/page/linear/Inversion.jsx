import React, { useMemo, useState } from "react";
import { det, format } from "mathjs";

const makeA = (n) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => ""));
const makeB = (n) => Array.from({ length: n }, () => "");


function Inversion(){
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

    const calculate = () => {
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

    const EPS = 1e-12;

    // (ทางเลือก) เช็คดีเทอร์มิแนนต์ว่าใกล้ศูนย์ไหม
    // ถ้า import { det } จาก mathjs อยู่แล้ว ใช้ได้
    try {
        const d = det(a);
        if (!Number.isFinite(d) || Math.abs(d) < EPS) {
        setX([]);
        return;
        }
    } catch {
        // ถ้า det คำนวณไม่สำเร็จ ก็ปล่อยให้ไปเช็ค pivot ทีหลัง
    }

    // 2) เตรียม [A | I]
    const aug = Array.from({ length: n }, (_, r) => [
        ...a[r],
        ...Array.from({ length: n }, (__, c) => (r === c ? 1 : 0)),
    ]);

    // 3) Gauss-Jordan หา A^{-1} (บนครึ่งซ้ายทำให้เป็น I, ครึ่งขวาจะกลายเป็น A^{-1})
    for (let i = 0; i < n; i++) {
        // partial pivoting ที่คอลัมน์ i
        let pivotRow = i;
        for (let r = i + 1; r < n; r++) {
        if (Math.abs(aug[r][i]) > Math.abs(aug[pivotRow][i])) pivotRow = r;
        }
        if (Math.abs(aug[pivotRow][i]) < EPS) {
        setX([]);
        return; // เอกฐาน/เกือบเอกฐาน
        }

        // สลับแถวถ้าจำเป็น (ทั้งซ้ายและขวาใน aug)
        if (pivotRow !== i) {
        [aug[i], aug[pivotRow]] = [aug[pivotRow], aug[i]];
        }

        // ทำ pivot = 1 (normalize)
        const piv = aug[i][i];
        for (let c = 0; c < 2 * n; c++) aug[i][c] /= piv;

        // ล้างทั้งเหนือและใต้ pivot ให้เป็นศูนย์
        for (let r = 0; r < n; r++) {
        if (r === i) continue;
        const factor = aug[r][i];
        if (Math.abs(factor) < EPS) continue;
        for (let c = i; c < 2 * n; c++) {
            aug[r][c] -= factor * aug[i][c];
        }
        }
    }

    // ตอนนี้ครึ่งซ้ายเป็น I แล้ว ครึ่งขวาคือ A^{-1}
    const invA = Array.from({ length: n }, (_, r) =>
        aug[r].slice(n, 2 * n)
    );

    // 4) คูณ x = A^{-1} * b
    const x = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += invA[i][j] * b[j];
        x[i] = sum;
    }

    setX(x);
    };
      
      const fmt = (v) =>
        Number.isFinite(v)
          ? format(v, { notation: "fixed", precision: DECIMALS })
          : "—";

    return (
        <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Matrix inversion</h1>

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
    )
}
export default Inversion;
