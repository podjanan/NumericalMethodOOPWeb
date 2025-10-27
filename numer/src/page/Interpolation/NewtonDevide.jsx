import { useEffect, useState } from "react";

function NewtonDivide() {
  const [Points, setPoints] = useState(3);
  const [xs, setXs] = useState(Array(3).fill(""));   // x_i (string -> คุม input ลื่น ๆ)
  const [ys, setYs] = useState(Array(3).fill(""));   // f(x_i)
  const [Xval, setXval] = useState("");

  const [coeffs, setCoeffs] = useState([]);          // a0..a_{n-1} จากตาราง
  const [table, setTable] = useState([]);            // ตาราง divided difference
  const [result, setResult] = useState(null);        // P(Xval)
  const [msg, setMsg] = useState("");

  // ปรับขนาดอาเรย์และรักษาค่าเดิมเมื่อ Points เปลี่ยน
  useEffect(() => {
    setXs((prev) => {
      const next = Array(Points).fill("");
      for (let i = 0; i < Math.min(prev.length, Points); i++) next[i] = prev[i];
      return next;
    });
    setYs((prev) => {
      const next = Array(Points).fill("");
      for (let i = 0; i < Math.min(prev.length, Points); i++) next[i] = prev[i];
      return next;
    });
    setCoeffs([]);
    setTable([]);
    setResult(null);
    setMsg("");
  }, [Points]);

  const setX = (i, val) =>
    setXs((prev) => {
      const next = prev.slice();
      next[i] = val;
      return next;
    });

  const setY = (i, val) =>
    setYs((prev) => {
      const next = prev.slice();
      next[i] = val;
      return next;
    });

  // สร้างตาราง divided difference
  const dividedDiffTable = (xArr, yArr) => {
    const n = xArr.length;
    const T = Array.from({ length: n }, () => Array(n).fill(null));
    for (let i = 0; i < n; i++) T[i][0] = yArr[i];
    for (let j = 1; j < n; j++) {
      for (let i = 0; i < n - j; i++) {
        const denom = xArr[i + j] - xArr[i];
        T[i][j] = (T[i + 1][j - 1] - T[i][j - 1]) / denom;
      }
    }
    const a = T[0].slice(0, n); // coefficients a0..a_{n-1}
    return { T, a };
  };

  // ประเมินค่าพหุนามในรูป Newton ที่ X
  const evaluateNewton = (xArr, a, X) => {
    let sum = a[0];
    let prod = 1;
    for (let k = 1; k < a.length; k++) {
      prod *= (X - xArr[k - 1]);
      sum += a[k] * prod;
    }
    return sum;
  };

  const calculate = () => {
    try {
      setMsg("");
      setResult(null);
      setCoeffs([]);
      setTable([]);

      // 1) แปลงค่าเป็นตัวเลข + ตรวจอินพุต
      const xNums = xs.map((t) => (t === "" ? NaN : Number(t)));
      const yNums = ys.map((t) => (t === "" ? NaN : Number(t)));
      const X = Xval === "" ? NaN : Number(Xval);

      if (xNums.some((v) => !Number.isFinite(v)) || yNums.some((v) => !Number.isFinite(v))) {
        setMsg("กรอก x_i และ f(x_i) ให้ครบและเป็นตัวเลข");
        return;
      }
      if (!Number.isFinite(X)) {
        setMsg("กรอก X value ให้เป็นตัวเลข");
        return;
      }

      // 2) ห้ามมีค่า x_i ซ้ำ (จะทำให้หาร 0)
      const seen = new Set();
      for (const xv of xNums) {
        if (seen.has(xv)) {
          setMsg("พบค่า x_i ซ้ำกัน — หลีกเลี่ยง x ซ้ำ");
          return;
        }
        seen.add(xv);
      }

      // 3) สร้างตาราง + ค่าสัมประสิทธิ์
      const { T, a } = dividedDiffTable(xNums, yNums);

      // 4) คำนวณค่าพหุนามที่ X
      const pX = evaluateNewton(xNums, a, X);

      setTable(T);
      setCoeffs(a);
      setResult(pX);
    } catch (e) {
      console.error(e);
      setMsg("เกิดข้อผิดพลาดในการคำนวณ");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center m-3">Newton&apos;s Divided Difference</h1>

      <div className="flex justify-center items-center gap-3 flex-wrap">
        <label>Points</label>
        <input
          type="number"
          className="border p-2 m-1"
          min={2}
          max={12}
          value={Points}
          onChange={(e) => {
            const v = Math.max(2, Math.min(12, parseInt(e.target.value || "2", 10)));
            setPoints(v);
          }}
        />

        <label>X value</label>
        <input
          type="number"
          className="border p-2 m-1"
          value={Xval}
          onChange={(e) => setXval(e.target.value)}
        />

        <button onClick={calculate} className="border px-4 py-2 rounded-xl bg-green-300">
          Calculate
        </button>
      </div>

      <div className="grid justify-center items-center mt-4">
        {Array.from({ length: Points }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {/* checkbox ของคุณจะใช้เป็นตัวเปิด/ปิดจุดก็ได้ แต่ตอนนี้ยังไม่ผูก */}
            <input type="checkbox" className="m-1" readOnly />
            <label className="m-1 w-8 text-right">{i}.</label>
            <input
              className="border p-1 m-1 w-28 text-center"
              type="number"
              placeholder={`x${i}`}
              value={xs[i] ?? ""}
              onChange={(e) => setX(i, e.target.value)}
            />
            <input
              className="border p-1 m-1 w-28 text-center"
              type="number"
              placeholder={`f(x${i})`}
              value={ys[i] ?? ""}
              onChange={(e) => setY(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {msg && (
        <div className="max-w-xl mx-auto mt-3 p-3 rounded bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm">
          {msg}
        </div>
      )}

      {coeffs.length > 0 && (
        <div className="max-w-3xl mx-auto mt-6">
          <div className="flex flex-wrap gap-2">
            {coeffs.map((a, i) => (
              <div key={i} className="px-3 py-2 border rounded ">
                a{i} = <b>{Number.isFinite(a) ? a : String(a)}</b>
              </div>
            ))}
          </div>

          {result !== null && (
            <div className="mt-4 p-3 border rounded ">
              P({Xval}) = <b>{result}</b>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default NewtonDivide;
