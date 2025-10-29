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
            <a href="/" className="block px-4 py-2 hover:bg-white/10 text-white">จัดการข้อมูลสมการ</a>
          </li>
          <li className="relative group">
            <a href="/RootsofEquation" className="block px-4 py-2 hover:bg-white/10 text-white">Roots of Equation</a>
          </li>
          {/* Linear System (hover) */}
          <li className="relative group">
            <a href="/Linears" className="block px-4 py-2 hover:bg-white/10 text-white">Linear System</a>
          </li>
          <li className="relative group">
            <a href="/Interpolation" className="block px-4 py-2 hover:bg-white/10 text-white">Interpolation</a>
          </li>
          <li className="relative group">
            <a href="/Extrapolation" className="block px-4 py-2 hover:bg-white/10 text-white">Extrapolation</a>
          </li>
        </ul>
      </div>

      {/* Mobile menu (click dropdown) */}
      {isMenuOpen && (
        <ul className="md:hidden p-4 space-y-3">
          <li>
            <a href="/" className="block text-white hover:text-[#4F2F2F]">
              จัดการข้อมูลสมการ
            </a>
          </li>
          <li>
            <a href="/RootsofEquation" className="block text-white hover:text-[#4F2F2F]">
              Roots of Equation
            </a>
          </li>
          <li>
            <a href="/Linears" className="block text-white hover:text-[#4F2F2F]">
              Linear System
            </a>
          </li>
          <li>
            <a href="/Interpolation" className="block text-white hover:text-[#4F2F2F]">
              Interpolation
            </a>
          </li>
          <li>
            <a href="/Extrapolation" className="block text-white hover:text-[#4F2F2F]">
              Extrapolation
            </a>
          </li>
        </ul>
      )}

    </nav>
  );
}

export default Nav;
