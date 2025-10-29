import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Nav from './components/Nav'
import Footer from './components/footer'
import Main from './page/Main'

import Roots from "./page/roots"; 
import Linears from "./page/linear";
import Interpolation from "./page/Interpolation";
import Extrapolation from './page/Extrapolation';



import 'katex/dist/katex.min.css';


const router = createBrowserRouter([
  {path: "/",element: <Main/>},

  {path: "/RootsofEquation",element: <Roots.RootsSwitcher/>},
  {path: "/Linears",element: <Linears.LinearSwitcher/>},
  {path: "/Interpolation",element: <Interpolation.InterpSwitcher/>},
  {path: "/Extrapolation",element: <Extrapolation.RegressionSwitcher/>},
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
