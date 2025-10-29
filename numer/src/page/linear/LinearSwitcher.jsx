import React, { Component } from "react";
import CramersRule from "./CramersRule";
import GaussElimination from "./GaussElimination";
import GaussJordan from "./GaussJordan";
import MatrixInversion from "./MatrixInversion";
import LUDecomposition from "./LUDecomposition";
import GaussSeidel from "./GaussSeidel";

export default class LinearSwitcher extends Component {
  constructor(props) {
    super(props);
    this.state = { method: "cramer" };
  }

  render() {
    const { method } = this.state;
    return (
      <div className="p-4">
        <div className="flex justify-center items-center gap-3 mb-4">
          <span className="font-medium">Linear System Method:</span>
          <select
            className="border p-2 rounded"
            value={method}
            onChange={(e) => this.setState({ method: e.target.value })}
          >
            <option value="cramer">Cramer's Rule</option>
            <option value="gauss">Gauss Elimination</option>
            <option value="jordan">Gauss–Jordan</option>
            <option value="inv">Matrix Inversion</option>
            <option value="lu">LU Decomposition</option>
            <option value="seidel">Gauss–Seidel</option>
          </select>
        </div>

        {method === "cramer" && <CramersRule />}
        {method === "gauss" && <GaussElimination />}
        {method === "jordan" && <GaussJordan />}
        {method === "inv" && <MatrixInversion />}
        {method === "lu" && <LUDecomposition />}
        {method === "seidel" && <GaussSeidel />}
      </div>
    );
  }
}
