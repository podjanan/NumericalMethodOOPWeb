import LinearMethodBase from "./LinearMethodBase";

export default class LUDecomposition extends LinearMethodBase {
  get methodName() {
    return "LU Decomposition Method";
  }

  luDecompose = (A) => {
    const n = A.length;
    const U = A.map((row) => row.slice());
    const L = Array.from({ length: n }, () => Array(n).fill(0));
    const P = Array.from({ length: n }, (_, i) => i);
    const EPS = this.EPS;

    for (let k = 0; k < n; k++) {
      let piv = k;
      for (let r = k + 1; r < n; r++) {
        if (Math.abs(U[r][k]) > Math.abs(U[piv][k])) piv = r;
      }
      if (Math.abs(U[piv][k]) < EPS) {
        throw new Error("Matrix is singular or nearly singular at column " + (k + 1));
      }
      if (piv !== k) {
        [U[piv], U[k]] = [U[k], U[piv]];
        for (let c = 0; c < k; c++) {
          [L[piv][c], L[k][c]] = [L[k][c], L[piv][c]];
        }
        [P[piv], P[k]] = [P[k], P[piv]];
      }
      for (let i = k + 1; i < n; i++) {
        L[i][k] = U[i][k] / U[k][k];
        for (let j = k; j < n; j++) {
          U[i][j] -= L[i][k] * U[k][j];
        }
      }
    }
    for (let i = 0; i < n; i++) L[i][i] = 1;
    return { L, U, P };
  };

  forwardSubstitution = (L, b) => {
    const n = L.length;
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
      y[i] = b[i] - sum; // diag(L)=1
    }
    return y;
  };

  backSubstitution = (U, y) => {
    const n = U.length;
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) sum += U[i][j] * x[j];
      const denom = U[i][i];
      if (Math.abs(denom) < this.EPS) throw new Error("Zero pivot on back substitution");
      x[i] = (y[i] - sum) / denom;
    }
    return x;
  };

  solve = () => {
    const A = this.readA();
    const b = this.readB();

    try {
      const { L, U, P } = this.luDecompose(A);
      const Pb = P.map((pi) => b[pi]);
      const y = this.forwardSubstitution(L, Pb);
      const X = this.backSubstitution(U, y);
      this.setState({ X, errorMsg: "" });
    } catch (err) {
      this.setState({ X: [], errorMsg: err.message || "คำนวณไม่สำเร็จ" });
    }
  };
}
