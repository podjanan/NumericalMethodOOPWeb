import { useState } from "react";
import * as math from "mathjs";
import Plot from "react-plotly.js";
import Table from "../../components/Table";
import axios from "axios";

function Secant() {
  const [X0, setX0] = useState(1);
  const [X1, setX1] = useState(1.5);
  const [fx, setFx] = useState("");
  const [valErr, setErr] = useState(0.000001);
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [table, setTable] = useState([]);
  const [equationDB, setDB] = useState([]);


   const getFx = async()=>{
      const res = await axios("http://localhost:5000/roe");
      const data = res.data.results.map(item=>item.equation);
      setDB(data);
    }
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
  const evaluate = (equa, x) => {
    try {
      const process = equa.replace(/x/g, `(${x})`);
      const result = math.evaluate(process);
      return result;
    } catch {
      console.log("error");
    }
  };

  const handleCal = () => {
    let x0 = Number(X0);
    let x1 = Number(X1);
    const tol = Number(valErr);
    const maxIter = 100;
    let iter = 0;

    const s = [];
    let root = null;

    for (let i = 0; i < maxIter; i++) {
      iter++;
      const f0 = evaluate(fx, x0);
      const f1 = evaluate(fx, x1);

      const x2 = x1 - (f1 * (x1 - x0)) / (f1 - f0);
      s.push({ x0, x1, x2 });

      if (Math.abs((x2 - x1) / x2) < tol) {
        root = x2;
        const newRow = {
          iter: iter,
          x: x2,
          y: evaluate(fx, x2),
          error: Math.abs((x2 - x1) / x2),
        };
        setTable((prev) => [...prev, newRow]);
        break;
      }
      const newRow = {
        iter: iter,
        x: x2,
        y: evaluate(fx, x2),
        error: Math.abs((x2 - x1) / x2),
      };
      setTable((prev) => [...prev, newRow]);
      x0 = x1;
      x1 = x2;
      root = x2;
    }

    setSteps(s);
    setResult(root);
  };

  const xMin = Math.min(X0, X1) - 1;
  const xMax = Math.max(X0, X1) + 1;
  const xVals = Array.from(
    { length: 400 },
    (_, i) => xMin + (i * (xMax - xMin)) / 400
  );
  const yVals = xVals.map((x) => evaluate(fx, x));

  const secantLines = steps.map((s, i) => ({
    x: [s.x0, s.x1],
    y: [evaluate(fx, s.x0), evaluate(fx, s.x1)],
    type: "scatter",
    mode: "lines+markers",
    name: `รอบที่ ${i + 1}`,
    line: { color: "red" },
    marker: { color: "black", size: 6 },
  }));

  return (
    <>
      <h1 className="text-2xl font-bold text-center m-4">Secant Method</h1>
      <h1 className="text-xl font-bold text-center m-4">f(x) = {fx}</h1>
      <div className="flex items-center justify-center">
        <label className="m-2">
          f(x) x<sub>n+1</sub> =
        </label>
        <input
          value={fx}
          onChange={(e) => setFx(e.target.value)}
          type="text"
          placeholder="x^2-7"
          className="border border-gray-400"
        />
        <label className="m-2">XStart</label>
        <input
          value={X0}
          onChange={(e) => setXl(e.target.value)}
          type="number"
          className="border border-gray-400"
        />
        <label className="m-2">XEnd</label>
        <input
          value={X1}
          onChange={(e) => setXr(e.target.value)}
          type="number"
          className="border border-gray-400"
        />
        <label className="m-2">Error</label>
        <input
          value={valErr}
          onChange={(e) => setErr(e.target.value)}
          type="number"
          className="border border-gray-400"
        />

        <button
          className="m-4 p-2 border border-gray rounded-xl"
          onClick={(e) => handleCal()}
        >
          CAL
        </button>

        <h1>result = {result}</h1>
      </div>
      <div className="flex justify-center items-center">
        <select
          className="border p-3 m-3"
          onChange={(e) => setFx(e.target.value)}
        >
          <option value="">เลือกสมการ</option>
          {equationDB.map((value, index) => (
            <option key={index} value={value}>
              {value}
            </option>
          ))}
        </select>

        <button
          className="text-bold bg-[#000080] text-white p-3 rounded-xl"
          onClick={() => getFx()}
        >
          GET
        </button>
        <button onClick={()=>saveEquation()} className="text-bold bg-[#000080] text-white p-3 rounded-xl m-2">SAVE</button>
      </div>
      <div className="mt-6 bg-gray-50 rounded-2xl p-4 bg-white">
        <div className="flex justify-center items-center">
          <Plot
            data={[
              {
                x: xVals,
                y: yVals,
                type: "scatter",
                mode: "lines",
                name: "f(x)",
                line: { color: "blue" },
              },
              ...secantLines,
              ...(result
                ? [
                    {
                      x: [result, result],
                      y: [Math.min(...yVals), Math.max(...yVals)],
                      type: "scatter",
                      mode: "lines",
                      name: "x*",
                      line: { color: "green", dash: "dot" },
                    },
                  ]
                : []),
            ]}
            layout={{
              title: "Secant Graph",
              xaxis: { title: "x", zeroline: true },
              yaxis: { title: "f(x)", zeroline: true },
              width: 900,
              height: 500,
            }}
          />
        </div>
        <Table table={table} />
      </div>
    </>
  );
}

export default Secant;
