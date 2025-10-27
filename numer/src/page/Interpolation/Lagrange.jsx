import { useEffect, useState } from "react";

function LagrangeInterpolation() {
  const [Points, setPoints] = useState(3);
  const [xs, setXs] = useState(Array(3).fill(""));
  const [ys, setYs] = useState(Array(3).fill(""));
  const [usePt, setUsePt] = useState(Array(3).fill(true)); // <- จุดที่เลือกใช้
  const [Xval, setXval] = useState("");
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");

  // resize + รักษาค่าเดิม
  useEffect(() => {
    const resize = (prev) => {
      const next = Array(Points).fill("");
      for (let i = 0; i < Math.min(prev.length, Points); i++) next[i] = prev[i];
      return next;
    };
    setXs((p) => resize(p));
    setYs((p) => resize(p));
    setUsePt((p) => {
      const next = Array(Points).fill(true);
      for (let i = 0; i < Math.min(p.length, Points); i++) next[i] = p[i];
      return next;
    });
    setResult(null);
    setMsg("");
  }, [Points]);

  const setX = (i, v) => setXs((p) => { const a = p.slice(); a[i] = v; return a; });
  const setY = (i, v) => setYs((p) => { const a = p.slice(); a[i] = v; return a; });
  const toggleUse = (i) =>
    setUsePt((p) => { const a = p.slice(); a[i] = !a[i]; return a; });

  // Lagrange
  const calculate = () => {
    setMsg(""); setResult(null);

    // เลือกเฉพาะจุดที่ถูกติ๊ก
    const selIdx = usePt.map((b, i) => (b ? i : -1)).filter((i) => i !== -1);
    if (selIdx.length < 2) { setMsg("เลือกอย่างน้อย 2 จุด"); return; }

    const xNums = selIdx.map((i) => (xs[i] === "" ? NaN : Number(xs[i])));
    const yNums = selIdx.map((i) => (ys[i] === "" ? NaN : Number(ys[i])));
    const X = Xval === "" ? NaN : Number(Xval);

    if (xNums.some((v) => !Number.isFinite(v)) || yNums.some((v) => !Number.isFinite(v)) || !Number.isFinite(X)) {
      setMsg("กรอก x_i, f(x_i) และ X ให้ครบและเป็นตัวเลข");
      return;
    }

    const seen = new Set();
    for (const xv of xNums) { if (seen.has(xv)) { setMsg("ค่า x_i ซ้ำกัน"); return; } seen.add(xv); }
    for (let i = 0; i < xNums.length; i++) { if (X === xNums[i]) { setResult(yNums[i]); return; } }

    let pX = 0, n = xNums.length;
    for (let i = 0; i < n; i++) {
      let Li = 1;
      for (let j = 0; j < n; j++) if (j !== i) Li *= (X - xNums[j]) / (xNums[i] - xNums[j]);
      pX += yNums[i] * Li;
    }
    setResult(pX);
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center m-3">Lagrange Interpolation</h1>

      <div className="flex justify-center items-center gap-3 flex-wrap">
        <label>Points</label>
        <input
          type="number" className="border p-2 m-1" min={2} max={12}
          value={Points}
          onChange={(e) => setPoints(Math.max(2, Math.min(12, parseInt(e.target.value || "2", 10))))}
        />
        <label>X value</label>
        <input type="number" className="border p-2 m-1" value={Xval} onChange={(e) => setXval(e.target.value)} />
        <button onClick={calculate} className="border px-4 py-2 rounded-xl bg-green-300">Calculate</button>
      </div>

      <div className="grid justify-center items-center mt-4">
        {Array.from({ length: Points }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <input
              type="checkbox" className="m-1"
              checked={usePt[i] ?? false}
              onChange={() => toggleUse(i)}
            />
            <label className="m-1 w-8 text-right">{i}.</label>
            <input
              className="border p-1 m-1 w-28 text-center" type="number"
              placeholder={`x${i}`} value={xs[i] ?? ""} onChange={(e) => setX(i, e.target.value)}
            />
            <input
              className="border p-1 m-1 w-28 text-center" type="number"
              placeholder={`f(x${i})`} value={ys[i] ?? ""} onChange={(e) => setY(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {msg && <div className="max-w-xl mx-auto mt-3 p-3 rounded bg-yellow-50 border text-sm">{msg}</div>}
      {result !== null && (
        <div className="max-w-xl mx-auto mt-4 p-3 border rounded text-center">
          P({Xval}) = <b>{result}</b>
        </div>
      )}
    </>
  );
}

export default LagrangeInterpolation;
