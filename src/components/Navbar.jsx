
import { useState } from "react";
import { FiMenu, FiX, FiPhone } from "react-icons/fi";
import "./Navbar.css";

const links = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header relative z-50">
      <nav
        className="container mx-auto flex h-[76px] items-center justify-between px-5 md:px-8 lg:h-[84px]"
        aria-label="Main navigation"
      >
        <a
          href="#home"
          className="brand flex items-center gap-3"
          onClick={closeMenu}
          aria-label="M&G Auto Repair home"
        >
          <span className="brand-mark">M&G</span>

          <span className="flex flex-col gap-1">
            <span className="text-xs font-black tracking-[1.5px] text-white">
              AUTO
            </span>
            <span className="text-[9px] font-bold tracking-[3px] text-zinc-400">
              REPAIR
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-9 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              className="nav-link text-sm text-zinc-300 transition-colors hover:text-white"
              href={link.href}
            >
              {link.label}
            </a>
          ))}

          <a className="nav-contact" href="#contact">
            <FiPhone aria-hidden="true" />
            <span>Contact Us</span>
          </a>
        </div>

        <button
          type="button"
          className="menu-toggle grid size-11 place-items-center rounded-lg lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      <div
        id="mobile-navigation"
        className={`mobile-menu lg:hidden ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="mobile-menu-inner">
          <p className="mobile-menu-label">NAVIGATION</p>

          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-menu-link"
              style={{ "--link-index": index }}
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
            >
              <span>{link.label}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}

          <a
            href="#contact"
            className="mobile-menu-contact"
            style={{ "--link-index": links.length }}
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
          >
            <FiPhone aria-hidden="true" />
            Request a Repair
          </a>
        </div>
      </div>
    </header>
  );
}
