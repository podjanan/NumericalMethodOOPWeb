import React, { Component } from "react";
import { format } from "mathjs";

const makeA = (n) => Array.from({ length: n }, () => Array.from({ length: n }, () => ""));
const makeB = (n) => Array.from({ length: n }, () => "");

export default class LinearMethodBase extends Component {
  constructor(props) {
    super(props);
    const n = props.defaultN || 3;
    this.state = {
      n,
      A: makeA(n),
      B: makeB(n),
      X: [],
      errorMsg: "",
      DECIMALS: 6,
    };
    this.EPS = 1e-12;
  }

  get methodName() {
    return this.props.title || "Linear Method";
  }

  // ---- helpers (UI) ----
  handleResize = (val) => {
    const m = Math.max(1, Math.min(8, Number(val) || 1));
    this.setState({ n: m, A: makeA(m), B: makeB(m), X: [], errorMsg: "" });
  };

  reset = () => {
    const { n } = this.state;
    this.setState({ A: makeA(n), B: makeB(n), X: [], errorMsg: "" });
  };

  fmt = (v) =>
    Number.isFinite(v)
      ? format(v, { notation: "fixed", precision: this.state.DECIMALS })
      : "—";

  setAValue = (r, c, v) => {
    this.setState((prev) => {
      const A = prev.A.map((row) => [...row]);
      A[r][c] = v;
      return { A };
    });
  };

  setBValue = (r, v) => {
    this.setState((prev) => {
      const B = prev.B.slice();
      B[r] = v;
      return { B };
    });
  };

  // ---- numeric helpers ----
  readA = () => {
    const { n, A } = this.state;
    return Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (__ , c) => {
        const v = parseFloat(A[r][c]);
        return Number.isFinite(v) ? v : 0;
      })
    );
  };

  readB = () => {
    const { n, B } = this.state;
    return Array.from({ length: n }, (_, r) => {
      const v = parseFloat(B[r]);
      return Number.isFinite(v) ? v : 0;
    });
  };

  // ---- to be implemented in subclasses ----
  solve() {
    throw new Error("solve() must be implemented by subclass");
  }

  // ส่วนที่เมธอดเฉพาะต้องการ input เพิ่ม เติมตรงนี้โดย override ได้
  renderExtraControls() {
    return null;
  }

  // ถ้าอยากเปลี่ยนคอลัมน์ {x} ให้รับค่า (เช่น x(0) ของ Seidel) ให้ override ได้
  renderXPreviewColumn() {
    const { n } = this.state;
    return (
      <div>
        <div className="text-center mb-2 text-sm text-gray-500">{`{x}`}</div>
        <div className="grid" style={{ gridTemplateRows: `repeat(${n}, 1fr)`, gap: "8px" }}>
          {Array.from({ length: n }).map((_, r) => (
            <input
              key={`x-prev-${r}`}
              disabled
              placeholder={`x${r + 1}`}
              className="border rounded px-2 py-2 text-center bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { n, A, B, X, errorMsg } = this.state;

    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{this.methodName}</h1>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div>
            <label className="text-sm text-gray-600">Matrix size (N×N)</label>
            <input
              type="number"
              value={n}
              onChange={(e) => this.handleResize(e.target.value)}
              className="block w-28 border rounded px-3 py-2"
              min={1}
              max={8}
            />
          </div>

          {this.renderExtraControls()}

          <button
            onClick={this.reset}
            className="px-3 py-2 rounded bg-red-500 text-white self-end"
            title="Reset"
          >
            ⟲
          </button>

          <button
            onClick={() => this.solve()}
            className="px-4 py-2 rounded bg-blue-600 text-white self-end"
          >
            Calculate!
          </button>
        </div>

        {/* กริด A, x, B */}
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
                    onChange={(e) => this.setAValue(r, c, e.target.value)}
                    placeholder={`a${r + 1}${c + 1}`}
                    className="border rounded px-2 py-2 text-center"
                  />
                ))
              )}
            </div>
          </div>

          <div className="self-center text-xl text-gray-500">×</div>

          {/* x-preview หรือช่องพิเศษ (เช่น X0) */}
          {this.renderXPreviewColumn()}

          <div className="self-center text-xl text-gray-500">=</div>

          {/* B */}
          <div>
            <div className="text-center mb-2 text-sm text-gray-500">{`{B}`}</div>
            <div className="grid" style={{ gridTemplateRows: `repeat(${n}, 1fr)`, gap: "8px" }}>
              {Array.from({ length: n }).map((_, r) => (
                <input
                  key={`b-${r}`}
                  value={B[r]}
                  onChange={(e) => this.setBValue(r, e.target.value)}
                  placeholder={`b${r + 1}`}
                  className="border rounded px-2 py-2 text-center"
                />
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <p className="mt-4 text-center text-red-600 font-medium">{errorMsg}</p>
        )}

        {/* ผลลัพธ์ */}
        {X.length === n && !errorMsg && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Solution</h3>
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${n}, minmax(80px, 1fr))`, gap: "8px" }}
            >
              {X.map((xi, i) => (
                <div key={i} className="border rounded px-3 py-2 text-center bg-blue-50">
                  x{i + 1} = <b>{this.fmt(xi)}</b>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
