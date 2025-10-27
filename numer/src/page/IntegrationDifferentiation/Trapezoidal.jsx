import React, { useState } from "react";
import * as math from "mathjs";
import { BlockMath } from "react-katex";
import Plot from "react-plotly.js";

import nerdamer from 'nerdamer';
import 'nerdamer/Calculus';
import axios from "axios";


function Trapezoidal() {
  const [fx, setFx] = useState("");
  const [Avalue, setAvalue] = useState(0);
  const [Bvalue, setBvalue] = useState(10);
  const [NValue, setNvalue] = useState(1);
  const [realValue, setRealVaule] = useState(0);
  const [calValue, setcalVaule] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error,setErr] = useState(null);
  const [equationdb, setEquationdb] = useState([]);


  const [plotTraces, setPlotTraces] = useState(null);


  const getEquation = async () => {
      const res = await axios("http://localhost:5000/roe");
      const equation = res.data.results.map((item) => item.equation);
      setEquationdb(equation);
    };
    const saveEquation = async ()=>{
      const res = await axios("http://localhost:5000/roe");
      const data = res.data.results.map((item)=>item.equation);
      let find = 0;
        data.map((value,i)=>{
          if(value === fx){
            find = 1;
          }
        })
        if(find){
          alert("สมการนี้มีแล้ว");
        }else{
          await axios.post("http://localhost:5000/roe",{equation:fx});
          alert("บันทึกเรียบร้อย กด get ใหม่");
        }
    }

  const f = (x) => math.evaluate(fx, { x });

  function setVis(bool) {
    if (bool) setIsMenuOpen(true);
    else {
      setNvalue(1);
      setIsMenuOpen(false);
    }
  }

  function trapezoidalCal(expression, a, b, n) {
    const ff = (x) => math.evaluate(expression, { x });
    const h = (b - a) / n;
    let sum = 0.5 * (ff(a) + ff(b));
    for (let i = 1; i < n; i++) sum += ff(a + i * h);
    return sum * h;
  }

  function handleCalculateAndDraw() {
    const a = Number(Avalue);
    const b = Number(Bvalue);
    const n  = Math.max(1, parseInt(NValue, 10) || 1);

    // 1) คำนวณค่าอินทิกรัล
    const inde = nerdamer.integrate(fx).toString();
    const Real =  math.evaluate(inde,{x:Bvalue}) - math.evaluate(inde,{x:Avalue});
    const Cal = trapezoidalCal(fx, a, b, n);
    const err = (math.abs(Real-Cal) / Real) * 100;
    setRealVaule(Real);
    setcalVaule(Cal);
    setErr(err) ;

    // 2) สร้างเส้นโค้ง (curvePoints)
    const SAMPLES = 300;
    const xs = [];
    const ys = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const x = a + (i / SAMPLES) * (b - a);
      let y = 0;
      try {
        y = f(x);
      } catch {
        y = NaN;
      }
      xs.push(x);
      ys.push(y);
    }

    // 3) สร้างสี่เหลี่ยมคางหมู (trapezoids)
    const h = (b - a) / n;
    const trapezoidTraces = [];
    for (let i = 0; i < n; i++) {
      const x0 = a + i * h;
      const x1 = x0 + h;
      const y0 = Number.isFinite(f(x0)) ? f(x0) : 0;
      const y1 = Number.isFinite(f(x1)) ? f(x1) : 0;

      trapezoidTraces.push({
        type: "scatter",
        mode: "lines",
        x: [x0, x0, x1, x1, x0],
        y: [0, y0, y1, 0, 0],
        fill: "toself",
        fillcolor: "rgba(150,100,100,0.35)",
        line: { width: 1 },
        hoverinfo: "skip",
        showlegend: false,
      });
    }

    // 4) เส้นโค้ง f(x)
    const curveTrace = {
      type: "scatter",
      mode: "lines",
      x: xs,
      y: ys,
      line: { width: 3 },
      name: "f(x)",
    };

    
    setPlotTraces([...trapezoidTraces, curveTrace]);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6 mt-2">Trapezoidal</h1>
      <h2 className="text-2xl font-bold text-center">
        <BlockMath math={`f(x) = ${fx || "\\text{(กรอกสมการ)}"}`} />
      </h2>

      <div className="m-4 flex items-center justify-center">
        <button className="m-2 p-2 border-2 rounded-2xl" onClick={() => setVis(false)}>
          Simple Trapezoidal
        </button>
        <button className="m-2 p-2 border-2 rounded-2xl" onClick={() => setVis(true)}>
          Composite Trapezoidal
        </button>
      </div>

      <section>
        <div className="m-4 flex flex-wrap items-center justify-center gap-3">
          <label className="block text-gray-700 font-medium">สมการ</label>
          <input
            className="border border-gray-400 p-2 rounded"
            value={fx}
            onChange={(e) => setFx(e.target.value)}
            placeholder="exp(-0.2*x)*cos(x)+1.5"
            type="text"
          />

          <label className="block text-gray-700 font-medium">A value</label>
          <input
            className="border border-gray-400 p-2 rounded w-24"
            value={Avalue}
            onChange={(e) => setAvalue(Number(e.target.value))}
            placeholder="0"
            type="number"
          />

          <label className="block text-gray-700 font-medium">B value</label>
          <input
            className="border border-gray-400 p-2 rounded w-24"
            value={Bvalue}
            onChange={(e) => setBvalue(Number(e.target.value))}
            placeholder="10"
            type="number"
          />

          {isMenuOpen && (
            <>
              <label className="block text-gray-700 font-medium">N value</label>
              <input
                className="border border-gray-400 p-2 rounded w-24"
                value={NValue}
                onChange={(e) => setNvalue(Number(e.target.value))}
                placeholder="10"
                type="number"
                min={1}
              />
            </>
          )}

          {/* ปุ่มนี้เท่านั้นที่ทำให้ "คำนวณ + วาดกราฟ" */}
          <button className="m-2 p-2 border-2 rounded-2xl" onClick={handleCalculateAndDraw}>
            คำนวณ
          </button>
        </div>
        <div className="flex justify-center items-center">
          <select
            onChange={(e) => setFx(e.target.value)}
            className="border pl-5 pr-5 m-3"
          >
            <option value="">เลือกสมการ</option>
            {equationdb.map((value, i) => (
              <option key={i} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            className="ml-3 text-bold bg-[#000080] text-white p-3 rounded-xl"
            type="button"
            onClick={() => getEquation()}
          >
            get
          </button>
          <button onClick={()=>saveEquation()} className="text-bold bg-[#000080] text-white p-3 rounded-xl m-2">SAVE</button>
        </div>

        <div className="m-4 flex items-center justify-center font-bold">
          <label className="m-4">ค่าปริพันธ์ที่หาได้ = {calValue}</label>
          <label className="m-4">ค่าจริง = {realValue}</label>
          <label className="m-4">error = {error}%</label>
        </div>

        {/* วาดกราฟเฉพาะเมื่อผู้ใช้กดปุ่มแล้ว (plotTraces != null) */}
        {plotTraces && (
          <div className="m-6">
            <Plot
              data={plotTraces}
              layout={{
                margin: { l: 50, r: 20, t: 20, b: 40 },
                xaxis: { title: "x", zeroline: false },
                yaxis: { title: "f(x)", zeroline: true, rangemode: "tozero" },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "420px" }}
            />
          </div>
        )}
      </section>
    </>
  );
}

export default Trapezoidal;
