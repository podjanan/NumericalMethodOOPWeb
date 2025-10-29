import LinearMethodBase from "./LinearMethodBase";

export default class GaussJordan extends LinearMethodBase {
  get methodName() {
    return "Gauss–Jordan Method";
  }

  solve = () => {
    const n = this.state.n;
    const a = this.readA();
    const b = this.readB();
    const EPS = this.EPS;

    for (let i = 0; i < n; i++) {
      let piv = i;
      for (let r = i + 1; r < n; r++) {
        if (Math.abs(a[r][i]) > Math.abs(a[piv][i])) piv = r;
      }
      if (Math.abs(a[piv][i]) < EPS) {
        this.setState({ X: [], errorMsg: "เมทริกซ์เอกฐาน/เกือบเอกฐาน" });
        return;
      }
      if (piv !== i) {
        [a[i], a[piv]] = [a[piv], a[i]];
        [b[i], b[piv]] = [b[piv], b[i]];
      }

      // normalize row i
      const pivVal = a[i][i];
      for (let c = 0; c < n; c++) a[i][c] /= pivVal;
      b[i] /= pivVal;

      // eliminate other rows
      for (let r = 0; r < n; r++) {
        if (r === i) continue;
        const factor = a[r][i];
        if (Math.abs(factor) < EPS) continue;
        for (let c = i; c < n; c++) a[r][c] -= factor * a[i][c];
        b[r] -= factor * b[i];
      }
    }

    this.setState({ X: b, errorMsg: "" });
  };
}
