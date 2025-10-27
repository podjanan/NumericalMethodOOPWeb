import { useState, useMemo } from "react";

function MultiRegression() {
  const [nPoints, setNPoints] = useState(4);
  const [nFeatures, setNFeatures] = useState(2);

  const [X, setX] = useState([]);
  const [y, setY] = useState([]);

  const [xPredict, setXPredict] = useState([]);
  const [beta, setBeta] = useState(null); 
  const [yhat, setYhat] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const toNum = (v) => (v === "" || v === null ? NaN : Number(v));

  const ensureShapes = () => {
    // X
    const X2 = Array.from({ length: nPoints }, (_, i) =>
      Array.from({ length: nFeatures }, (_, j) => (X[i]?.[j] ?? NaN))
    );
    // y
    const y2 = Array.from({ length: nPoints }, (_, i) => (y[i] ?? NaN));
    // xPredict
    const xp2 = Array.from({ length: nFeatures }, (_, j) => (xPredict[j] ?? NaN));
    setX(X2);
    setY(y2);
    setXPredict(xp2);
  };

  // สร้าง X_design = [1, X] (เติมคอลัมน์ 1 สำหรับ bias/สัดส่วนเฉื่อย)
  function buildDesignMatrix(Xraw) {
    const n = Xraw.length;
    const p = nFeatures + 1;
    const Xd = Array.from({ length: n }, (_, i) => {
      const row = new Array(p);
      row[0] = 1; // intercept
      for (let j = 0; j < nFeatures; j++) row[j + 1] = Xraw[i][j];
      return row;
    });
    return Xd;
  }

  // คูณเมทริกซ์
  function matmul(A, B) {
    const r = A.length;
    const c = B[0].length;
    const klen = B.length;
    const C = Array.from({ length: r }, () => Array(c).fill(0));
    for (let i = 0; i < r; i++) {
      for (let k = 0; k < klen; k++) {
        const aik = A[i][k];
        for (let j = 0; j < c; j++) C[i][j] += aik * B[k][j];
      }
    }
    return C;
  }

  // ทรานสโพส
  function transpose(A) {
    const r = A.length, c = A[0].length;
    const T = Array.from({ length: c }, () => Array(r).fill(0));
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) T[j][i] = A[i][j];
    return T;
  }

  // แก้ A x = b (Gaussian elimination + partial pivot)
  function solveLinear(Ain, bin) {
    const n = bin.length;
    const A = Ain.map((row) => row.slice());
    const b = bin.slice();

    for (let col = 0; col < n; col++) {
      // pivot
      let piv = col;
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
      }
      if (Math.abs(A[piv][col]) < 1e-12) throw new Error("Matrix is singular");
      if (piv !== col) {
        [A[piv], A[col]] = [A[col], A[piv]];
        [b[piv], b[col]] = [b[col], b[piv]];
      }
      // normalize
      const div = A[col][col];
      for (let j = col; j < n; j++) A[col][j] /= div;
      b[col] /= div;
      // eliminate
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = A[r][col];
        for (let j = col; j < n; j++) A[r][j] -= factor * A[col][j];
        b[r] -= factor * b[col];
      }
    }
    return b; // solution vector
  }

  // R^2 (optional)
  function rSquared(yTrue, yPred) {
    const n = yTrue.length;
    const mean = yTrue.reduce((a, b) => a + b, 0) / n;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
      ssTot += (yTrue[i] - mean) ** 2;
      ssRes += (yTrue[i] - yPred[i]) ** 2;
    }
    return 1 - ssRes / (ssTot || 1);
  }

  const modelString = useMemo(() => {
    if (!beta) return "";
    // y ≈ b0 + b1 x1 + ... + bm xm
    const terms = beta.map((b, i) => {
      const v = Math.abs(b) < 1e-12 ? 0 : b;
      const sign = i === 0 ? "" : v >= 0 ? " + " : " - ";
      const mag = Math.abs(v).toFixed(6);
      if (i === 0) return `${v.toFixed(6)}`;
      return `${sign}${mag}·x${i}`; // x1..xm
    });
    return "y ≈ " + terms.join("");
  }, [beta]);

  const [trainRSq, setTrainRSq] = useState(null);

  const handleCalc = () => {
    setErrorMsg("");
    setBeta(null);
    setYhat(null);
    setTrainRSq(null);

    // Validate shape/ค่าตัวเลข
    if (nPoints < nFeatures + 1) {
      setErrorMsg(`ต้องมีจำนวนจุดอย่างน้อย m+1 = ${nFeatures + 1} จุด`);
      return;
    }
    for (let i = 0; i < nPoints; i++) {
      for (let j = 0; j < nFeatures; j++) {
        if (!Number.isFinite(X[i]?.[j])) {
          setErrorMsg(`X แถว ${i + 1} คอลัมน์ ${j + 1} ไม่ถูกต้อง`);
          return;
        }
      }
      if (!Number.isFinite(y[i])) {
        setErrorMsg(`y แถว ${i + 1} ไม่ถูกต้อง`);
        return;
      }
    }

    try {
      // Build design matrix
      const Xd = buildDesignMatrix(X); // n x (m+1)
      const ycol = y.map((v) => [v]);  // n x 1

      // Normal equations
      const Xt = transpose(Xd);                // (m+1) x n
      const XtX = matmul(Xt, Xd);              // (m+1) x (m+1)
      const Xty = matmul(Xt, ycol).map((r) => r[0]); // (m+1) vector

      // Solve for beta
      const betaVec = solveLinear(XtX, Xty);   // length m+1
      setBeta(betaVec);

      // Predict on training to show R^2
      const yPredTrain = Xd.map((row) =>
        row.reduce((acc, v, j) => acc + v * betaVec[j], 0)
      );
      setTrainRSq(rSquared(y, yPredTrain));

      // Predict for x*
      for (let j = 0; j < nFeatures; j++) {
        if (!Number.isFinite(xPredict[j])) {
          setErrorMsg(`ค่าสำหรับทำนาย x* คอลัมน์ ${j + 1} ไม่ถูกต้อง`);
          return;
        }
      }
      const xStar = [1, ...xPredict]; // include intercept
      const yh = xStar.reduce((acc, v, j) => acc + v * betaVec[j], 0);
      setYhat(yh);
    } catch (e) {
      setErrorMsg(e.message || "คำนวณไม่สำเร็จ");
    }
  };

  // เรียกทุกครั้งที่ผู้ใช้ปรับ nPoints/nFeatures
  useMemo(() => {
    ensureShapes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nPoints, nFeatures]);

  // ----- UI -----
  return (
    <>
      <h1 className="text-3xl font-bold text-center m-4">Multiple Linear Regression</h1>

      <div className="flex flex-wrap gap-4 justify-center items-center">
        <label>Number of points (n)</label>
        <input
          className="border text-center px-2 py-1"
          type="number"
          min={1}
          value={nPoints}
          onChange={(e) => setNPoints(Math.max(1, Number(e.target.value)))}
        />

        <label>Number of features (m)</label>
        <input
          className="border text-center px-2 py-1"
          type="number"
          min={1}
          value={nFeatures}
          onChange={(e) => setNFeatures(Math.max(1, Number(e.target.value)))}
        />

        <button
          className="border px-4 py-2 rounded-xl bg-green-300"
          onClick={handleCalc}
        >
          Calculate
        </button>
      </div>

      {/* ตารางกรอก X และ y */}
      <div className="flex flex-col items-center mt-6 gap-2">
        <div className="overflow-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                {[...Array(nFeatures)].map((_, j) => (
                  <th key={`xh${j}`} className="border px-2 py-1">x{j + 1}</th>
                ))}
                <th className="border px-2 py-1">y</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(nPoints)].map((_, i) => (
                <tr key={`row${i}`}>
                  {[...Array(nFeatures)].map((_, j) => (
                    <td key={`x${i}-${j}`} className="border">
                      <input
                        type="number"
                        className="px-2 py-1 w-28 text-center"
                        value={Number.isFinite(X[i]?.[j]) ? X[i][j] : ""}
                        onChange={(e) => {
                          const v = toNum(e.target.value);
                          const X2 = X.map((row) => row.slice());
                          if (!X2[i]) X2[i] = Array.from({ length: nFeatures }, () => NaN);
                          X2[i][j] = v;
                          setX(X2);
                        }}
                      />
                    </td>
                  ))}
                  <td className="border">
                    <input
                      type="number"
                      className="px-2 py-1 w-28 text-center"
                      value={Number.isFinite(y[i]) ? y[i] : ""}
                      onChange={(e) => {
                        const v = toNum(e.target.value);
                        const y2 = y.slice();
                        y2[i] = v;
                        setY(y2);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* แถวสำหรับ x* ที่จะใช้ทำนาย */}
        <div className="mt-6">
          <div className="font-semibold text-center mb-2">X Value</div>
          <div className="flex flex-wrap justify-center gap-2">
            {[...Array(nFeatures)].map((_, j) => (
              <input
                key={`xp${j}`}
                type="number"
                className="border px-2 py-1 w-28 text-center"
                placeholder={`x*${j + 1}`}
                value={Number.isFinite(xPredict[j]) ? xPredict[j] : ""}
                onChange={(e) => {
                  const v = toNum(e.target.value);
                  const xp2 = xPredict.slice();
                  xp2[j] = v;
                  setXPredict(xp2);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="text-center text-red-600 font-medium mt-4">{errorMsg}</p>
      )}

      {beta && (
        <div className="text-center mt-6">
          <p className="font-semibold">{modelString}</p>
          <div className="mt-2 text-sm opacity-70">
            <p>β = [{beta.map((b) => b.toFixed(6)).join(", ")}]</p>
            {trainRSq != null && <p>R² (on training) = {trainRSq.toFixed(6)}</p>}
          </div>
          {Number.isFinite(yhat) && (
            <p className="text-2xl font-bold mt-3">
              ŷ (x*) ≈ {yhat.toFixed(6)}
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default MultiRegression;
