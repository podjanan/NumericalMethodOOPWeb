import LinearMethodBase from "./LinearMethodBase";

export default class GaussElimination extends LinearMethodBase {
  get methodName() {
    return "Gauss Elimination Method";
  }

  solve = () => {
    const n = this.state.n;
    const a = this.readA();
    const b = this.readB();
    const EPS = this.EPS;

    // forward elimination with partial pivoting
    for (let i = 0; i < n; i++) {
      let piv = i;
      for (let r = i + 1; r < n; r++) {
        if (Math.abs(a[r][i]) > Math.abs(a[piv][i])) piv = r;
      }
      if (Math.abs(a[piv][i]) < EPS) {
        this.setState({ X: [], errorMsg: "เมทริกซ์เกิดภาวะเอกฐาน/เกือบเอกฐาน" });
        return;
      }
      if (piv !== i) {
        [a[piv], a[i]] = [a[i], a[piv]];
        [b[piv], b[i]] = [b[i], b[piv]];
      }

      for (let r = i + 1; r < n; r++) {
        const factor = a[r][i] / a[i][i];
        if (Math.abs(factor) < EPS) continue;
        for (let c = i; c < n; c++) a[r][c] -= factor * a[i][c];
        b[r] -= factor * b[i];
      }
    }

    // back substitution
    const X = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let c = i + 1; c < n; c++) sum += a[i][c] * X[c];
      const denom = a[i][i];
      if (Math.abs(denom) < EPS) {
        this.setState({ X: [], errorMsg: "pivot = 0 ใน back-substitution" });
        return;
      }
      X[i] = (b[i] - sum) / denom;
    }

    this.setState({ X, errorMsg: "" });
  };
}
