import React, { Component } from "react";
import RegressionBase from "./RegressionBase.jsx";
import Plot from "react-plotly.js";

export default class PolynomialRegression extends RegressionBase {
  constructor(props) {
    super(props);
    this.state = {
      valX: 0,
      arrX: [],
      arrY: [],
      numberOfPoint: 3,
      degree: 2,
      coeffs: null,
      yhat: null,
      errorMsg: "",
      curve: null, // {xs:[], ys:[]} สำหรับกราฟ
    };
  }

  AddX = (index, value) => {
    const newArr = this.state.arrX.slice();
    newArr[index] = this.toNum(value);
    this.setState({ arrX: newArr });
  };
  AddY = (index, value) => {
    const newArr = this.state.arrY.slice();
    newArr[index] = this.toNum(value);
    this.setState({ arrY: newArr });
  };

  buildNormalEquations = (xs, ys, d) => {
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
  };

  evalPoly = (a, x) => a.reduce((acc, ai, i) => acc + ai * Math.pow(x, i), 0);

  handleCalc = () => {
    const { valX, arrX, arrY, numberOfPoint, degree } = this.state;
    this.setState({ errorMsg: "", yhat: null, coeffs: null, curve: null });

    const n = Number(numberOfPoint) | 0;
    const d = Number(degree) | 0;
    if (d < 0) { this.setState({ errorMsg: "degree ต้องเป็นจำนวนเต็มไม่ลบ" }); return; }
    if (n < d + 1) { this.setState({ errorMsg: `ต้องมีจำนวนจุดอย่างน้อย d+1 = ${d + 1} จุด` }); return; }

    const xs = [], ys = [];
    for (let i = 0; i < n; i++) {
      const x = Number(arrX[i]);
      const y = Number(arrY[i]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        this.setState({ errorMsg: `ค่าข้อมูลแถวที่ ${i + 1} ไม่ถูกต้อง` });
        return;
      }
      xs.push(x); ys.push(y);
    }

    try {
      const { A, b } = this.buildNormalEquations(xs, ys, d);
      const a = this.solveLinear(A, b); // a0..ad
      const xq = Number(valX);
      const yq = this.evalPoly(a, xq);

      // เตรียมเส้นโค้ง (min..max)
      const xmin = Math.min(...xs), xmax = Math.max(...xs);
      const denseX = [], denseY = [];
      const N = 200;
      for (let t = 0; t <= N; t++) {
        const xv = xmin + (t / N) * (xmax - xmin);
        denseX.push(xv);
        denseY.push(this.evalPoly(a, xv));
      }

      this.setState({ coeffs: a, yhat: yq, curve: { xs: denseX, ys: denseY } });
    } catch (e) {
      this.setState({ errorMsg: e.message || "คำนวณไม่สำเร็จ" });
    }
  };

  get methodName() { return "Polynomial Regression"; }

  render() {
    const { valX, numberOfPoint, degree, coeffs, yhat, errorMsg, arrX, arrY, curve } = this.state;

    const polyString = coeffs
      ? "y ≈ " + coeffs.map((a, i) => {
          const v = Math.abs(a) < 1e-12 ? 0 : a;
          const sign = i === 0 ? "" : v >= 0 ? " + " : " - ";
          const mag = Math.abs(v);
          if (i === 0) return `${v.toFixed(6)}`;
          if (i === 1) return `${sign}${mag.toFixed(6)}x`;
          return `${sign}${mag.toFixed(6)}x^${i}`;
        }).join("")
      : "";

    // กราฟ scatter จุดข้อมูล + เส้นโค้งฟิต
    const graphData = [];
    if (arrX.length && arrY.length) {
      const xs = arrX.filter(Number.isFinite);
      const ys = arrY.filter((_, i) => Number.isFinite(arrX[i]) && Number.isFinite(arrY[i]));
      if (xs.length && ys.length) {
        graphData.push({ x: xs, y: ys, mode: "markers", type: "scatter", name: "Data" });
      }
    }
    if (curve) {
      graphData.push({ x: curve.xs, y: curve.ys, mode: "lines", type: "scatter", name: "Fitted curve" });
    }

    return (
      <>
        <h1 className="text-3xl font-bold text-center m-4">{this.methodName}</h1>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          <label>X</label>
          <input
            className="border text-center px-2 py-1"
            type="number"
            value={valX}
            onChange={(e) => this.setState({ valX: Number(e.target.value) })}
          />

        <label>Degree (d)</label>
          <input
            className="border text-center px-2 py-1"
            type="number"
            min={0}
            value={degree}
            onChange={(e) => this.setState({ degree: Math.max(0, Number(e.target.value)) })}
          />

          <label>Number of points</label>
          <input
            className="border text-center px-2 py-1"
            type="number"
            min={1}
            value={numberOfPoint}
            onChange={(e) => this.setState({ numberOfPoint: Math.max(1, Number(e.target.value)) })}
          />

          <button className="border px-4 py-2 rounded-xl bg-green-300" onClick={this.handleCalc}>
            Calculate
          </button>
        </div>

        <div className="grid justify-center items-center mt-4">
          {Array.from({ length: Number(numberOfPoint) || 0 }).map((_, i) => (
            <div key={i} className="flex justify-center">
              <input
                onChange={(e) => this.AddX(i, e.target.value)}
                type="number"
                placeholder={`x${i}`}
                className="border text-center m-1 px-2 py-1"
              />
              <input
                onChange={(e) => this.AddY(i, e.target.value)}
                type="number"
                placeholder={`y${i}`}
                className="border text-center m-1 px-2 py-1"
              />
            </div>
          ))}
        </div>

        {errorMsg && <p className="text-center text-red-600 font-medium mt-4">{errorMsg}</p>}

        {coeffs && (
          <div className="text-center mt-6">
            <p className="font-semibold">{polyString}</p>
            <p className="text-2xl font-bold mt-2">y(x={valX}) ≈ {this.fmt(yhat)}</p>
            <div className="mt-3 text-sm opacity-70">
              <p>a0..ad: [{coeffs.map((c) => this.fmt(c)).join(", ")}]</p>
            </div>
          </div>
        )}

        {(graphData.length > 0) && (
          <div className="max-w-4xl mx-auto mt-8">
            <Plot
              data={graphData}
              layout={{
                title: "Polynomial fit",
                xaxis: { title: "x" },
                yaxis: { title: "y" },
                margin: { l: 40, r: 20, t: 40, b: 40 },
              }}
              style={{ width: "100%", height: "420px" }}
              config={{ displayModeBar: false, responsive: true }}
            />
          </div>
        )}
      </>
    );
  }
}
