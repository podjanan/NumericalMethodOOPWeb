import { useState, useMemo } from "react";

function PolynomialRegression() {
  const [valX, setValX] = useState(0);           
  const [arrX, setArrX] = useState([]);             
  const [arrY, setArrY] = useState([]);              
  const [numberOfPoint, setNumberOfPoint] = useState(3);
  const [degree, setDegree] = useState(2);           
  const [coeffs, setCoeffs] = useState(null);        
  const [yhat, setYhat] = useState(null);            
  const [errorMsg, setErrorMsg] = useState("");

  // ---------- helpers ----------
  const toNum = (v) => (v === "" || v === null ? NaN : Number(v));

  const AddX = (index, value) => {
    const newArr = [...arrX];
    newArr[index] = toNum(value);
    setArrX(newArr);
  };
  const AddY = (index, value) => {
    const newArr = [...arrY];
    newArr[index] = toNum(value);
    setArrY(newArr);
  };

  // สร้าง Normal Equations สำหรับพหุนามดีกรี d:
  function buildNormalEquations(xs, ys, d) {
    const n = xs.length;
    const S = Array(2 * d + 1).fill(0);
    for (let k = 0; k <= 2 * d; k++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += Math.pow(xs[i], k);
      S[k] = s;
    }
    const b = Array(d + 1).fill(0);
    for (let k = 0; k <= d; k++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += ys[i] * Math.pow(xs[i], k);
      b[k] = s;
    }
    const A = Array.from({ length: d + 1 }, (_, i) =>
      Array.from({ length: d + 1 }, (_, j) => S[i + j])
    );
    return { A, b };
  }

 
  function solveLinear(Ain, bin) {
    const n = bin.length;
    const A = Ain.map((row) => row.slice());
    const b = bin.slice();

    for (let col = 0; col < n; col++) {
      
      let piv = col;
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
      }
      if (Math.abs(A[piv][col]) < 1e-12) throw new Error("Matrix is singular");
      
      if (piv !== col) {
        [A[piv], A[col]] = [A[col], A[piv]];
        [b[piv], b[col]] = [b[col], b[piv]];
      }
      // normalize + eliminate
      const div = A[col][col];
      for (let j = col; j < n; j++) A[col][j] /= div;
      b[col] /= div;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = A[r][col];
        for (let j = col; j < n; j++) A[r][j] -= factor * A[col][j];
        b[r] -= factor * b[col];
      }
    }
    return b; 
  }

  const polyString = useMemo(() => {
    if (!coeffs) return "";
    
    const terms = coeffs.map((a, i) => {
      const v = Math.abs(a) < 1e-12 ? 0 : a;
      const sign = i === 0 ? "" : v >= 0 ? " + " : " - ";
      const mag = i === 0 ? Math.abs(v) : Math.abs(v);
      if (i === 0) return `${v.toFixed(6)}`;
      if (i === 1) return `${sign}${mag.toFixed(6)}x`;
      return `${sign}${mag.toFixed(6)}x^${i}`;
    });
    return "y ≈ " + terms.join("");
  }, [coeffs]);

  const handleCalc = () => {
    setErrorMsg("");
    setYhat(null);
    setCoeffs(null);

    const n = Number(numberOfPoint) | 0;
    const d = Number(degree) | 0;
    if (d < 0) {
      setErrorMsg("degree ต้องเป็นจำนวนเต็มไม่ลบ");
      return;
    }
    if (n < d + 1) {
      setErrorMsg(`ต้องมีจำนวนจุดอย่างน้อย d+1 = ${d + 1} จุด`);
      return;
    }

    // รวบรวมข้อมูลที่เป็นตัวเลขครบถ้วน
    const xs = [];
    const ys = [];
    for (let i = 0; i < n; i++) {
      const x = Number(arrX[i]);
      const y = Number(arrY[i]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        setErrorMsg(`ค่าข้อมูลแถวที่ ${i + 1} ไม่ถูกต้อง`);
        return;
      }
      xs.push(x);
      ys.push(y);
    }

    try {
      const { A, b } = buildNormalEquations(xs, ys, d);
      const a = solveLinear(A, b); // a0..ad
      setCoeffs(a);

      const xq = Number(valX);
      const yq = a.reduce((acc, ai, i) => acc + ai * Math.pow(xq, i), 0);
      setYhat(yq);
    } catch (e) {
      setErrorMsg(e.message || "คำนวณไม่สำเร็จ");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center m-4">Polynomial Regression</h1>

      <div className="flex flex-wrap gap-4 justify-center items-center">
        <label>X</label>
        <input
          className="border text-center px-2 py-1"
          type="number"
          value={valX}
          onChange={(e) => setValX(Number(e.target.value))}
        />

        <label>Degree (d)</label>
        <input
          className="border text-center px-2 py-1"
          type="number"
          min={0}
          value={degree}
          onChange={(e) => setDegree(Math.max(0, Number(e.target.value)))}
        />

        <label>Number of points</label>
        <input
          className="border text-center px-2 py-1"
          type="number"
          min={1}
          value={numberOfPoint}
          onChange={(e) => setNumberOfPoint(Math.max(1, Number(e.target.value)))}
        />

        <button
          className="border px-4 py-2 rounded-xl bg-green-300"
          onClick={handleCalc}
        >
          Calculate
        </button>
      </div>

      <div className="grid justify-center items-center mt-4">
        {Array.from({ length: Number(numberOfPoint) || 0 }).map((_, i) => (
          <div key={i} className="flex justify-center">
            <input
              onChange={(e) => AddX(i, e.target.value)}
              type="number"
              placeholder={`x${i}`}
              className="border text-center m-1 px-2 py-1"
            />
            <input
              onChange={(e) => AddY(i, e.target.value)}
              type="number"
              placeholder={`y${i}`}
              className="border text-center m-1 px-2 py-1"
            />
          </div>
        ))}
      </div>

      {errorMsg && (
        <p className="text-center text-red-600 font-medium mt-4">{errorMsg}</p>
      )}

      {coeffs && (
        <div className="text-center mt-6">
          <p className="font-semibold">{polyString}</p>
          <p className="text-2xl font-bold mt-2">y(x={valX}) ≈ {yhat?.toFixed(6)}</p>
          <div className="mt-3 text-sm opacity-70">
            <p>a0..ad: [{coeffs.map((c) => c.toFixed(6)).join(", ")}]</p>
          </div>
        </div>
      )}
    </>
  );
}

export default PolynomialRegression;
