
import { FiArrowDownRight, FiPhone } from "react-icons/fi";
import "./Hero.css";

// TODO: Add the verified M&G Auto Repair phone number here.
const PHONE_NUMBER = "+17206886007";

export default function Hero() {
  const hasPhoneNumber = PHONE_NUMBER.trim().length > 0;

  return (
    <section
      className="hero-section relative isolate flex flex-col overflow-hidden"
      id="home"
    >
      <div className="hero-glow" aria-hidden="true" />

      <div className="hero-inner container mx-auto grid w-full flex-1 px-5 md:px-8">
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-image-glow" />
          <img
            className="hero-car-image"
            src="/car.png.png"
            alt=""
            fetchPriority="high"
          />
          <div className="hero-image-fade" />
        </div>

        <div className="hero-copy relative z-10">
          <p className="mb-4 flex items-center gap-3 text-[10px] font-extrabold tracking-[2.5px] text-zinc-300">
            <span className="h-0.5 w-6 bg-[#e32636]" />
            DENVER, COLORADO
          </p>

          <h1 className="text-[clamp(2.5rem,9vw,4.5rem)] font-black leading-[1.03] tracking-[-0.055em] text-white">
            Your Car Deserves
            <br />
            the <span className="text-[#e32636]">Right Care.</span>
          </h1>

          <p className="mt-5 max-w-[440px] text-sm leading-7 text-zinc-400 md:text-[15px]">
            From routine maintenance to complex repairs, get dependable
            automotive care at our shop or wherever you need us across Denver.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {hasPhoneNumber ? (
              <a
                className="hero-button hero-button-primary"
                href={`tel:${PHONE_NUMBER}`}
              >
                <FiPhone aria-hidden="true" />
                Call M&G Auto Repair
              </a>
            ) : (
              <a
                className="hero-button hero-button-primary"
                href="#contact"
              >
                <FiPhone aria-hidden="true" />
                Contact M&G Auto Repair
              </a>
            )}

            <a className="hero-button hero-button-secondary" href="#services">
              Explore Services
              <FiArrowDownRight aria-hidden="true" />
            </a>
          </div>

          <p className="mt-6 text-[9px] font-bold tracking-[1.5px] text-zinc-500">
            SHOP REPAIRS <span className="mx-2 text-[#e32636]">·</span>
            MOBILE MECHANIC SERVICE
          </p>
        </div>
      </div>

      <a
        className="hero-scroll hidden lg:flex"
        href="#services"
        aria-label="Explore services"
      >
        <span>EXPLORE SERVICES</span>
        <FiArrowDownRight aria-hidden="true" />
      </a>
    </section>
  );
}
