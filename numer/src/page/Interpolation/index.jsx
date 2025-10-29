// index.jsx (barrel)
import BaseInterpolation from "./BaseInterpolation.jsx";
import LagrangeEngine from "./Lagrange.jsx";
import NewtonDividedEngine from "./NewtonDivided.jsx";
import SplineEngine from "./Spline.jsx";
import InterpSwitcher from "./InterpSwitcher.jsx"

export {
  BaseInterpolation,
  LagrangeEngine,
  NewtonDividedEngine,
  SplineEngine,
  InterpSwitcher
};

// ให้ default เป็น object รวม (optional)
const index_interpolation = {
  BaseInterpolation,
  LagrangeEngine,
  NewtonDividedEngine,
  SplineEngine,
  InterpSwitcher
};
export default index_interpolation;
