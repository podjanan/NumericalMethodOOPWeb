// SplineEngine.jsx
import BaseInterpolation from "./BaseInterpolation.jsx";

export default class Spline extends BaseInterpolation {
  constructor(mode = "linear") {
    super();
    this.mode = mode; // 'linear' | 'quadratic' | 'cubic'
  }

  findInterval(xs, X) {
    const n = xs.length;
    if (X <= xs[0]) return 0;
    if (X >= xs[n - 1]) return n - 2;
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= X) lo = mid; else hi = mid;
    }
    return lo;
  }

  evalLinear(xs, ys, X) {
    const i = this.findInterval(xs, X);
    const x0 = xs[i], y0 = ys[i];
    const x1 = xs[i + 1], y1 = ys[i + 1];
    const t = (X - x0) / (x1 - x0);
    return y0 + t * (y1 - y0);
  }

  evalQuadraticLocal(xs, ys, X) {
    const n = xs.length;
    if (n < 3) throw new Error("Quadratic ต้องมีอย่างน้อย 3 จุด");
    let i = this.findInterval(xs, X);
    if (i === 0) i = 0;
    else if (i >= n - 2) i = n - 3;
    else i = i - 1;

    const [x0, x1, x2] = [xs[i], xs[i + 1], xs[i + 2]];
    const [y0, y1, y2] = [ys[i], ys[i + 1], ys[i + 2]];
    const L0 = ((X - x1) * (X - x2)) / ((x0 - x1) * (x0 - x2));
    const L1 = ((X - x0) * (X - x2)) / ((x1 - x0) * (x1 - x2));
    const L2 = ((X - x0) * (X - x1)) / ((x2 - x0) * (x2 - x1));
    return y0 * L0 + y1 * L1 + y2 * L2;
  }

  buildNaturalCubic(xs, ys) {
    const n = xs.length;
    if (n < 2) throw new Error("ต้องมีอย่างน้อย 2 จุด");
    const h = Array(n - 1);
    for (let i = 0; i < n - 1; i++) {
      h[i] = xs[i + 1] - xs[i];
      if (h[i] === 0) throw new Error("พบ x ที่ซ้ำ");
    }

    const a = Array(n).fill(0), b = Array(n).fill(0), c = Array(n).fill(0), d = Array(n).fill(0);
    b[0] = 1; d[0] = 0;
    b[n - 1] = 1; d[n - 1] = 0;

    for (let i = 1; i < n - 1; i++) {
      a[i] = h[i - 1];
      b[i] = 2 * (h[i - 1] + h[i]);
      c[i] = h[i];
      d[i] = 6 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1]);
    }

    // Thomas
    for (let i = 1; i < n; i++) {
      const w = a[i] / b[i - 1];
      b[i] -= w * c[i - 1];
      d[i] -= w * d[i - 1];
    }
    const z = Array(n).fill(0);
    z[n - 1] = d[n - 1] / b[n - 1];
    for (let i = n - 2; i >= 0; i--) {
      z[i] = (d[i] - c[i] * z[i + 1]) / b[i];
    }
    return { h, z };
  }

  evalCubic(xs, ys, X, h, z) {
    const i = this.findInterval(xs, X);
    const xi = xs[i], xi1 = xs[i + 1];
    const hi = h[i];
    const zi = z[i], zi1 = z[i + 1];
    const Ai = (xi1 - X) / hi;
    const Bi = (X - xi) / hi;
    return (
      Ai * ys[i] + Bi * ys[i + 1] +
      ((Ai ** 3 - Ai) * zi * (hi ** 2)) / 6 +
      ((Bi ** 3 - Bi) * zi1 * (hi ** 2)) / 6
    );
  }

  solve(points, X) {
    const parsed = this.validatePoints(points, X);
    this.ensureDistinctX(parsed);
    const sorted = this.sortByX(parsed);
    const xs = sorted.map((p) => p.x);
    const ys = sorted.map((p) => p.y);
    const Xnum = Number(X);

    for (let i = 0; i < xs.length; i++) {
      if (Xnum === xs[i]) {
        return { result: ys[i], artifacts: { hitIndex: i } };
      }
    }

    if (this.mode === "linear") {
      return { result: this.evalLinear(xs, ys, Xnum), artifacts: null };
    }
    if (this.mode === "quadratic") {
      const r = this.evalQuadraticLocal(xs, ys, Xnum);
      return { result: r, artifacts: { note: "local quadratic via 3 neighboring points" } };
    }
    // cubic
    if (xs.length < 3) {
      return { result: this.evalLinear(xs, ys, Xnum), artifacts: { downgraded: "linear" } };
    }
    const { h, z } = this.buildNaturalCubic(xs, ys);
    const r = this.evalCubic(xs, ys, Xnum, h, z);
    return { result: r, artifacts: { h, z } };
  }
}
