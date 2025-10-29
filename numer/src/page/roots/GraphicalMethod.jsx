// GraphicalMethod.jsx
import NumericalMethod from "./NumericalMethod";

export default class GraphicalMethod extends NumericalMethod {
  get methodName() {
    return "Graphical";
  }

  solve = () => {
    const { fx, XLeft, XRight, Agree } = this.state;

    const xstart = Number(XLeft);
    const xend = Number(XRight);
    const tol = Number(Agree) || 1e-6;
    const maxIter = this.MAX_ITER;

    const f = (x) => Number(this.evaluate(fx, x));

    let iter = 0;
    this.clearTable();

    // 1) Scan หา sign-change (step = 1)
    const step = 1;
    let a = xstart;
    let fa = f(a);
    this.addRow(iter, a, fa, Math.abs(fa));

    let b = xend;
    let foundInterval = false;

    for (let x = xstart + step; x <= xend; x += step) {
      const fxv = f(x);
      iter++;
      this.addRow(iter, x, fxv, Math.abs(fxv));

      if (fa === 0 || fxv === 0 || fa * fxv < 0) {
        a = x - step;
        fa = f(a);
        b = x;
        iter++;
        this.addRow(iter, a, fa, Math.abs(fa));
        foundInterval = true;
        break;
      }
      fa = fxv;
      a = x;
    }

    if (!foundInterval) {
      this.setState({ result: NaN });
      alert("ไม่พบช่วงที่มีรากในช่วงที่กำหนด");
      return;
    }

    // 2) ซูมแบบ Bisection
    let fb = f(b);
    iter++;
    this.addRow(iter, b, fb, Math.abs(fb));

    if (fa * fb > 0) {
      this.setState({ result: NaN });
      alert("ช่วงที่พบไม่มี sign-change จริง");
      return;
    }

    let root = a;
    for (let k = 0; k < maxIter; k++) {
      const m = 0.5 * (a + b);
      const fm = f(m);
      iter++;
      this.addRow(iter, m, fm, Math.abs(fm));
      root = m;

      if (Math.abs(fm) <= tol || Math.abs(b - a) <= 1e-9) break;

      if (fa * fm < 0) {
        b = m;
        fb = fm;
      } else {
        a = m;
        fa = fm;
      }
    }

    this.setState({ result: root });
  };
}
