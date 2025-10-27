import { useState } from "react";
import * as math from "mathjs";
import Table from "../../components/Table";
import Chart from "../../components/Chart";

import axios from "axios";

import { BlockMath } from "react-katex";

function Falsepos() {
  const [table, setTable] = useState([]);
  const [fx, setFx] = useState("");
  const [XLeft, setXLeft] = useState(0);
  const [XRight, setXRight] = useState(10);
  const [Agree, setAgree] = useState(0.000001);
  const [result, setResult] = useState(0);
  const [equationDB, setequationDB] = useState([]);

  const evaluateWithMathJS = (expression, x) => {
    try {
      // แทนที่ x ด้วยค่าที่ป้อนมา
      const processedExpression = expression.replace(/x/g, `(${x})`);
      const result = math.evaluate(processedExpression);
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
  const handleFalsePosition = (expression) => {
    let xl = Number(XLeft);
    let xr = Number(XRight);
    const tol = Number(Agree) || 1e-6;
    const MAX = 100;

    // ฟังก์ชัน f(x)
    const f = (x) => evaluateWithMathJS(expression, x);

    // เคลียร์ตาราง
    setTable([]);

    // ตรวจว่าช่วงคร่อมรากไหม
    let fxl = f(xl);
    let fxr = f(xr);
    let xm, fxm;
    let xmold = null;
    let error = 1;
    let i = 0;

    do {
      xm = (xl * fxr - xr * fxl) / (fxr - fxl);
      fxm = f(xm);

      // คำนวณ
      if (xmold !== null && xm !== 0) {
        error = Math.abs((xm - xmold) / xm);
      } else {
        error = 1;
      }
      xmold = xm;

      addRow(i + 1, xm, fxm, error, xl, xr, fxl, fxr);

      // อัปเดตช่วงให้ยังคร่อมราก
      if (fxl * fxm > 0) {
        xl = xm;
        fxl = fxm;
      } else if (fxr * fxm > 0) {
        xr = xm;
        fxr = fxm;
      }
      i++;
      if (i >= MAX) break;
    } while (error > tol);
    setResult(xm);
  };

  const getEquation = async () => {
    const res = await axios("http://localhost:5000/roe");
    const data = res.data.results.map((item) => item.equation);
    setequationDB(data);
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
  
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6 mt-2">
        False-position Methods
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
              onClick={() => handleFalsePosition(fx)}
            >
              Calculate
            </button>
          </div>
        </form>
      </section>
      <div className="flex justify-center items-center">
        <select
          onChange={(e) => setFx(e.target.value)}
          className="border m-3 p-3"
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
          onClick={() => getEquation()}
        >
          GET
        </button>
        <button onClick={()=>saveEquation()} className="text-bold bg-[#000080] text-white p-3 rounded-xl m-2">SAVE</button>
      </div>
      <h1 className="text-2xl text-center">result = {result}</h1>

      <div className="flex justify-center items-center">
        <Chart data={table} />
      </div>
      <Table table={table} />
    </>
  );
}
export default Falsepos;
