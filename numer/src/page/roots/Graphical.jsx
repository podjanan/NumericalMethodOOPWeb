import { useState } from "react";
import * as math from 'mathjs';
import axios from "axios";

import Table from "../../components/Table";
import MyChart from "../../components/Chart2";

function Graphical(){
    const [valXl,setXl] = useState(0);
    const [valXr,setXr] = useState(10);
    const [fx,setFx] = useState("");
    const [valErr , setErr] = useState(0.000001);
    const [result , setResult] = useState(0);
    const [history, setHistory] = useState([]);
    const [equationdb,setEquationdb] = useState([]); 

    const getAPI = async()=>{
        const res = await axios("http://localhost:5000/roe");
        const equation = res.data.results.map(item => item.equation)
        setEquationdb(equation);
    }
    const saveEquation = async(fx)=>{
        const res = await axios("http://localhost:5000/roe");
        const equation = res.data.results.map((item)=>item.equation);
        let find = 0;
        equation.map((value,index)=>{
            if(value === fx){
                find = 1;
            }
        })
        if (find){
            alert("สมการนี้มีแล้ว");
        }else{
            await axios.post("http://localhost:5000/roe",{equation:fx});
            alert("บันทึกเรียบร้อยกด GET ใหม่");
        }
    }

    const evaluate = (expression , x)=>{
        try{
            const process = expression.replace(/x/g,`(${x})`);
            const result = math.evaluate(process);
            return result;
        }catch{
             alert("สมการมั่ว");
        }
    }

    function handleGraphical(equation) {
    const xstart = Number(valXl);
    const xend = Number(valXr);
    const tol = Number(valErr) || 1e-6;
    const maxIter = 1000;

    const f = (x) => Number(evaluate(equation, x));

    let iter = 0;
    const rows = [];

    const step = 1;
    let a = xstart;
    let fa = f(a);
    rows.push({ iter, x: a, y: fa, error: Math.abs(fa) });

    let b = xend;
    let foundInterval = false;

    for (let x = xstart + step; x <= xend; x += step) {
        const fx = f(x);
        iter++;
        rows.push({ iter, x, y: fx, error: Math.abs(fx) });

        if (fa === 0 || fx === 0 || fa * fx < 0) {
            a = x - step;
            fa = f(a);
            b = x;
            iter++;
            rows.push({ iter, x: a, y: fa, error: Math.abs(fa) });
            foundInterval = true;
        break;
        }
        fa = fx;
        a = x;
    }

    if (!foundInterval) {
        setHistory(rows);
        setResult(NaN);
        alert("ไม่พบช่วงที่มีรากในช่วงที่กำหนด");
        return;
    }

    // 2) ซูมแบบ Bisection ให้ “สุด” ตาม tol
    let fb = f(b);
    iter++;
    rows.push({ iter, x: b, y: fb, error: Math.abs(fb) });

    if (fa * fb > 0) {
        // กันเหนียว: ถ้าดันไม่มี sign-change จริง ๆ ก็หยุด
        setHistory(rows);
        setResult(NaN);
        alert("ช่วงที่พบไม่มี sign-change");
        return;
    }

    let root = a;
    for (let k = 0; k < maxIter; k++) {
        const m = 0.5 * (a + b);
        const fm = f(m);
        iter++;
        rows.push({ iter, x: m, y: fm, error: Math.abs(fm) });
        root = m;

        if (Math.abs(fm) <= tol || Math.abs(b - a) <= 1e-9) break;

        if (fa * fm < 0) {
        b = m;
        fb = fm;
        } else {
        a = m;
        fa = fm;
        }
    }

    setHistory(rows);
    setResult(root);
    }

    return(
        <>
            <h1 className="text-2xl font-bold text-center m-4">Graphical Method</h1>
            <h1 className="text-xl font-bold text-center m-4">f(x) = {fx}</h1>
            <div className="flex items-center justify-center">
                <label className="m-2">f(x)</label>
                <input value={fx} onChange={(e)=>setFx(e.target.value)} type="text" placeholder="43x-180" className="border border-gray-400" />
                <label className="m-2">XStart</label>
                <input value={valXl}  onChange={(e)=>setXl(e.target.value)} type="number" className="border border-gray-400" />
                <label className="m-2">XEnd</label>
                <input value={valXr} onChange={(e)=>setXr(e.target.value)} type="number" className="border border-gray-400" />
                <label className="m-2">Error</label>
                <input value={valErr}  onChange={(e)=>setErr(e.target.value)} type="number" className="border border-gray-400" />

                <button className="ml-3 text-bold bg-[#000080] text-white p-3 rounded-xl" onClick={e=>(handleGraphical(fx))}>CAL</button>

            </div>
            <div className="flex justify-center items-center">
                <select onChange={(e)=>setFx(e.target.value)} className="border pl-3 pr-3 m-3">
                    <option value="" className="">เลือกสมการ</option>
                    {equationdb.map((value,index)=>(
                        <option key={index} value={value}>{value}</option>
                    ))}
                </select>
                <button onClick={()=>getAPI()} className="ml-3 text-bold bg-[#000080] text-white p-3 rounded-xl">GET</button>
                <button onClick={()=>saveEquation(fx)} className="ml-3 text-bold bg-[#000080] text-white p-3 rounded-xl">SAVE</button>
            </div>
            <h1 className="text-3xl text-center">result = {result}</h1>
            <div >
                <MyChart data={history}/>
                <Table table={history}/>
            </div>
        </>
    )
}

export default Graphical