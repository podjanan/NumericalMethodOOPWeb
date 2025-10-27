import React, { useState } from "react";
import * as math from "mathjs";
import { BlockMath } from "react-katex";

import nerdamer from "nerdamer";
import "nerdamer/Calculus";

import axios from "axios";

function Simpson() {
  const [fx, setFx] = useState("");
  const [Avalue, setAvalue] = useState(0);
  const [Bvalue, setBvalue] = useState(10);
  const [NValue, setNvalue] = useState(1);
  const [realValue, setRealVaule] = useState(0);
  const [calValue, setcalVaule] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [errVal, setErrval] = useState(1);
  const [equationdb, setEquationdb] = useState([]);

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
  const evaluateWithMathJS = (expression, x) => {
    try {
      const processedExpression = expression.replace(/x/g, `(${x})`);
      const result = math.evaluate(processedExpression);
      return result;
    } catch (err) {
      alert("สมการมั่ว");
    }
  };

  function setVis(bool) {
    if (bool) setIsMenuOpen(true);
    else {
      setNvalue(1);
      setIsMenuOpen(false);
    }
  }

  function Simpsoncal(expression, a, b, n) {
    const h = (b - a) / (2 * n);
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 1; i < 2 * n; i++) {
      if (i % 2 == 0) {
        sum1 = sum1 + evaluateWithMathJS(expression, a + i * h);
      } else {
        sum2 = sum2 + evaluateWithMathJS(expression, a + i * h);
      }
    }
    const I =
      (h / 3) *
      (evaluateWithMathJS(expression, a) +
        evaluateWithMathJS(expression, b) +
        4 * sum2 +
        2 * sum1);
    return I;
  }

  function handleCalculate() {
    const a = Number(Avalue);
    const b = Number(Bvalue);
    const n = NValue;

    const inde = nerdamer.integrate(fx).toString();
    const Real =
      math.evaluate(inde, { x: Bvalue }) - math.evaluate(inde, { x: Avalue });
    const Cal = Simpsoncal(fx, a, b, n);
    const err = (math.abs(Real - Cal) / Real) * 100;
    setRealVaule(Real);
    setcalVaule(Cal);
    setErrval(err);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6 mt-2">
        Simpson’s Rule
      </h1>
      <h2 className="text-2xl font-bold text-center">
        <BlockMath math={`f(x) = ${fx || "\\text{(กรอกสมการ)}"}`} />
      </h2>

      <div className="m-4 flex items-center justify-center">
        <button
          className="m-2 p-2 border-2 rounded-2xl"
          onClick={() => setVis(false)}
        >
          Simple Simpson’s Rule
        </button>
        <button
          className="m-2 p-2 border-2 rounded-2xl"
          onClick={() => setVis(true)}
        >
          Composite Simpson’s Rule
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

          <button
            className="m-2 p-2 border-2 rounded-2xl"
            onClick={handleCalculate}
          >
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
          <label className="m-4">error = {errVal}%</label>
        </div>
      </section>
    </>
  );
}

export default Simpson;
