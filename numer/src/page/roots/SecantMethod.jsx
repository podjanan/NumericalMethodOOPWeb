// SecantMethod.jsx
import NumericalMethod from "./NumericalMethod";

export default class SecantMethod extends NumericalMethod {
  get methodName() {
    return "Secant";
  }

  solve = () => {
    const { fx, XLeft, XRight, Agree } = this.state;

    let x0 = Number(XLeft);
    let x1 = Number(XRight);
    const tol = Number(Agree);
    const maxIter = 100;
    let iter = 0;
    let root = null;

    for (let i = 0; i < maxIter; i++) {
      iter++;

      const f0 = this.evaluate(fx, x0);
      const f1 = this.evaluate(fx, x1);
      const denom = f1 - f0;

      if (!Number.isFinite(denom) || denom === 0) {
        alert("ตัวส่วนเป็นศูนย์หรือไม่เป็นจำนวน (Secant)");
        break;
      }

      const x2 = x1 - (f1 * (x1 - x0)) / denom;

      const err = Math.abs((x2 - x1) / x2);
      const y2 = this.evaluate(fx, x2);

      this.addRow(iter, x2, y2, err);

      if (err < tol) {
        root = x2;
        this.setState({ result: root });
        return;
      }

      x0 = x1;
      x1 = x2;
      root = x2;
    }

    this.setState({ result: root });
  };
}
