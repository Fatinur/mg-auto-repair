
import {
  FiShield,
  FiTool,
  FiMessageCircle,
  FiArrowUpRight,
} from "react-icons/fi";
import "./About.css";

const phoneNumber = "+17206886007";

const reasons = [
  {
    icon: FiShield,
    title: "Straightforward service",
    description:
      "Discuss your vehicle's symptoms and understand the service options available.",
  },
  {
    icon: FiTool,
    title: "Repair-focused approach",
    description:
      "From routine maintenance to diagnostics, get help addressing your vehicle's needs.",
  },
  {
    icon: FiMessageCircle,
    title: "Talk to the shop",
    description:
      "Call directly to explain the problem and ask about the next steps.",
  },
];

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-visual">
          <img
            src="/car.png.png"
            alt="Vehicle in an automotive workshop"
            loading="lazy"
          />

          <div className="about-visual-overlay" />

          <div className="about-visual-caption">
            <span className="about-caption-line" />
            <div>
              <span>YOUR LOCAL AUTO REPAIR SHOP</span>
              <strong>Denver, Colorado</strong>
            </div>
          </div>

          <span className="about-visual-index">M&amp;G / 01</span>
        </div>

        <div className="about-content">
          <p className="about-eyebrow">
            <span />
            WHY M&amp;G AUTO REPAIR
          </p>

          <h2>
            Good service starts with
            <span> the right conversation.</span>
          </h2>

          <p className="about-intro">
            Car trouble can be stressful. Start by telling us what your vehicle
            is doing, what warning lights you've noticed, or what service you
            need. We'll help you discuss the available next steps.
          </p>

          <div className="about-reasons">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;

              return (
                <article className="about-reason" key={reason.title}>
                  <div className="about-reason-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </div>

                  <div className="about-reason-copy">
                    <div className="about-reason-heading">
                      <h3>{reason.title}</h3>
                      <span>0{index + 1}</span>
                    </div>

                    <p>{reason.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <a className="about-cta" href={`tel:${phoneNumber}`}>
            <span>Talk to our team</span>
            <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
