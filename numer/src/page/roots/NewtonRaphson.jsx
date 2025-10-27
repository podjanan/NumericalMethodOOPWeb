import { useState } from "react";
import * as math from 'mathjs';
import Table from "../../components/Table";
import Chart from "../../components/Chart";
import axios from "axios";

import { BlockMath } from 'react-katex';


function Newton(){
    const [table , setTable] = useState([]);
    const [fx, setFx] = useState("");
    const [XInitial,setXInitial] = useState(0);
    const [error,setError] = useState(0.000001);
    const [result, setResult] = useState(null);
    const [equationDB , setDB] = useState([]);


    const getFx = async()=>{
      const res = await axios("http://localhost:5000/roe");
      const data = res.data.results.map(item=>item.equation);
      setDB(data);
    }
    const fxnormal = (expression, x) => {
        try {
          const processedExpression = expression.replace(/x/g, `(${x})`);
          const result = math.evaluate(processedExpression);
          return result;
        } catch (err) {
          alert("สมการมั่ว");
        }
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
    const fxdiff = (expression, x) => {
        try {
            const dnode = math.derivative(expression, "x"); // ได้เป็น node ของ f'(x)
            return dnode.evaluate({ x });                   // ประเมินค่าที่ x
        } catch {
            return NaN; 
        }
        };
    const handleCalculate = () => {
    let x = Number(XInitial);
    const tol = Number(error);  
    const MAX = 100;

    const rows = [];
    let root = x;

    for (let i = 0; i < MAX; i++) {
        const fxn  = fxnormal(fx, x);      
        const dfxn = fxdiff(fx, x);

        const xnext = x - fxn / dfxn;
        const err = xnext !== 0 ? Math.abs((xnext - x) / xnext) : Math.abs(xnext - x);

        rows.push({ iter: i + 1, x:x, y: fxn, error:err });
        root = xnext;

        const froot = fxnormal(fx, root);
        if (err < tol || Math.abs(froot) < tol) break;

        x = xnext;
    }

    setTable(rows);
    setResult(root);
    };


    return(
    <>
    <h1 className="text-2xl font-bold text-center mb-6 mt-2">
          Newton-Raphson methods
    </h1>
    <h2 className="text-2xl text-center ">
          <BlockMath math={`f(x) = ${fx}`} />
    </h2>
    <section>
      <form>
        <div className="m-4 flex items-center justify-center">
          <label className="block text-gray-700 font-medium mr-2">สมการ</label>
          <input value={fx} onChange={(e)=>setFx(e.target.value)} placeholder="43x-180" type="text" className="border border-gray-400 p-2 rounded mr-5"/>

          <label className="block text-gray-700 font-medium mr-2">X Initial</label>
          <input value={XInitial} onChange={(e)=>setXInitial(Number(e.target.value))} placeholder="0" type="number" className="border border-gray-400 p-2 rounded mr-5"/>

          <label className="block text-gray-700 font-medium mr-2">ข้อผิดพลาด</label>
          <input value={error} onChange={(e)=>setError(parseFloat(e.target.value))} placeholder="0.000001" step="any" type="number" className="border border-gray-400 p-2 rounded mr-5"/>

          <button className="text-bold bg-[#000080] text-white p-3 rounded-xl" type="button" onClick={()=>{handleCalculate()}}  >Calculate</button>
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
      <h1 className="text-2xl text-center">result = {result}</h1>

        <Chart data = {table}/>
        <Table table = {table}/>
    </>
    );
}
export default Newton;