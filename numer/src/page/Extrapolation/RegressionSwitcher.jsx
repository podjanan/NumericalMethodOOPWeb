import React, { Component } from "react";
import MultiLinearRegression from "./MultiLinearRegression.jsx";
import PolynomialRegression from "./PolynomialRegression.jsx";

export default class RegressionSwitcher extends Component {
  constructor(props) {
    super(props);
    this.state = { method: "poly" }; // multi | poly
  }

  render() {
    const { method } = this.state;
    return (
      <div className="p-4">
        <div className="flex justify-center items-center gap-3 mb-4">
          <span className="font-medium">Regression Method:</span>
          <select
            className="border p-2 rounded"
            value={method}
            onChange={(e) => this.setState({ method: e.target.value })}
          >
            <option value="poly">Polynomial Regression</option>
            <option value="multi">Multiple Linear Regression</option>
          </select>
        </div>

        {method === "multi" && <MultiLinearRegression />}
        {method === "poly" && <PolynomialRegression />}
      </div>
    );
  }
}
