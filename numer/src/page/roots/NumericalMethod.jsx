// root of equation
import React, { Component } from "react";
import * as math from "mathjs";
import axios from "axios";
import { BlockMath } from "react-katex";
import Plot from "react-plotly.js";
import Table from "../../components/Table";

export default class NumericalMethod extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: [],
      fx: "",
      XLeft: 1,     
      XRight: 10,    
      Agree: 1e-6,
      result: null,
      equationdb: [],
    };
    this.MAX_ITER = 2000; 
  }

  // ---------- Helpers ----------
  evaluate = (expression, x) => {
    try {
      return math.evaluate(expression, { x });
    } catch (e) {
      console.log("evaluate error:", e?.message || e);
      return NaN;
    }
  };

  clearTable = () => this.setState({ table: [] });

  addRow = (iter, x, y, error) => {
    this.setState((prev) => ({
      table: [...prev.table, { iter, x, y, error }],
    }));
  };

  getEquation = async () => {
    const res = await axios("https://api-web-oop-deploy-production.up.railway.app/roe");
    const equation = res.data.results.map((item) => item.equation);
    this.setState({ equationdb: equation });
  };

  saveEquation = async () => {
    const { fx } = this.state;
    if (!fx) {
      alert("กรุณากรอกสมการก่อน");
      return;
    }
    const res = await axios("https://api-web-oop-deploy-production.up.railway.app/roe");
    const equa = res.data.results.map((item) => item.equation);
    if (equa.includes(fx)) {
      alert("สมการนี้มีแล้ว");
      return;
    }
    await axios.post("https://api-web-oop-deploy-production.up.railway.app/roe", { equation: fx });
    alert("บันทึกเรียบร้อย กด GET ใหม่");
  };

  handleChange = (e) => {
    const { name, value, type } = e.target;
    const v = type === "number" ? (value === "" ? "" : Number(value)) : value;
    this.setState({ [name]: v });
  };

  handleSelectEquation = (e) => {
    this.setState({ fx: e.target.value });
  };

  // ----- ให้คลาสลูก override -----
  get methodName() {
    return this.props.title || "Unknown";
  }
  solve() {
    
  }

  // ---------- Plot (f(x) + จุดราก) ----------
  renderPlotOnlyFxAndRoot() {
    const { fx, XLeft, XRight, result } = this.state;

    const xMin = Math.min(Number(XLeft), Number(XRight)) - 1;
    const xMax = Math.max(Number(XLeft), Number(XRight)) + 1;
    const N = 400;
    const xVals = Array.from({ length: N }, (_, i) => xMin + (i * (xMax - xMin)) / N);
    const yVals = xVals.map((x) => this.evaluate(fx, x));

    const rootPoint =
      result != null
        ? [{
            x: [result],
            y: [this.evaluate(fx, result)],
            type: "scatter",
            mode: "markers",
            marker: { size: 8 },
            showlegend: false,
          }]
        : [];

    return (
      <div className="mt-6 bg-gray-50 rounded-2xl p-4 bg-white">
        <div className="flex justify-center items-center">
          <Plot
            data={[
              { x: xVals, y: yVals, type: "scatter", mode: "lines", showlegend: false },
              ...rootPoint,
            ]}
            layout={{
              title: `${this.methodName} Graph`,
              xaxis: { title: "x", zeroline: true },
              yaxis: { title: "f(x)", zeroline: true },
              width: 900,
              height: 500,
              showlegend: false,
            }}
          />
        </div>
      </div>
    );
  }

  // ---------- Convergence plot (iter vs error) ----------
  renderConvergencePlot() {
    const { table } = this.state;
    const xs = table.map((d) => d.iter);
    const ys = table.map((d) => d.error);

    return (
      <div className="mt-4 bg-gray-50 rounded-2xl p-4 bg-white">
        <div className="flex justify-center items-center">
          <Plot
            data={[
              {
                x: xs,
                y: ys,
                type: "scatter",
                mode: "lines+markers",
                showlegend: false,
              },
            ]}
            layout={{
              title: "Convergence (error vs iteration)",
              xaxis: { title: "Iteration" },
              yaxis: { title: "Error" }, // จะใช้ log scale ก็ใส่ type: "log"
              width: 900,
              height: 350,
              showlegend: false,
            }}
          />
        </div>
      </div>
    );
  }

  // ---------- Shared UI ----------
  render() {
    const { fx, XLeft, XRight, Agree, result, equationdb, table } = this.state;

    return (
      <>
        <h1 className="text-2xl font-bold text-center mb-6 mt-2">
          {this.methodName} Method
        </h1>
        <h2 className="text-2xl text-center">
          <BlockMath math={`f(x) = ${fx || "?"}`} />
        </h2>

        <section>
          <form>
            <div className="m-4 flex items-center justify-center flex-wrap gap-3">
              <label className="block text-gray-700 font-medium">f(x)</label>
              <input
                name="fx"
                value={fx}
                onChange={this.handleChange}
                placeholder="เช่น x^2-7"
                type="text"
                className="border border-gray-400 p-2 rounded"
              />

              <label className="block text-gray-700 font-medium">X Start</label>
              <input
                name="XLeft"
                value={XLeft}
                onChange={this.handleChange}
                type="number"
                className="border border-gray-400 p-2 rounded"
              />

              <label className="block text-gray-700 font-medium">X End</label>
              <input
                name="XRight"
                value={XRight}
                onChange={this.handleChange}
                type="number"
                className="border border-gray-400 p-2 rounded"
              />

              <label className="block text-gray-700 font-medium">ข้อผิดพลาด</label>
              <input
                name="Agree"
                value={Agree}
                onChange={this.handleChange}
                step="any"
                type="number"
                className="border border-gray-400 p-2 rounded"
              />

              <button
                className="text-bold bg-[#000080] text-white p-3 rounded-xl"
                type="button"
                onClick={() => {
                  this.clearTable();
                  this.solve();
                }}
              >
                Calculate
              </button>
            </div>

            <div className="flex justify-center items-center">
              <select onChange={this.handleSelectEquation} className="border pl-5 pr-5 m-3">
                <option value="">เลือกสมการ</option>
                {equationdb.map((value, i) => (
                  <option key={i} value={value}>{value}</option>
                ))}
              </select>

              <button
                className="ml-3 text-bold bg-[#000080] text-white p-3 rounded-xl"
                type="button"
                onClick={this.getEquation}
              >
                GET
              </button>

              <button
                type="button"
                onClick={this.saveEquation}
                className="ml-3 text-bold bg-[#000080] text-white p-3 rounded-xl"
              >
                SAVE
              </button>
            </div>
          </form>
        </section>

        <h1 className="text-2xl text-center">result = {String(result)}</h1>

        {this.renderPlotOnlyFxAndRoot()}
        {this.renderConvergencePlot()}

        <div className="mt-6">
          <Table table={table} />
        </div>
      </>
    );
  }
}
