import React, { Component } from "react";

export default class RegressionBase extends Component {
  // ---------- Utilities (ให้ลูกใช้ร่วมกัน) ----------
  toNum = (v) => (v === "" || v === null ? NaN : Number(v));

  fmt = (v, dec = 6) =>
    Number.isFinite(v) ? v.toFixed(dec) : "—";

  transpose = (A) => {
    const r = A.length, c = A[0].length;
    const T = Array.from({ length: c }, () => Array(r).fill(0));
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) T[j][i] = A[i][j];
    return T;
  };

  matmul = (A, B) => {
    const r = A.length;
    const c = B[0].length;
    const klen = B.length;
    const C = Array.from({ length: r }, () => Array(c).fill(0));
    for (let i = 0; i < r; i++) {
      for (let k = 0; k < klen; k++) {
        const aik = A[i][k];
        for (let j = 0; j < c; j++) C[i][j] += aik * B[k][j];
      }
    }
    return C;
  };

  solveLinear = (Ain, bin) => {
    const n = bin.length;
    const A = Ain.map((row) => row.slice());
    const b = bin.slice();

    for (let col = 0; col < n; col++) {
      // partial pivot
      let piv = col;
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
      }
      if (Math.abs(A[piv][col]) < 1e-12) throw new Error("Matrix is singular");
      if (piv !== col) {
        [A[piv], A[col]] = [A[col], A[piv]];
        [b[piv], b[col]] = [b[col], b[piv]];
      }
      const div = A[col][col];
      for (let j = col; j < n; j++) A[col][j] /= div;
      b[col] /= div;

      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = A[r][col];
        for (let j = col; j < n; j++) A[r][j] -= factor * A[col][j];
        b[r] -= factor * b[col];
      }
    }
    return b; // solution vector
  };

  rSquared = (yTrue, yPred) => {
    const n = yTrue.length;
    const mean = yTrue.reduce((a, b) => a + b, 0) / n;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
      ssTot += (yTrue[i] - mean) ** 2;
      ssRes += (yTrue[i] - yPred[i]) ** 2;
    }
    return 1 - ssRes / (ssTot || 1);
  };

  // ให้ลูก override
  get methodName() { return "Regression"; }
  render() { return <div>Override me</div>; }
}
