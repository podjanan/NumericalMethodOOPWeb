import React from "react";
import LinearMethodBase from "./LinearMethodBase";

const makeX0 = (n) => Array.from({ length: n }, () => "");

export default class GaussSeidel extends LinearMethodBase {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      X0: makeX0(this.state.n),
      tol: 1e-6,
      maxIter: 100,
      iters: 0,
      note: "",
    };
  }

  get methodName() {
    return "Gauss–Seidel Method";
  }

  handleResize = (val) => {
    const m = Math.max(1, Math.min(8, Number(val) || 1));
    this.setState({
      n: m,
      A: Array.from({ length: m }, () => Array.from({ length: m }, () => "")),
      B: Array.from({ length: m }, () => ""),
      X: [],
      X0: makeX0(m),
      iters: 0,
      note: "",
      errorMsg: "",
    });
  };

  reset = () => {
    const { n } = this.state;
    this.setState({
      A: Array.from({ length: n }, () => Array.from({ length: n }, () => "")),
      B: Array.from({ length: n }, () => ""),
      X: [],
      X0: makeX0(n),
      iters: 0,
      note: "",
      errorMsg: "",
    });
  };

  setX0Value = (r, v) => {
    this.setState((prev) => {
      const X0 = prev.X0.slice();
      X0[r] = v;
      return { X0 };
    });
  };

  // override column {x} ให้กรอก x(0)
  renderXPreviewColumn() {
    const { n, X0 } = this.state;
    return (
      <div>
        <div className="text-center mb-2 text-sm text-gray-500">{`x(0)`}</div>
        <div className="grid" style={{ gridTemplateRows: `repeat(${n}, 1fr)`, gap: "8px" }}>
          {Array.from({ length: n }).map((_, r) => (
            <input
              key={`x0-${r}`}
              value={X0[r]}
              onChange={(e) => this.setX0Value(r, e.target.value)}
              placeholder={`x${r + 1}(0)`}
              className="border rounded px-2 py-2 text-center"
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">เว้นว่าง = 0</div>
      </div>
    );
  }

  // เพิ่ม controls tol / maxIter
  renderExtraControls() {
    const { tol, maxIter } = this.state;
    return (
      <>
        <div>
          <label className="text-sm text-gray-600">Tolerance</label>
          <input
            type="number"
            step="any"
            value={tol}
            onChange={(e) => this.setState({ tol: e.target.value })}
            className="block w-36 border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Max Iterations</label>
          <input
            type="number"
            value={maxIter}
            onChange={(e) => this.setState({ maxIter: e.target.value })}
            className="block w-36 border rounded px-3 py-2"
            min={1}
          />
        </div>
      </>
    );
  }

  solve = () => {
    const n = this.state.n;
    const a = this.readA();
    const b = this.readB();
    const X0 = this.state.X0.map((v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0));
    const TOL = Number(this.state.tol) || 1e-6;
    const MAX = Math.max(1, parseInt(this.state.maxIter) || 100);
    const EPS = 1e-15;

    // ตรวจ a[ii] != 0
    for (let i = 0; i < n; i++) {
      if (Math.abs(a[i][i]) < EPS) {
        this.setState({
          X: [],
          iters: 0,
          note:
            "พบ a[i][i] = 0 — ลองสลับแถวให้ค่าสัมประสิทธิ์บนแนวทแยง ≠ 0",
        });
        return;
      }
    }

    let x = X0.slice();
    let iter = 0;
    let converged = false;

    while (iter < MAX) {
      iter++;
      let maxDelta = 0;

      for (let i = 0; i < n; i++) {
        let sigma = 0;
        for (let j = 0; j < n; j++) if (j !== i) sigma += a[i][j] * x[j];
        const xi_old = x[i];
        const xi_new = (b[i] - sigma) / a[i][i];
        x[i] = xi_new;
        const delta = Math.abs(xi_new - xi_old);
        if (delta > maxDelta) maxDelta = delta;
      }

      if (maxDelta < TOL) {
        converged = true;
        break;
      }
    }

    let note = "";
    // (เตือนแบบง่าย) diagonal dominance
    let diagOK = true;
    for (let i = 0; i < n; i++) {
      const diag = Math.abs(a[i][i]);
      const off = a[i].reduce((s, v, j) => (j === i ? s : s + Math.abs(v)), 0);
      if (diag < off) diagOK = false;
    }
    if (!diagOK) note += "คำเตือน: เมทริกซ์อาจไม่เด่นทแยง — อาจคอนเวอร์จช้า/ไม่คอนเวอร์จ. ";

    if (!converged) note += `ไม่คอนเวอร์จภายใน ${MAX} รอบ ลองเพิ่ม max iterations หรือเดา x(0) ใหม่`;

    this.setState({ X: x.slice(), iters: iter, note, errorMsg: "" });
  };

  render() {
    const base = super.render();
    const { iters, note } = this.state;

    return (
      <>
        {base}
        <div className="max-w-5xl mx-auto p-6 pt-0">
          {this.state.X.length > 0 && (
            <p className="text-sm text-gray-600">
              iterations: <b>{iters}</b>
            </p>
          )}
          {note && (
            <div className="mt-3 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
              {note}
            </div>
          )}
        </div>
      </>
    );
  }
}
