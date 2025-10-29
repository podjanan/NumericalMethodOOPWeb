// index.js
import NumericalMethod from "./NumericalMethod";
import GraphicalMethod from "./GraphicalMethod";
import BisectionMethod from "./BisectionMethod";
import FalsePositionMethod from "./FalsePositionMethod";
import SecantMethod from "./SecantMethod";
import NewtonMethod from "./NewtonMethod";
import RootsSwitcher from "./MethodSwitcher";

export {
  NumericalMethod,
  GraphicalMethod,
  BisectionMethod,
  FalsePositionMethod,
  SecantMethod,
  NewtonMethod,
  RootsSwitcher,
};

const index_root = {
  NumericalMethod,
  GraphicalMethod,
  BisectionMethod,
  FalsePositionMethod,
  SecantMethod,
  NewtonMethod,
  RootsSwitcher,
};

export default index_root;
