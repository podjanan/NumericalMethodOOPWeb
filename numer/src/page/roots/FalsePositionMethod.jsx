// FalsePositionMethod.jsx
import NumericalMethod from "./NumericalMethod";

export default class FalsePositionMethod extends NumericalMethod {
  get methodName() {
    return "False-position";
  }

  solve = () => {
    const { fx, XLeft, XRight, Agree } = this.state;

    const tol = Number(Agree) || 1e-6;
    const MAX = 100;

    let xl = Number(XLeft);
    let xr = Number(XRight);

    if (!Number.isFinite(xl) || !Number.isFinite(xr)) {
      alert("ช่วงเริ่มต้นไม่ถูกต้อง");
      return;
    }

    let fxl = this.evaluate(fx, xl);
    let fxr = this.evaluate(fx, xr);

    if (!Number.isFinite(fxl) || !Number.isFinite(fxr)) {
      alert("ค่า f(x) ที่ปลายช่วงไม่ถูกต้อง");
      return;
    }
    if (fxl * fxr > 0) {
      alert("ช่วง [xl, xr] ไม่คร่อมราก (fxl * fxr > 0)");
      return;
    }

    let xm = xl;
    let xmold = null;
    let error = 1;
    let i = 0;

    while (error > tol && i < MAX) {
      const denom = fxr - fxl;
      if (denom === 0 || !Number.isFinite(denom)) {
        alert("ตัวส่วนเป็นศูนย์/ไม่เป็นจำนวน (fxr - fxl)");
        break;
      }

      // Regula Falsi
      xm = (xl * fxr - xr * fxl) / denom;
      const fxm = this.evaluate(fx, xm);

      if (xmold !== null && xm !== 0) {
        error = Math.abs((xm - xmold) / xm);
      } else {
        error = 1;
      }
      xmold = xm;

      i += 1;
      this.addRow(i, xm, fxm, error);

      if (fxl * fxm > 0) {
        xl = xm;
        fxl = fxm;
      } else if (fxr * fxm > 0) {
        xr = xm;
        fxr = fxm;
      } else {
        error = 0; // ได้รากพอดี
        break;
      }
    }

    if (i >= MAX) console.warn("ถึงจำนวนรอบสูงสุด");
    this.setState({ result: xm });
  };
}
