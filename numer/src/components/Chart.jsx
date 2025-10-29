import Plot from "react-plotly.js";

export default function MyChart({data}) {
  return (
    <Plot
    data={[
        {
        x: data.map((d) => d.iter),
        y: data.map((d) => d.error),
        type: "scatter",
        mode: "lines+markers",
        marker: { color: "blue" },
        
        },
        
    ]}
    layout={{
    xaxis: { title: { text: "x", font: { color: "black" } } },
    yaxis: { title: { text: "y", font: { color: "black" } } },
    }}
/>

  );
}
