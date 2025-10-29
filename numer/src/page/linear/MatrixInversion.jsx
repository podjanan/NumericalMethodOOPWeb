import { det } from "mathjs";
import LinearMethodBase from "./LinearMethodBase";

export default class MatrixInversion extends LinearMethodBase {
  get methodName() {
    return "Matrix Inversion Method";
  }

  solve = () => {
    const n = this.state.n;
    const A = this.readA();
    const b = this.readB();
    const EPS = this.EPS;

    try {
      const d = det(A);
      if (!Number.isFinite(d) || Math.abs(d) < EPS) {
        this.setState({ X: [], errorMsg: "det(A) ≈ 0 ⇒ ไม่สามารถกลับเมทริกซ์ได้" });
        return;
      }
    } catch {
      // ผ่านไป ทำต่อแบบตรวจ pivot แทน
    }

    // augmented [A | I]
    const aug = Array.from({ length: n }, (_, r) => [
      ...A[r],
      ...Array.from({ length: n }, (__ , c) => (r === c ? 1 : 0)),
    ]);

    // Gauss–Jordan เพื่อให้ซ้ายเป็น I และขวาเป็น A^{-1}
    for (let i = 0; i < n; i++) {
      // pivot
      let piv = i;
      for (let r = i + 1; r < n; r++) {
        if (Math.abs(aug[r][i]) > Math.abs(aug[piv][i])) piv = r;
      }
      if (Math.abs(aug[piv][i]) < EPS) {
        this.setState({ X: [], errorMsg: "เอกฐาน/เกือบเอกฐาน (pivot ~ 0)" });
        return;
      }
      if (piv !== i) [aug[i], aug[piv]] = [aug[piv], aug[i]];

      // normalize pivot row
      const pv = aug[i][i];
      for (let c = 0; c < 2 * n; c++) aug[i][c] /= pv;

      // eliminate others
      for (let r = 0; r < n; r++) {
        if (r === i) continue;
        const factor = aug[r][i];
        if (Math.abs(factor) < EPS) continue;
        for (let c = i; c < 2 * n; c++) {
          aug[r][c] -= factor * aug[i][c];
        }
      }
    }

    const invA = Array.from({ length: n }, (_, r) => aug[r].slice(n, 2 * n));

    // x = A^{-1} b
    const X = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) sum += invA[i][j] * b[j];
      X[i] = sum;
    }

    this.setState({ X, errorMsg: "" });
  };
}
