// BaseInterpolation.jsx
export default class BaseInterpolation {
  // ตรวจความถูกต้อง input (อย่างน้อย 2 จุด)
  validatePoints(points, X) {
    if (!Array.isArray(points) || points.length < 2) {
      throw new Error("ต้องมีอย่างน้อย 2 จุดข้อมูล");
    }
    // แปลง และเช็คตัวเลข
    const parsed = points.map(({ x, y }) => ({
      x: Number(x),
      y: Number(y),
    }));
    if (
      parsed.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y)) ||
      !Number.isFinite(Number(X))
    ) {
      throw new Error("กรอก xᵢ, f(xᵢ) และ X ให้ครบและเป็นตัวเลข");
    }
    return parsed;
  }

  // ห้าม x ซ้ำ
  ensureDistinctX(points) {
    const seen = new Set();
    for (const p of points) {
      if (seen.has(p.x)) {
        throw new Error("พบค่า xᵢ ซ้ำกัน");
      }
      seen.add(p.x);
    }
  }

  // เรียงตาม x (บางวิธีต้องการ)
  sortByX(points) {
    return [...points].sort((a, b) => a.x - b.x);
  }

  // interface
  solve(points, X) {
    throw new Error("solve(points, X) ต้องถูก override");
  }
}
