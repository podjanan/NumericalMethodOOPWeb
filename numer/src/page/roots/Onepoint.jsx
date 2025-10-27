import { useState } from "react";
import * as math from "mathjs";
import Plot from "react-plotly.js";
import Table from "../../components/Table"; 
import { BlockMath } from "react-katex";
import axios from "axios";

function Onepoint() {
  const [table, setTable] = useState([]);     // [{iter,x,y,err}]
  const [fx, setFx] = useState("");           // g(x) ใน One-point
  const [XInitial, setXInitial] = useState(0);
  const [error, setError] = useState(0.000001);
  const [result, setResult] = useState(null);
  const [iterCnt, setIterCnt] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [equationDB,setDB] = useState([]);

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

  const onePointIteration = (xStart, errorFactor, func) => {
    const out = { result: 0, iter: 0, iterations: [], error: undefined };

    if (!func || func.trim().length === 0) {
      out.error = "Invalid function";
      return out;
    }
    try {
      math.evaluate(func, { x: xStart });
    } catch (e) {
      out.error = "Invalid function";
      return out;
    }

    const MAX_ITER = 100;
    let iter = 0;
    let x = xStart;
    let xold = x * 100;     
    let err = 0;

    while (iter < MAX_ITER) {
      iter += 1;
      if (iter === MAX_ITER) {
        break;
      }

      const gx = math.evaluate(func, { x });
      out.iterations.push({ iter,x, y: gx, error:err });

      x = gx;
      err = math.abs((x - xold) / xold);

      if (err < errorFactor) {
        out.result = x;
        out.iter = iter;
        break;
      }

      xold = x;
    }

    if (!out.result) {
      out.result = x;
      out.iter = iter;
    }
    return out;
  };

  const handleCalculate = () => {
    setErrMsg("");
    setTable([]);
    setResult(null);
    setIterCnt(0);

    const xStart = Number(XInitial);
    const tol = Number(error);

    if (!Number.isFinite(xStart) || !Number.isFinite(tol)) {
      setErrMsg("กรุณากรอกค่า X Initial และข้อผิดพลาดให้ถูกต้อง");
      return;
    }
    if (!fx || typeof fx !== "string") {
      setErrMsg("กรุณากรอกสมการ g(x)");
      return;
    }

    const res = onePointIteration(xStart, tol, fx);
    if (res.error) setErrMsg(res.error);
    setResult(res.result ?? null);
    setIterCnt(res.iter ?? 0);
    setTable(res.iterations ?? []);
  };

  // กราฟ
    const getDomain = (rows, x0) => {
    const xs = rows.length ? rows.flatMap(r => [r.x, r.y]) : [x0 - 1, x0 + 1];
    const minX = Math.min(...xs) - 0.05;
    const maxX = Math.max(...xs) + 0.05;
    return [minX, maxX];
    };

    const makeCobwebTraces = (rows) =>
        rows.flatMap((r, i) => ([
            {
            x: [r.x, r.x],
            y: [r.x, r.y],
            type: "scatter", mode: "lines",
            line: { color: "red" }, name: i === 0 ? "One-Point" : undefined,
            showlegend: i === 0
            },
            {
            x: [r.x, r.y],
            y: [r.y, r.y],
            type: "scatter", mode: "lines",
            line: { color: "red" }, name: undefined, showlegend: false
            }
        ]));
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6 mt-2">
        One-point Iteration Methods
      </h1>

      <h2 className="text-2xl text-center ">
        <BlockMath math={`g(x) = ${fx || "\\;?"}`} />
      </h2>

      <section>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="m-4 flex items-center justify-center flex-wrap gap-3">
            <label className="block text-gray-700 font-medium">สมการ g(x)</label>
            <input
              value={fx}
              onChange={(e) => setFx(e.target.value)}
              placeholder="(7 + x)/4"
              type="text"
              className="border border-gray-400 p-2 rounded mr-2 w-64"
            />

            <label className="block text-gray-700 font-medium">X Initial</label>
            <input
              value={XInitial}
              onChange={(e) => setXInitial(Number(e.target.value))}
              placeholder="0"
              type="number"
              className="border border-gray-400 p-2 rounded mr-2 w-28"
            />

            <label className="block text-gray-700 font-medium">error</label>
            <input
              value={error}
              onChange={(e) => setError(parseFloat(e.target.value))}
              placeholder="0.000001"
              step="any"
              type="number"
              className="border border-gray-400 p-2 rounded mr-2 w-36"
            />

            <button
              className="text-bold bg-[#000080] text-white p-3 rounded-xl"
              type="button"
              onClick={handleCalculate}
            >
              Calculate
            </button>
          </div>
        </form>
      </section>
      <div className="flex justify-center items-center">
      <select className="border p-3 m-3" onChange={(e)=>setFx(e.target.value)}>
        <option value="">เลือกสมการ</option>
        {equationDB.map((value,index)=>(
            <option key={index} value={value}>{value}</option>
        ))}
      </select>

      <button className="text-bold bg-[#000080] text-white p-3 rounded-xl" onClick={()=>getFx()}>GET</button>
      <button onClick={()=>saveEquation()} className="text-bold bg-[#000080] text-white p-3 rounded-xl m-2">SAVE</button>
    </div>
      {errMsg && (
        <div className="max-w-3xl mx-auto mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700">
          {errMsg}
        </div>
      )}

      <h1 className="text-2xl text-center">
        result = {result}
      </h1>


        <div className="rounded-2xl p-4 mt-6">
            {(() => {
                const x0 = Number(XInitial);
                const [minX, maxX] = getDomain(table, x0);
                const N = 600;
                const xs = Array.from({ length: N }, (_, i) => minX + i*(maxX-minX)/(N-1));
                const gys = xs.map(x => { try { return math.evaluate(fx, { x }); } catch { return NaN; } });

                return (
                <div className="mx-auto w-full max-w-[1000px]"> {/* ← ทำให้กราฟมาอยู่กลาง */}
                    <Plot
                    data={[
                        { x: xs, y: xs, type: "scatter", mode: "lines", name: "x = x", line: { color: "rgb(99,102,241)" } },
                        { x: xs, y: gys, type: "scatter", mode: "lines", name: "g(x)",  line: { color: "rgb(16,185,129)" } },
                        ...makeCobwebTraces(table),
                    ]}
                    layout={{
                        height: 460,
                        autosize: true,
                        margin: { t: 20, r: 20, b: 50, l: 60 },
                        xaxis: { title: "x" },
                        yaxis: { title: "y" },
                        legend: { x: 1, y: 1 },
                    }}
                    config={{ responsive: true }}
                    />
                </div>
                );
            })()}
        </div>



      <Table table = {table}/>
    </>
  );
}

export default Onepoint;
