import { useState } from "react";
import { BlockMath } from "react-katex";
import * as math from "mathjs";
import axios from "axios";

function Diff() {
  const [order, setorder] = useState("");
  const [error, setError] = useState("");
  const [direction, setDirection] = useState("");
  const [fx, setFx] = useState("");
  const [valX, setValX] = useState(2.0);
  const [valh, setValh] = useState(0.25);
  const [result, setResult] = useState(null);
  const [valErr, setErr] = useState(null);
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


  const f = (equal, x) => math.evaluate(equal, { x });

  const handleCal = (equal) => {
    if (!equal || !order || !error || !direction) {
      alert("กรอกข้อมูลให้ครบ");
      return;
    }
    const h = Number(valh);
    const x = Number(valX);
    if (!isFinite(h) || !isFinite(x) || h === 0) {
      alert("ค่า x หรือ h ไม่ถูกต้อง (และ h ต้องไม่เท่ากับ 0)");
      return;
    }

    const fxdiff1 = math.derivative(equal, "x").toString();
    const fxdiff2 = math.derivative(fxdiff1, "x").toString();
    const fxdiff3 = math.derivative(fxdiff2, "x").toString();
    const fxdiff4 = math.derivative(fxdiff3, "x").toString();

    const fx0 = f(equal, x);
    const fx1 = f(equal, x + h);
    const fx2 = f(equal, x + 2 * h);
    const fx3 = f(equal, x + 3 * h);
    const fx4 = f(equal, x + 4 * h);
    const f_1 = f(equal, x - h);
    const f_2 = f(equal, x - 2 * h);
    const f_3 = f(equal, x - 3 * h);
    const f_4 = f(equal, x - 4 * h);

    const pctErr = (approx, real) =>
      real !== 0 ? math.abs((approx - real) / real) * 100 : math.abs(approx) * 100;

    if (order === "First") {
      const realval = f(fxdiff1, x);
      if (direction === "Forward") {
        if (error === "O(h)") {
          const r = (fx1 - fx0) / h;
          setResult(r); setErr(pctErr(r, realval));
        } else if (error === "O(h^2)" || error === "O(h^4)") {
          const r = (-3 * fx0 + 4 * fx1 - fx2) / (2 * h);
          setResult(r); setErr(pctErr(r, realval));
        }
      } else if (direction === "Backward") {
        if (error === "O(h)") {
          const r = (fx0 - f_1) / h;
          setResult(r); setErr(pctErr(r, realval));
        } else if (error === "O(h^2)" || error === "O(h^4)") {
          const r = (3 * fx0 - 4 * f_1 + f_2) / (2 * h);
          setResult(r); setErr(pctErr(r, realval));
        }
      } else if (direction === "Central") {
        if (error === "O(h)" || error === "O(h^2)") {
          const r = (fx1 - f_1) / (2 * h);
          setResult(r); setErr(pctErr(r, realval));
        } else if (error === "O(h^4)") {
          const r = (-fx2 + 8 * fx1 - 8 * f_1 + f_2) / (12 * h);
          setResult(r); setErr(pctErr(r, realval));
        }
      }
    } else if (order === "Second") {
      const realval = f(fxdiff2, x);
      if (direction === "Forward") {
        if (error === "O(h)") {
          const r = (fx0 - 2 * fx1 + fx2) / (h * h);
          setResult(r); setErr(pctErr(r, realval));
        } else if (error === "O(h^2)" || error === "O(h^4)") {
          const r = (2 * fx0 - 5 * fx1 + 4 * fx2 - fx3) / (h * h);
          setResult(r); setErr(pctErr(r, realval));
        }
      } else if (direction === "Backward") {
        if (error === "O(h)") {
          const r = (fx0 - 2 * f_1 + f_2) / (h * h);
          setResult(r); setErr(pctErr(r, realval));
        } else if (error === "O(h^2)" || error === "O(h^4)") {
          const r = (2 * fx0 - 5 * f_1 + 4 * f_2 - f_3) / (h * h);
          setResult(r); setErr(pctErr(r, realval));
        }
      } else if (direction === "Central") {
        if (error === "O(h)" || error === "O(h^2)") {
          const r = (fx1 - 2 * fx0 + f_1) / (h * h);
          setResult(r); setErr(pctErr(r, realval));
        } else if (error === "O(h^4)") {
          const r = (-fx2 + 16 * fx1 - 30 * fx0 + 16 * f_1 - f_2) / (12 * h * h);
          setResult(r); setErr(pctErr(r, realval));
        }
      }
    } else if (order === "Third") {
      const realval = f(fxdiff3, x);
      if (direction === "Forward") {
        const r = (-fx0 + 3 * fx1 - 3 * fx2 + fx3) / (h ** 3);
        setResult(r); setErr(pctErr(r, realval));
      } else if (direction === "Backward") {
        const r = (fx0 - 3 * f_1 + 3 * f_2 - f_3) / (h ** 3);
        setResult(r); setErr(pctErr(r, realval));
      } else if (direction === "Central") {
        const r = (f_2 - 2 * f_1 + 2 * fx1 - fx2) / (2 * h ** 3); // O(h^2)
        setResult(r); setErr(pctErr(r, realval));
      }
    } else if (order === "Fourth") {
      const realval = f(fxdiff4, x);
      if (direction === "Forward") {
        const r = (fx0 - 4 * fx1 + 6 * fx2 - 4 * fx3 + fx4) / (h ** 4);
        setResult(r); setErr(pctErr(r, realval));
      } else if (direction === "Backward") {
        const r = (fx0 - 4 * f_1 + 6 * f_2 - 4 * f_3 + f_4) / (h ** 4);
        setResult(r); setErr(pctErr(r, realval));
      } else if (direction === "Central") {
        if (error === "O(h)" || error === "O(h^2)") {
          const r = (f_2 - 4 * f_1 + 6 * fx0 - 4 * fx1 + fx2) / (h ** 4);
          setResult(r); setErr(pctErr(r, realval));
        } else if (error === "O(h^4)") {
          const r = (-f_3 + 12 * f_2 - 39 * f_1 + 56 * fx0 - 39 * fx1 + 12 * fx2 - fx3) / (6 * h ** 4);
          setResult(r); setErr(pctErr(r, realval));
        }
      }
    } else {
      alert("กรอกข้อมูลให้ครบ");
    }
  };

  return (
    <>
      <h1 className="m-2 font-bold text-4xl text-center">Differentiation</h1>
      <h1 className="m-2 font-bold text-2xl text-center">
        <BlockMath math={`f(x) = ${fx || ""}`} />
      </h1>

      <div className="flex justify-center m-2 items-center">
        <label>Order </label>
        <select
          value={order}
          onChange={(e) => setorder(e.target.value)}
          className="p-2 border m-2"
        >
          <option value="">-</option>
          <option value="First">First</option>
          <option value="Second">Second</option>
          <option value="Third">Third</option>
          <option value="Fourth">Fourth</option>
        </select>

        <label>Error </label>
        <select
          value={error}
          onChange={(e) => setError(e.target.value)}
          className="p-2 border m-2"
        >
          <option value="">-</option>
          <option value="O(h)">O(h)</option>
          <option value="O(h^2)">O(h^2)</option>
          <option value="O(h^4)">O(h^4)</option>
        </select>

        <label>Direction </label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="p-2 border m-2"
        >
          <option value="">-</option>
          <option value="Forward">Forward</option>
          <option value="Backward">Backward</option>
          <option value="Central">Central</option>
        </select>
      </div>

      <div className="flex justify-center items-center">
        <label>f(x)</label>
        <input
          type="text"
          className="border rounded-md m-2 text-center"
          value={fx}
          onChange={(e) => setFx(e.target.value)}
          placeholder="เช่น sin(x) + x^2"
        />

        <label>x</label>
        <input
          type="number"
          className="border rounded-md m-2 text-center"
          value={valX}
          onChange={(e) => setValX(parseFloat(e.target.value))}
          step="any"
        />

        <label>h</label>
        <input
          type="number"
          className="border rounded-md m-2 text-center"
          value={valh}
          onChange={(e) => setValh(parseFloat(e.target.value))}
          step="any"
        />
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
      <div className="flex items-center justify-center">
        <button
          onClick={() => handleCal(fx)}
          className="bg-green-300 m-2 p-3 w-100 rounded-xl font-bold"
        >
          Calculator
        </button>
      </div>

      <h1 className="font-bold text-4xl m-2 text-center">
        result = {result !== null ? result : "-"}
      </h1>
      <h1 className="font-bold text-4xl m-2 text-center">
        Error = {valErr !== null ? `${valErr}%` : "-"}
      </h1>
    </>
  );
}

export default Diff;
