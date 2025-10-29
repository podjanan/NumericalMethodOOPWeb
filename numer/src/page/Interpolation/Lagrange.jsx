// LagrangeEngine.jsx
import BaseInterpolation from "./BaseInterpolation.jsx";

export default class LagrangeEngine extends BaseInterpolation {
  solve(points, X) {
    const parsed = this.validatePoints(points, X);
    this.ensureDistinctX(parsed);

    const Xnum = Number(X);
    // ถ้า X ตรงกับจุดข้อมูล ให้คืนค่า y ทันที
    for (const p of parsed) {
      if (p.x === Xnum) {
        return { result: p.y, artifacts: { hitPoint: p } };
      }
    }

    let sum = 0;
    const n = parsed.length;
    for (let i = 0; i < n; i++) {
      let Li = 1;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          Li *= (Xnum - parsed[j].x) / (parsed[i].x - parsed[j].x);
        }
      }
      sum += parsed[i].y * Li;
    }

    return { result: sum, artifacts: null };
  }
}
