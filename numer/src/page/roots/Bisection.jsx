import { useState } from "react";
import * as math from "mathjs";
import Table from "../../components/Table";
import Chart from "../../components/Chart";

import axios from "axios";

import { BlockMath } from "react-katex";

function Bisection() {
  const [table, setTable] = useState([]);
  const [fx, setFx] = useState("");
  const [XLeft, setXLeft] = useState(0);
  const [XRight, setXRight] = useState(10);
  const [Agree, setAgree] = useState(0.000001);
  const [result, setResult] = useState(0);

  const [equationdb, setEquationdb] = useState([]);

  const evaluateWithMathJS = (expression, x) => {
    try {
      // แทนที่ x ด้วยค่าที่ป้อนมา
      const result = math.evaluate(expression, { x });
      return result;
    } catch (err) {
      alert("สมการมั่ว");
    }
  };
  const addRow = (i, x, fx, error) => {
    const newRow = { iter: i, x: x, y: fx, error: error };
    setTable((prev) => [...prev, newRow]);
  };
  //expression, xl , xr , agree
  const handleBisection = (expression) => {
    let xl = XLeft;
    let xr = XRight;
    let xm,
      xmold = 0;
    let i = 0;
    let error = 1;
    setTable([]);
    do {
      xm = (xl + xr) / 2;
      let fxl = evaluateWithMathJS(expression, xl);
      let fxm = evaluateWithMathJS(expression, xm);
      if (fxl * fxm > 0) {
        xl = xm;
      } else {
        xr = xm;
      }

      if (i > 0) {
        // ป้องกันการหารด้วย 0 ในรอบแรก
        error = Math.abs((xm - xmold) / xm);
      } else {
        error = 1; // ให้ error มากกว่า Agree ในรอบแรก
      }
      xmold = xm;
      console.log(i);
      i++;
      addRow(i, xm, fxm, error);
    } while (error > Agree);
    setResult(xm);
    console.log(i);
  };

  const getEquation = async () => {
    const res = await axios("http://localhost:5000/roe");
    const equation = res.data.results.map((item) => item.equation);
    setEquationdb(equation);
  };
  const InsertEquation = async (fx) =>{
    const res = await axios("http://localhost:5000/roe")
    const equa = res.data.results.map((item)=>item.equation);
    let find;
    equa.map((val,index)=>{
      if (fx === val){
        find = 1;
      }
    })
    if (find === 1){
      alert("สมการซ้ำ");
    }else{
      await axios.post("http://localhost:5000/roe",{equation:fx});
      alert("บันทึกเรียบร้อยกด GET ใหม่");
    }
  };


  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6 mt-2">
        BISECTION METHOD
      </h1>
      <h2 className="text-2xl text-center ">
        <BlockMath math={`f(x) = ${fx}`} />
      </h2>
      <section>
        <form>
          <div className="m-4 flex items-center justify-center">
            <label className="block text-gray-700 font-medium mr-2">
              สมการ
            </label>
            <input
              value={fx}
              onChange={(e) => setFx(e.target.value)}
              placeholder="43x-180"
              type="text"
              className="border border-gray-400 p-2 rounded mr-5"
            />

            <label className="block text-gray-700 font-medium mr-2">
              X Start
            </label>
            <input
              value={XLeft}
              onChange={(e) => setXLeft(Number(e.target.value))}
              placeholder="0"
              type="number"
              className="border border-gray-400 p-2 rounded mr-5"
            />

            <label className="block text-gray-700 font-medium mr-2">
              X End
            </label>
            <input
              value={XRight}
              onChange={(e) => setXRight(Number(e.target.value))}
              placeholder="10"
              type="number"
              className="border border-gray-400 p-2 rounded mr-5"
            />

            <label className="block text-gray-700 font-medium mr-2">
              ข้อผิดพลาด
            </label>
            <input
              value={Agree}
              onChange={(e) => setAgree(parseFloat(e.target.value))}
              placeholder="0.000001"
              step="any"
              type="number"
              className="border border-gray-400 p-2 rounded mr-5"
            />

            <button
              className="text-bold bg-[#000080] text-white p-3 rounded-xl"
              type="button"
              onClick={() => handleBisection(fx)}
            >
              Calculate
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
              GET
            </button>
            <button type="button" onClick={()=>InsertEquation(fx)} className="ml-3 text-bold bg-[#000080] text-white p-3 rounded-xl">SAVE</button>
          </div>
        </form> 
      </section>
      <h1 className="text-2xl text-center">result = {result}</h1>

      <div className="flex justify-center items-center">
        <Chart data={table} />
      </div>
      <Table table={table} />
    </>
  );
}
export default Bisection;
