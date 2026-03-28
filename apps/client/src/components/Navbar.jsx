import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/jayesafari.png";
import {
  Phone, Mail, 
  Menu, X, LogIn, LayoutDashboard,
} from "lucide-react";
import {FaFacebook,FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6"
import {
  SignInButton, SignedIn, SignedOut, UserButton, useUser,
} from "@clerk/clerk-react";
import { useBackendRole } from "../hooks/useBackendRole";


const AdminUserButton = ({ isAdmin, afterSignOutUrl = "/" }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-1.5">
      <UserButton
        afterSignOutUrl={afterSignOutUrl}
        appearance={{
          elements: {
            avatarBox: "w-9 h-9 ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900",
          },
        }}
      />
      {isAdmin ? (
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="nav-body flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-[10px] font-bold transition-all shadow-md whitespace-nowrap"
        >
          <LayoutDashboard size={10} /> Admin
        </button>
      ) : (
        <button
          onClick={() => navigate("/dashboard")}
          className="nav-body flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white text-[10px] font-semibold transition-all whitespace-nowrap"
        >
          My Trips
        </button>
      )}
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const { isSignedIn }                = useUser();
  const { isAdmin, isLoading }        = useBackendRole();
  const navigate                      = useNavigate();
  const { pathname }                  = useLocation();

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  // Darken nav on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isSignedIn && !isLoading && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isSignedIn, isLoading, isAdmin, navigate]);

  const navItems = [
    { name: "Home",     path: "/" },
    { name: "Kenya",    path: "/kenya" },
    { name: "Tanzania", path: "/tanzania" },
    { name: "Zanzibar", path: "/zanzibar" },
    { name: "Uganda",   path: "/uganda" },
    { name: "About",    path: "/about-us" },
    { name: "Contact",  path: "/contact" },
  ];

  return (
    <>
      <style>{`
        .nav-title { font-family: 'Cormorant Garamond', serif; }
        .nav-body  { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="w-full fixed top-0 left-0 z-50">

        {/* ── Top bar ── */}
        <div className="bg-stone-900/95 border-b border-stone-800 text-stone-400 text-xs py-2 px-4 nav-body">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-5">
              <a
                href="tel:+254 792 591 816"
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              >
                <Phone size={13} />
                <span>+254 792 591 816</span>
              </a>
              <a
                href="mailto:jayesafaris@gmail.com"
                className="hidden sm:flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              >
                <Mail size={13} />
                <span>jayesafaris@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-3">
              {[
                { href: "https://www.facebook.com/profile.php?id=61588392027859",  Icon: FaFacebook },
                { href: "https://www.instagram.com/jayesafarislimited?igsh=MWdrOG94aHozNWx1NA==", Icon: FaInstagram },
                { href: "https://www.tiktok.com/@jayesafarislimited",   Icon: FaTiktok },
                { href: "https://twitter.com",   Icon: FaXTwitter },
              ].map(({ href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main nav ── */}
        <nav
          className={`transition-all duration-300 ${
            scrolled
              ? "bg-stone-900/95 shadow-xl shadow-black/30 backdrop-blur-md"
              : "bg-stone-900/90 backdrop-blur-sm"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">

              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <img
                  src={logo}
                  alt="Jaye Safaris"
                  className="h-16 w-16 object-contain"
                />
                <div className="hidden sm:block">
                  <div className="nav-title text-white font-light text-lg tracking-wide leading-tight">
                    JAYE<span className="text-amber-400">SAFARIS</span>
                  </div>
                  <div className="nav-body text-[10px] text-stone-500 tracking-wider uppercase">
                    Book with Confidence
                  </div>
                </div>
              </Link>

              {/* ── Desktop links ── */}
              <div className="hidden lg:flex items-center gap-1 nav-body">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
                      isActive(item.path)
                        ? "text-amber-400 bg-white/8"
                        : "text-stone-300 hover:text-amber-400 hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                    {isActive(item.path) && (
                      <span className="block h-0.5 w-full bg-amber-400 rounded-full mt-0.5 -mb-0.5" />
                    )}
                  </Link>
                ))}

                {/* Divider */}
                <div className="w-px h-5 bg-stone-700 mx-2" />

                {/* Plan My Safari CTA */}
                <SignedIn>
                  <Link to="/inquiry-form">
                    <button className="nav-body inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-900/30 whitespace-nowrap">
                      Plan My Safari →
                    </button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal" redirectUrl="/inquiry-form">
                    <button className="nav-body inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-900/30 whitespace-nowrap">
                      Plan My Safari →
                    </button>
                  </SignInButton>
                </SignedOut>

                {/* Auth */}
                <div className="ml-2 flex items-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="nav-body flex items-center gap-2 border border-stone-700 hover:border-amber-400/60 text-stone-400 hover:text-amber-400 px-4 py-2 rounded-xl text-sm font-medium transition-all">
                        <LogIn size={14} /> Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <AdminUserButton isAdmin={isAdmin} afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden text-stone-300 hover:text-amber-400 transition-colors p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Mobile menu ── */}
        <div
          className={`lg:hidden bg-stone-900/95 backdrop-blur-md border-t border-stone-800 transition-all duration-300 overflow-hidden ${
            mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-4 space-y-1 nav-body">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 font-medium rounded-xl transition-colors text-sm ${
                  isActive(item.path)
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-stone-300 hover:text-amber-400 hover:bg-white/5"
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            ))}
          </div>

          <div className="px-6 pb-6 space-y-3 nav-body border-t border-stone-800 pt-4">
            {/* Plan My Safari */}
            <SignedIn>
              <Link to="/inquiry-form" onClick={() => setMobileOpen(false)}>
                <button className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold text-sm transition-all">
                  Plan My Safari →
                </button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" redirectUrl="/inquiry-form">
                <button
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-bold text-sm transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Plan My Safari →
                </button>
              </SignInButton>
            </SignedOut>

            {/* Sign in / user */}
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="w-full flex items-center justify-center gap-2 border border-stone-700 hover:border-amber-400/60 text-stone-400 hover:text-amber-400 py-3 rounded-xl font-medium text-sm transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn size={15} /> Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3 pt-1">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-amber-400" } }}
                />
                <div className="flex flex-col gap-1">
                  <span className="text-stone-400 text-xs">Manage account</span>
                  {isAdmin ? (
                    <button
                      onClick={() => { navigate("/admin/dashboard"); setMobileOpen(false); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition-all w-fit"
                    >
                      <LayoutDashboard size={11} /> Admin Dashboard
                    </button>
                  ) : (
                    <button
                      onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white text-xs font-semibold transition-all w-fit"
                    >
                      <LayoutDashboard size={11} /> My Dashboard
                    </button>
                  )}
                </div>
              </div>
            </SignedIn>
          </div>
        </div>

      </div>
    </>
  );
};

export default Navbar;