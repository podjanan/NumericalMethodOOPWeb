import { det } from "mathjs";
import LinearMethodBase from "./LinearMethodBase";

export default class CramersRule extends LinearMethodBase {
  get methodName() {
    return "Cramer's Rule";
  }

  solve = () => {
    const n = this.state.n;
    const An = this.readA();
    const Bn = this.readB();

    try {
      const detA = det(An);
      if (!Number.isFinite(detA) || Math.abs(detA) < this.EPS) {
        this.setState({ X: [], errorMsg: "det(A) = 0 ⇒ ไม่มีคำตอบเอกฐาน" });
        return;
      }
      const X = [];
      for (let i = 0; i < n; i++) {
        const Ai = An.map((row, r) => row.map((val, c) => (c === i ? Bn[r] : val)));
        const detAi = det(Ai);
        X.push(detAi / detA);
      }
      this.setState({ X, errorMsg: "" });
    } catch (e) {
      this.setState({ X: [], errorMsg: "คำนวณ det ไม่สำเร็จ" });
    }
  };
}
