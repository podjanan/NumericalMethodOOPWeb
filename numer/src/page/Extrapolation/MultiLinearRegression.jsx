import React, { Component } from "react";
import RegressionBase from "./RegressionBase.jsx";
import Plot from "react-plotly.js";

export default class MultiLinearRegression extends RegressionBase {
  constructor(props) {
    super(props);
    this.state = {
      nPoints: 4,
      nFeatures: 2,
      X: [],
      y: [],
      xPredict: [],
      beta: null,
      yhat: null,
      trainRSq: null,
      errorMsg: "",
      yPredTrain: null, // สำหรับกราฟ Actual vs Predicted
    };
  }

  componentDidMount() { this.ensureShapes(); }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.nPoints !== this.state.nPoints || prevState.nFeatures !== this.state.nFeatures) {
      this.ensureShapes();
    }
  }

  ensureShapes = () => {
    const { nPoints, nFeatures, X, y, xPredict } = this.state;
    const X2 = Array.from({ length: nPoints }, (_, i) =>
      Array.from({ length: nFeatures }, (_, j) => (X[i]?.[j] ?? NaN))
    );
    const y2 = Array.from({ length: nPoints }, (_, i) => (y[i] ?? NaN));
    const xp2 = Array.from({ length: nFeatures }, (_, j) => (xPredict[j] ?? NaN));
    this.setState({ X: X2, y: y2, xPredict: xp2 });
  };

  buildDesignMatrix = (Xraw) => {
    const { nFeatures } = this.state;
    const n = Xraw.length;
    const p = nFeatures + 1;
    const Xd = Array.from({ length: n }, (_, i) => {
      const row = new Array(p);
      row[0] = 1;
      for (let j = 0; j < nFeatures; j++) row[j + 1] = Xraw[i][j];
      return row;
    });
    return Xd;
  };

  handleCalc = () => {
    const { nPoints, nFeatures, X, y, xPredict } = this.state;
    this.setState({ errorMsg: "", beta: null, yhat: null, trainRSq: null, yPredTrain: null });

    if (nPoints < nFeatures + 1) {
      this.setState({ errorMsg: `ต้องมีจำนวนจุดอย่างน้อย m+1 = ${nFeatures + 1} จุด` });
      return;
    }
    for (let i = 0; i < nPoints; i++) {
      for (let j = 0; j < nFeatures; j++) {
        if (!Number.isFinite(X[i]?.[j])) {
          this.setState({ errorMsg: `X แถว ${i + 1} คอลัมน์ ${j + 1} ไม่ถูกต้อง` });
          return;
        }
      }
      if (!Number.isFinite(y[i])) {
        this.setState({ errorMsg: `y แถว ${i + 1} ไม่ถูกต้อง` });
        return;
      }
    }

    try {
      const Xd = this.buildDesignMatrix(X);
      const ycol = y.map((v) => [v]);

      const Xt = this.transpose(Xd);
      const XtX = this.matmul(Xt, Xd);
      const Xty = this.matmul(Xt, ycol).map((r) => r[0]);

      const betaVec = this.solveLinear(XtX, Xty);
      const yPredTrain = Xd.map((row) => row.reduce((acc, v, j) => acc + v * betaVec[j], 0));

      for (let j = 0; j < nFeatures; j++) {
        if (!Number.isFinite(xPredict[j])) {
          this.setState({ errorMsg: `ค่าสำหรับทำนาย x* คอลัมน์ ${j + 1} ไม่ถูกต้อง` });
          return;
        }
      }
      const xStar = [1, ...xPredict];
      const yh = xStar.reduce((acc, v, j) => acc + v * betaVec[j], 0);

      this.setState({
        beta: betaVec,
        yhat: yh,
        trainRSq: this.rSquared(y, yPredTrain),
        yPredTrain,
      });
    } catch (e) {
      this.setState({ errorMsg: e.message || "คำนวณไม่สำเร็จ" });
    }
  };

  get methodName() { return "Multiple Linear Regression"; }

  render() {
    const {
      nPoints, nFeatures, X, y, xPredict,
      beta, yhat, trainRSq, errorMsg, yPredTrain
    } = this.state;

    const modelString = beta
      ? "y ≈ " + beta.map((b, i) => {
          const v = Math.abs(b) < 1e-12 ? 0 : b;
          const sign = i === 0 ? "" : v >= 0 ? " + " : " - ";
          const mag = Math.abs(v).toFixed(6);
          if (i === 0) return `${v.toFixed(6)}`;
          return `${sign}${mag}·x${i}`;
        }).join("")
      : "";

    // ---------- กราฟ ----------
    const actualVsPredTrace = (yPredTrain && y)
      ? [
          { x: y, y: yPredTrain, mode: "markers", type: "scatter", name: "Actual vs Predicted" },
          { x: [Math.min(...y, ...yPredTrain), Math.max(...y, ...yPredTrain)],
            y: [Math.min(...y, ...yPredTrain), Math.max(...y, ...yPredTrain)],
            mode: "lines", type: "scatter", name: "y = x", hoverinfo: "skip" }
        ]
      : [];

    // ถ้า m=1 วาดเส้นฟิตบนแกน x1–y
    let x1Trace = [];
    if (beta && nFeatures === 1) {
      const xs = X.map((row) => row[0]);
      const xMin = Math.min(...xs);
      const xMax = Math.max(...xs);
      const lineX = [], lineY = [];
      for (let t = 0; t <= 50; t++) {
        const xv = xMin + (t / 50) * (xMax - xMin);
        lineX.push(xv);
        lineY.push(beta[0] + beta[1] * xv);
      }
      x1Trace = [
        { x: xs, y, mode: "markers", type: "scatter", name: "Data" },
        { x: lineX, y: lineY, mode: "lines", type: "scatter", name: "Fitted line" },
      ];
    }

    return (
      <>
        <h1 className="text-3xl font-bold text-center m-4">{this.methodName}</h1>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          <label>Number of points (n)</label>
          <input
            className="border text-center px-2 py-1"
            type="number"
            min={1}
            value={nPoints}
            onChange={(e) => this.setState({ nPoints: Math.max(1, Number(e.target.value)) })}
          />

          <label>Number of features (m)</label>
          <input
            className="border text-center px-2 py-1"
            type="number"
            min={1}
            value={nFeatures}
            onChange={(e) => this.setState({ nFeatures: Math.max(1, Number(e.target.value)) })}
          />

          <button
            className="border px-4 py-2 rounded-xl bg-green-300"
            onClick={this.handleCalc}
          >
            Calculate
          </button>
        </div>

        {/* ตารางอินพุต */}
        <div className="flex flex-col items-center mt-6 gap-2">
          <div className="overflow-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  {Array.from({ length: nFeatures }).map((_, j) => (
                    <th key={`xh${j}`} className="border px-2 py-1">x{j + 1}</th>
                  ))}
                  <th className="border px-2 py-1">y</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: nPoints }).map((_, i) => (
                  <tr key={`row${i}`}>
                    {Array.from({ length: nFeatures }).map((__, j) => (
                      <td key={`x${i}-${j}`} className="border">
                        <input
                          type="number"
                          className="px-2 py-1 w-28 text-center"
                          value={Number.isFinite(X[i]?.[j]) ? X[i][j] : ""}
                          onChange={(e) => {
                            const v = this.toNum(e.target.value);
                            const X2 = X.map((row) => row.slice());
                            if (!X2[i]) X2[i] = Array.from({ length: nFeatures }, () => NaN);
                            X2[i][j] = v;
                            this.setState({ X: X2 });
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
                          const v = this.toNum(e.target.value);
                          const y2 = y.slice();
                          y2[i] = v;
                          this.setState({ y: y2 });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* x* */}
          <div className="mt-6">
            <div className="font-semibold text-center mb-2">X Value</div>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: nFeatures }).map((_, j) => (
                <input
                  key={`xp${j}`}
                  type="number"
                  className="border px-2 py-1 w-28 text-center"
                  placeholder={`x*${j + 1}`}
                  value={Number.isFinite(xPredict[j]) ? xPredict[j] : ""}
                  onChange={(e) => {
                    const v = this.toNum(e.target.value);
                    const xp2 = xPredict.slice();
                    xp2[j] = v;
                    this.setState({ xPredict: xp2 });
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {errorMsg && <p className="text-center text-red-600 font-medium mt-4">{errorMsg}</p>}

        {beta && (
          <div className="text-center mt-6">
            <p className="font-semibold">{modelString}</p>
            <div className="mt-2 text-sm opacity-70">
              <p>β = [{beta.map((b) => this.fmt(b)).join(", ")}]</p>
              {trainRSq != null && <p>R² (on training) = {this.fmt(trainRSq)}</p>}
            </div>
            {Number.isFinite(yhat) && (
              <p className="text-2xl font-bold mt-3">ŷ (x*) ≈ {this.fmt(yhat)}</p>
            )}
          </div>
        )}

        {/* กราฟ */}
        {yPredTrain && (
          <div className="max-w-4xl mx-auto mt-8">
            <Plot
              data={actualVsPredTrace}
              layout={{
                title: "Actual vs Predicted",
                xaxis: { title: "Actual y" },
                yaxis: { title: "Predicted y" },
                margin: { l: 40, r: 20, t: 40, b: 40 },
              }}
              style={{ width: "100%", height: "420px" }}
              config={{ displayModeBar: false, responsive: true }}
            />
          </div>
        )}

        {beta && nFeatures === 1 && (
          <div className="max-w-4xl mx-auto mt-6">
            <Plot
              data={x1Trace}
              layout={{
                title: "Fit on x₁–y (m=1)",
                xaxis: { title: "x₁" },
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
