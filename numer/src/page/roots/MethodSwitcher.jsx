// MethodSwitcher.jsx
import React, { Component } from "react";
import GraphicalMethod from "./GraphicalMethod";
import BisectionMethod from "./BisectionMethod";
import FalsePositionMethod from "./FalsePositionMethod";
import SecantMethod from "./SecantMethod";
import NewtonMethod from "./NewtonMethod";

export default class RootsSwitcher extends Component {
  constructor(props) {
    super(props);
    this.state = { method: "graphical" };
  }

  render() {
    const { method } = this.state;
    return (
      <div className="p-4">
        <div className="flex justify-center items-center gap-3 mb-4">
          <span className="font-medium">Method:</span>
          <select
            className="border p-2 rounded"
            value={method}
            onChange={(e) => this.setState({ method: e.target.value })}
          >
            <option value="graphical">Graphical</option>
            <option value="bisection">Bisection</option>
            <option value="falseposition">False-position</option>
            <option value="secant">Secant</option>
            <option value="newton">Newton-Raphson</option>
          </select>
        </div>

        {method === "graphical" && <GraphicalMethod />}
        {method === "bisection" && <BisectionMethod />}
        {method === "falseposition" && <FalsePositionMethod />}
        {method === "secant" && <SecantMethod />}
        {method === "newton" && <NewtonMethod />}
      </div>
    );
  }
}
