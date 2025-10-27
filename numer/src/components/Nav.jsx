import { useState } from "react";

function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobile, setOpenMobile] = useState(null); // เก็บ dropdown ที่เปิดบนมือถือ

  const toggleMenu = () => setIsMenuOpen(v => !v);
  const toggleMobile = (key) =>
    setOpenMobile(curr => (curr === key ? null : key));

  const link = "text-white hover:text-[#4F2F2F] p-2";

  return (
    <nav className="bg-[#000033] p-4 font-bold">
      <div className="flex items-center justify-between">
        <a href="/" className="text-white text-2xl">NUMERICAL METHOD</a>

        {/* burger (mobile) */}
        <button
          id="menu-toggle"
          className="md:hidden text-white"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" className="w-6 h-6">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop menu (hover dropdown) */}
        <ul className="hidden md:flex space-x-4 items-center">
            <li className="relative group">
            <button className={`${link} inline-flex items-center gap-1`} aria-haspopup="menu">
              Roots of Equation
              <span className="transition-transform group-hover:rotate-180">▾</span>
            </button>
            <div
              className="absolute top-8 left-0 w-60 rounded-lg shadow-lg bg-[#000033] ring-1 ring-black/10 hidden group-hover:block z-50"
              role="menu"
            >
              <a href="/RootsofEquation/Graphical" className="block px-4 py-2 hover:bg-white/10 text-white">Graphical Method</a>
              <a href="/RootsofEquation/Bisection" className="block px-4 py-2 hover:bg-white/10 text-white">Bisection Method</a>
              <a href="/RootsofEquation/false" className="block px-4 py-2 hover:bg-white/10 text-white">False Position Method</a>
              <a href="/RootsofEquation/Onepoint" className="block px-4 py-2 hover:bg-white/10 text-white">One Point Iteration Method</a>
              <a href="/RootsofEquation/Newton" className="block px-4 py-2 hover:bg-white/10 text-white">Newton Raphson Method</a>
              <a href="/RootsofEquation/Secant" className="block px-4 py-2 hover:bg-white/10 text-white">Secant Method</a>
            </div>
          </li>
          {/* Linear System (hover) */}
          <li className="relative group">
            <button className={`${link} inline-flex items-center gap-1`} aria-haspopup="menu">
              Linear System
              <span className="transition-transform group-hover:rotate-180">▾</span>
            </button>
            <div
              className="absolute top-8 left-0 w-60 rounded-lg shadow-lg bg-[#000033] ring-1 ring-black/10 hidden group-hover:block z-50"
              role="menu"
            >
              <a href="/linear/cramer" className="block px-4 py-2 hover:bg-white/10 text-white">Cramer's Rule</a>
              <a href="/linear/Elimination" className="block px-4 py-2 hover:bg-white/10 text-white">Gaussian Elimination</a>
              <a href="/linear/jordan" className="block px-4 py-2 hover:bg-white/10 text-white">Guass Jordan elimination</a>
              <a href="/linear/Inversion" className="block px-4 py-2 hover:bg-white/10 text-white">Matrix Inversion</a>
              <a href="/linear/lu" className="block px-4 py-2 hover:bg-white/10 text-white">LU Decomposition</a>
              <a href="/linear/jacobi" className="block px-4 py-2 hover:bg-white/10 text-white">Jacobi Iteration</a>
              <a href="/linear/gauss-seidel" className="block px-4 py-2 hover:bg-white/10 text-white">Gauss-Seidel</a>
              <a href="/linear/ConjugateGradient" className="block px-4 py-2 hover:bg-white/10 text-white">Conjugate Gradient Methods</a>
            </div>
          </li>
          <li className="relative group">
            <button className={`${link} inline-flex items-center gap-1`} aria-haspopup="menu">
              Interpolation
              <span className="transition-transform group-hover:rotate-180">▾</span>
            </button>
            <div
              className="absolute top-8 left-0 w-60 rounded-lg shadow-lg bg-[#000033] ring-1 ring-black/10 hidden group-hover:block z-50"
              role="menu"
            >
              <a href="/Interpolation/Newton" className="block px-4 py-2 hover:bg-white/10 text-white">Newton divided-differences</a>
              <a href="/Interpolation/Lagrange" className="block px-4 py-2 hover:bg-white/10 text-white">Lagrange interpolation</a>
              <a href="/Interpolation/Spline" className="block px-4 py-2 hover:bg-white/10 text-white">Spline interpolation</a>
            </div>
          </li>
          <li className="relative group">
            <button className={`${link} inline-flex items-center gap-1`} aria-haspopup="menu">
              Extrapolation
              <span className="transition-transform group-hover:rotate-180">▾</span>
            </button>
            <div
              className="absolute top-8 left-0 w-60 rounded-lg shadow-lg bg-[#000033] ring-1 ring-black/10 hidden group-hover:block z-50"
              role="menu"
            >
              <a href="/Extrapolation/SimpleRegression" className="block px-4 py-2 hover:bg-white/10 text-white">Simple Regression</a>
              <a href="/Extrapolation/MultiRegression" className="block px-4 py-2 hover:bg-white/10 text-white">Multiple Regression</a>
            </div>
          </li>
          {/* Integration & Differentiation (hover) */}
          <li className="relative group">
            <button className={`${link} inline-flex items-center gap-1`} aria-haspopup="menu">
              Integration &amp; Differentiation
              <span className="transition-transform group-hover:rotate-180">▾</span>
            </button>
            <div
              className="absolute left-0 top-8 w-60 rounded-lg shadow-lg bg-[#000033] ring-1 ring-black/10 hidden group-hover:block z-50"
              role="menu"
            >
              <a href="/Integration/trapezoidal" className="block px-4 py-2 hover:bg-white/10 text-white">Trapezoidal Rule</a>
              <a href="/Integration/Simpson" className="block px-4 py-2 hover:bg-white/10 text-white">Simpson’s Rule</a>
              <a href="/Differentiation" className="block px-4 py-2 hover:bg-white/10 text-white">Differentiation</a>
            </div>
          </li>
        </ul>
      </div>

      {/* Mobile menu (click dropdown) */}
      {isMenuOpen && (
        <ul className="md:hidden p-4 space-y-3">
          <li><a href="/RootsofEquation" className="block text-white hover:text-[#4F2F2F]">Roots of Equation</a></li>

          {/* Linear System (click) */}
          <li>
            <button
              className="w-full flex items-center justify-between text-white"
              onClick={() => toggleMobile("linear")}
              aria-expanded={openMobile === "linear"}
            >
              <span>Linear System</span>
              <span className={`transition-transform ${openMobile === "linear" ? "rotate-180" : ""}`}>▾</span>
            </button>
            {openMobile === "linear" && (
              <div className="ml-3 mt-1 space-y-1">
                <a href="/linear/gaussian" className="block text-white/90 hover:text-white">Gaussian Elimination</a>
                <a href="/linear/lu" className="block text-white/90 hover:text-white">LU Decomposition</a>
                <a href="/linear/jacobi" className="block text-white/90 hover:text-white">Jacobi Iteration</a>
                <a href="/linear/gauss-seidel" className="block text-white/90 hover:text-white">Gauss–Seidel</a>
              </div>
            )}
          </li>

          <li><a href="/interp" className="block text-white hover:text-[#4F2F2F]">Interpolation &amp; Extrapolation</a></li>
          <li><a href="/regression" className="block text-white hover:text-[#4F2F2F]">Least Squares Regression</a></li>

          {/* Integration & Differentiation (click) */}
          <li>
            <button
              className="w-full flex items-center justify-between text-white"
              onClick={() => toggleMobile("calc")}
              aria-expanded={openMobile === "calc"}
            >
              <span>Integration &amp; Differentiation</span>
              <span className={`transition-transform ${openMobile === "calc" ? "rotate-180" : ""}`}>▾</span>
            </button>
            {openMobile === "calc" && (
              <div className="ml-3 mt-1 space-y-1">
                <a href="/calc/trapezoidal" className="block text-white/90 hover:text-white">Trapezoidal Rule</a>
                <a href="/calc/simpson" className="block text-white/90 hover:text-white">Simpson’s Rule</a>
                <a href="/calc/romberg" className="block text-white/90 hover:text-white">Romberg Integration</a>
                <a href="/calc/diff" className="block text-white/90 hover:text-white">Numerical Differentiation</a>
              </div>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}

export default Nav;
