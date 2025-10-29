// BisectionMethod.jsx
import NumericalMethod from "./NumericalMethod";

export default class BisectionMethod extends NumericalMethod {
  get methodName() {
    return "Bisection";
  }

  solve = () => {
    const { fx, XLeft, XRight, Agree } = this.state;

    let xl = Number(XLeft);
    let xr = Number(XRight);
    let xm = 0, xmold = 0;
    let i = 0;
    let error = 1;

    let fxl = this.evaluate(fx, xl);
    let fxr = this.evaluate(fx, xr);

    if (!Number.isFinite(fxl) || !Number.isFinite(fxr)) {
      alert("ค่า f(x) ไม่ถูกต้องในขอบเขตเริ่มต้น");
      return;
    }
    if (fxl * fxr > 0) {
      alert("ช่วง [xl, xr] ไม่มีการเปลี่ยนสัญญาณ (fxl*fxr > 0)");
      return;
    }

    while (error > Agree && i < this.MAX_ITER) {
      xm = (xl + xr) / 2;
      const fxm = this.evaluate(fx, xm);

      if (fxl * fxm > 0) {
        xl = xm;
        fxl = fxm;
      } else {
        xr = xm;
        fxr = fxm;
      }

      error = i > 0 ? Math.abs((xm - xmold) / xm) : 1;
      xmold = xm;
      i += 1;

      this.addRow(i, xm, fxm, error);
    }

    if (i >= this.MAX_ITER) console.warn("เกินจำนวนรอบสูงสุด");
    this.setState({ result: xm });
  };
}
