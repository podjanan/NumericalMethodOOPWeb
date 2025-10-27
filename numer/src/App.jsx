import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Nav from './components/Nav'
import Footer from './components/footer'
import Main from './page/Main'
import Bisection from './page/roots/Bisection';
import Graphical from './page/roots/Graphical';
import Secant from './page/roots/Secant';
import Falsepos from './page/roots/False-pos';
import Newton from './page/roots/NewtonRaphson';
import Onepoint from './page/roots/Onepoint';

import Cramer from './page/linear/cramer';
import Elimination from './page/linear/Elimination';
import Jordan from './page/linear/Jordan';
import Inversion from './page/linear/Inversion';
import LU from './page/linear/LU';
import ConjugateGradient from './page/linear/Conjugate';
import Jacobi from './page/linear/Jacobi';
import Seidel from './page/linear/Seidel';

import SimpleRegressionPlotly from './page/Extrapolation/SimpleRegression';
import MultiRegression from './page/Extrapolation/MultiRegression';

import NewtonDevide from './page/Interpolation/NewtonDevide';
import LagrangeInterpolation from './page/Interpolation/Lagrange';
import Spline from './page/Interpolation/Spline';

import Trapezoidal from './page/IntegrationDifferentiation/Trapezoidal';
import Simpson from './page/IntegrationDifferentiation/Simpson';
import Diff from './page/IntegrationDifferentiation/Diff';


import 'katex/dist/katex.min.css';


const router = createBrowserRouter([
  {path: "/",element: <Main/>},
  {path: "RootsofEquation/Bisection",element: <Bisection/>},
  {path: "RootsofEquation/Graphical",element: <Graphical/>},
  {path: "RootsofEquation/Secant",element: <Secant/>},
  {path: "RootsofEquation/false",element: <Falsepos/>},
  {path: "RootsofEquation/Newton",element: <Newton/>},
  {path: "RootsofEquation/Onepoint",element: <Onepoint/>},

  {path: "/linear/cramer",element: <Cramer/>},
  {path: "/linear/Elimination",element: <Elimination/>},
  {path: "/linear/Jordan",element: <Jordan/>},
  {path: "/linear/Inversion",element: <Inversion/>},
  {path: "/linear/lu",element: <LU/>},
  {path: "/linear/ConjugateGradient",element: <ConjugateGradient/>},
  {path: "/linear/jacobi",element: <Jacobi/>},
  {path: "/linear/gauss-seidel",element: <Seidel/>},

  {path: "/Interpolation/Newton",element: <NewtonDevide/>},
  {path: "/Interpolation/Lagrange",element: <LagrangeInterpolation/>},
  {path: "/Interpolation/Spline",element: <Spline/>},

  {path: "/Extrapolation/SimpleRegression",element: <SimpleRegressionPlotly/>},
  {path: "/Extrapolation/MultiRegression",element: <MultiRegression/>},

  {path: "Integration/Trapezoidal",element: <Trapezoidal/>},
  {path: "Integration/Simpson",element: <Simpson/>},
  {path: "Differentiation",element: <Diff/>}
]);

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <div className="flex-grow">
        <RouterProvider router={router} />
      </div>
      <Footer />
    </div>
  )
}

export default App
