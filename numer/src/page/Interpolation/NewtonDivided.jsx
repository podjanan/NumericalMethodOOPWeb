// NewtonDividedEngine.jsx
import BaseInterpolation from "./BaseInterpolation.jsx";

export default class NewtonDividedEngine extends BaseInterpolation {
  dividedDiffTable(xs, ys) {
    const n = xs.length;
    const T = Array.from({ length: n }, () => Array(n).fill(null));
    for (let i = 0; i < n; i++) T[i][0] = ys[i];
    for (let j = 1; j < n; j++) {
      for (let i = 0; i < n - j; i++) {
        const denom = xs[i + j] - xs[i];
        T[i][j] = (T[i + 1][j - 1] - T[i][j - 1]) / denom;
      }
    }
    const coeffs = T[0].slice(0, n);
    return { T, coeffs };
  }

  evaluateNewton(xs, coeffs, X) {
    let sum = coeffs[0];
    let prod = 1;
    for (let k = 1; k < coeffs.length; k++) {
      prod *= X - xs[k - 1];
      sum += coeffs[k] * prod;
    }
    return sum;
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

    const { T, coeffs } = this.dividedDiffTable(xs, ys);
    const result = this.evaluateNewton(xs, coeffs, Xnum);
    return { result, artifacts: { table: T, coeffs } };
  }
}
