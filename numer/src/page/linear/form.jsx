import { useEffect, useState } from "react";



const makeA = n => Array.from({length:n}, () => Array.from({length:n}, () => ""));


function test(){
    const [Points,setPoints] = useState(1);
    const [arrA,setarrA] = useState(makeA(3));

    useEffect(()=>{
        setarrA(makeA(Points));
    },[Points]);

    const setA=(row,col,value)=>{
        console.log(row,col);
        const next  = [...arrA];
        next[row][col] = parseFloat(value);
        setarrA(next);
    }
    return (
        <>
        <h1 className="text-3xl font-bold text-center m-3">Newton's Divided Difference</h1>
        <div >
            <label >Points</label>
            <input type="number" className="border p-2 m-3" onChange={(e)=>setPoints(e.target.value)} value={Points} />

        </div>
        <div className="grid justify-center items-center">
            {Array.from({length:Points}).map((_,row)=>
            (
                <div key={row}>
                    { Array.from({length:Points}).map((_,col)=>(
                    <input placeholder={`A${row}${col}`} onChange={(e)=>setA(row,col,e.target.value)} key={`${row}-${col}`} type="text" className="border w-10 m-4" />
                    ))}
                </div>
                
            ))}
        </div>
        </>
    )

}

export default test;