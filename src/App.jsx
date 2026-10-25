import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import ShopMobileService from "./components/ShopMobileService";
import About from "./components/About";
import RepairRequestForm from "./components/RepairRequestForm";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

import "./App.css";

function PublicSite() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-scroll-area">
        <Hero />
        <Services />
        <ShopMobileService />
        <RepairRequestForm />
        <About />
      </main>

      <footer className="border-t border-white/10 bg-[#08090b] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-white">M&G</span> Auto Repair
          </p>

          <p>Denver, Colorado</p>

          <a
            href="tel:+17206886007"
            className="transition-colors hover:text-[#e32636]"
          >
            +1 (720) 688-6007
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}