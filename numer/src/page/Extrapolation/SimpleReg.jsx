import { useState } from "react";



function  SimpleRegression(){
  const [valX , setValX] = useState(0);
  const [arrX , setarrX] = useState([]);
  const [arrY , setarrY] = useState([]);
  const [numberOfpoint,setNumberOfPoint] = useState(1);
  const [arrCal , setarrCal] = useState([]);
  const [result , setResult] = useState(null);



  const AddX =(index,value)=>{
    const newArr = [...arrX];
    newArr[index] = parseFloat(value);
    setarrX(newArr)
  }
  const AddY =(index,value)=>{
    const newArr = [...arrY];
    newArr[index] = parseFloat(value);
    setarrY(newArr)
  }
  const cal2x2 = (m11,m12,m21,m22,y1,y2)=>{
    let det;
    let det1;
    let det2;
    det = (m11*m22) - (m21*m12);
    det2 = (m11*y2) - (m21*y1);
    det1 = (y1*m22) - (y2*m12);

    const a0 = det1 / det;
    const a1 = det2 / det;
    console.log(a1);
    const result = a0+(a1*valX);
    setResult(result);
  }
  const handleSimpleRegression =()=>{
    let m11 = numberOfpoint;
    let m12 = 0;
    let m21 = 0;
    let m22 = 0;
    let y1 = 0;
    let y2 = 0;
    for(let i = 0 ; i < m11 ; i++){
      m12 += arrX[i];
      m21 += arrX[i];
      m22 += arrX[i] * arrX[i];
      y1 += arrY[i];
      y2 += arrY[i] * arrX[i];
    }
    cal2x2(m11,m12,m21,m22,y1,y2);
  }


  return(
    <>
      <h1 className="text-3xl font-bold text-center m-4">Simple Regression</h1>
      <div className="flex justify-center items-center">
        <label className="">X value</label>
        <input className="border text-center m-4" type="number" value={valX} onChange={(e)=>setValX(e.target.value)} />

        <label className="">Number of points</label>
        <input className="border text-center m-4" type="number" value={numberOfpoint} onChange={(e)=>setNumberOfPoint(e.target.value)} />

        <button className="border m-2 p-3 rounded-xl bg-green-300" onClick={()=>handleSimpleRegression()}>Calculator</button>
      </div>
      <div className="grid justify-center items-center">
          {Array.from({length:numberOfpoint}).map((_,i)=>
           <div key={i}>
              <input onChange={(e)=>AddX(i,e.target.value)} type="number" placeholder={`x${i}`} className="border text-center m-1"/>
              <input onChange={(e)=>AddY(i,e.target.value)} type="number" placeholder={`f(x${i})`} className="border text-center m-1"/>
           </div>
           )
          }
      </div>
      <h1 className="text-center text-4xl font-bold">result = {result}</h1>
      
    </>
  )

}
export default SimpleRegression;