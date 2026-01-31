import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logoutUser } from "../redux/slices/authSlice";
import logo from "../assets/FORNIX Final Logo_transparent.png";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsCoursesOpen(false);
  };

  const courses = [
    { to: '/courses/amc', label: 'AMC' },
    { to: '/courses/neet-ug', label: 'NEET UG' },
    { to: '/courses/neet-pg', label: 'NEET PG' },
    { to: '/courses/FMGE', label: 'FMGE' },
    { to: '/courses/PLAB1', label: 'PLAB1' },
  ];

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-full px-8 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Fornix Logo" className="w-20 h-20 rounded-full object-cover" />
            <span className="text-2xl font-bold text-gray-800">FORNIX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex bg-orange-500 rounded-full px-8 py-3 shadow-lg shadow-orange-500/20">
            <ul className="flex gap-8 text-white font-medium items-center">
              <li>
                <Link to="/" className="relative group py-2">
                  Home
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="relative group py-2">
                  About
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>

              {/* COURSES DROPDOWN */}
              <li className="relative group py-2">
                <span className="cursor-pointer hover:text-orange-100 transition-colors flex items-center gap-1">
                  Courses <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
                </span>

                <div className="absolute top-full left-0 mt-4 bg-white text-gray-800 rounded-xl shadow-xl w-56 py-3 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0
                    transition-all duration-300 z-50 border border-gray-100">
                  {courses.map((course) => (
                    <Link
                      key={course.to}
                      to={course.to}
                      className="block px-6 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium text-sm"
                    >
                      {course.label}
                    </Link>
                  ))}
                </div>
              </li>

              {/* <li>
                <Link to="/pricingPage" className="relative group py-2">
                  Pricing Plan
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li> */}

              <li>
                <Link to="/contact" className="relative group py-2">
                  Contact
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Desktop Login/Profile Section */}
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/smart-tracking"
                className="text-slate-600 font-semibold hover:text-slate-800 transition-colors relative group mr-2"
              >
                Smart Tracking
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <div className="relative group">
                <button
                  className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-full transition-all duration-300 border border-orange-200"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-gray-700 font-semibold text-sm max-w-[100px] truncate">
                    {user.name || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email || user.identifier || ''}</p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      Dashboard
                    </Link>

                  </div>

                  <div className="border-t border-gray-100 pt-2 pb-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:block bg-orange-500 text-white px-8 py-2.5 rounded-full hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg shadow-orange-200 font-medium tracking-wide"
            >
              Login
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden bg-orange-500 p-2 rounded-full hover:bg-orange-600 transition"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
              ></span>
              <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
              ></span>
              <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
              ></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Sidebar Header */}
        <div className="bg-orange-500 p-6 flex items-center justify-between">
          <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-3">
            <img src={logo} alt="Fornix Logo" className="w-20 h-20 rounded-full object-cover border-2 border-white" />
            <h3 className="text-white font-bold text-3xl">Fornix</h3>
          </Link>
          <button
            onClick={closeMobileMenu}
            className="text-white hover:text-gray-200 transition"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-6 overflow-y-auto h-[calc(100%-180px)]">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="block text-gray-800 font-semibold text-lg hover:text-orange-500 hover:bg-orange-50 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="block text-gray-800 font-semibold text-lg hover:text-orange-500 hover:bg-orange-50 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95"
              >
                About
              </Link>
            </li>

            {/* Mobile Courses Accordion */}
            <li>
              <button
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                className="w-full text-left text-gray-800 font-semibold text-lg hover:text-orange-500 hover:bg-orange-50 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-between"
              >
                <span>Courses</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isCoursesOpen ? 'rotate-180 text-orange-500' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCoursesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="ml-4 mt-2 space-y-1 border-l-2 border-orange-100 pl-2">
                  {courses.map((course) => (
                    <li key={course.to}>
                      <Link
                        to={course.to}
                        onClick={closeMobileMenu}
                        className="block text-gray-600 hover:text-orange-500 hover:bg-orange-50 px-4 py-2.5 rounded-lg transition-all duration-200 hover:translate-x-1"
                      >
                        {course.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li>
              <Link
                to="/pricingPage"
                onClick={closeMobileMenu}
                className="block text-gray-800 font-semibold text-lg hover:text-orange-500 hover:bg-orange-50 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95"
              >
                Pricing Plan
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="block text-gray-800 font-semibold text-lg hover:text-orange-500 hover:bg-orange-50 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer - Login/Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50">
          {user ? (
            <div className="space-y-3">
              <Link
                to="/smart-tracking"
                onClick={closeMobileMenu}
                className="block w-full text-center bg-slate-800 text-white px-6 py-3 rounded-full hover:bg-slate-700 transition-all duration-300 shadow-lg active:scale-95 font-bold"
              >
                Smart Tracking
              </Link>
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="block w-full text-center bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-200 active:scale-95 font-bold"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-white text-red-500 border-2 border-red-100 px-6 py-3 rounded-full hover:bg-red-50 hover:border-red-200 transition-all duration-300 active:scale-95 font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="block w-full text-center bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-200 active:scale-95 font-bold"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
export default Header;
