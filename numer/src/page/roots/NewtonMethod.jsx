// NewtonMethod.jsx
import * as math from "mathjs";
import NumericalMethod from "./NumericalMethod";

export default class NewtonMethod extends NumericalMethod {
  get methodName() {
    return "Newton-Raphson";
  }

  solve = () => {
    const { fx, XLeft, Agree } = this.state;

    let x = Number(XLeft);  // ใช้ XLeft เป็น x0
    const tol = Number(Agree) || 1e-6;
    const MAX = 100;

    if (!Number.isFinite(x)) {
      alert("ค่าเริ่มต้นไม่ถูกต้อง");
      return;
    }

    const fprimeAt = (expr, xv) => {
      try {
        const node = math.derivative(expr, "x");
        return node.evaluate({ x: xv });
      } catch {
        return NaN;
      }
    };

    let root = x;

    for (let i = 0; i < MAX; i++) {
      const fxn = this.evaluate(fx, x);
      const dfxn = fprimeAt(fx, x);

      if (!Number.isFinite(fxn) || !Number.isFinite(dfxn)) {
        alert("ไม่สามารถประเมิน f(x) หรือ f'(x) ได้");
        break;
      }
      if (dfxn === 0) {
        alert("f'(x) = 0 ทำให้หารไม่ได้ (Newton)");
        break;
      }

      const xnext = x - fxn / dfxn;
      const err = xnext !== 0 ? Math.abs((xnext - x) / xnext) : Math.abs(xnext - x);

      this.addRow(i + 1, x, fxn, err);

      root = xnext;

      const froot = this.evaluate(fx, root);
      if (err < tol || Math.abs(froot) < tol) {
        this.setState({ result: root });
        return;
      }

      x = xnext;
    }

    this.setState({ result: root });
  };
}
