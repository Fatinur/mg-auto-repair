import visit from "/visit.jfif"
import come from "/come.jfif"
import {
  FiArrowUpRight,
  FiMapPin,
  FiTruck,
  FiCheck,
  FiPhone,
} from "react-icons/fi";
import "./ShopMobileService.css";

const phoneNumber = "+17206886007";

const serviceOptions = [
  {
    number: "01",
    title: "Visit our shop",
    subtitle: "IN-SHOP SERVICE",
    description:
      "Bring your vehicle in for diagnostics, maintenance, and repairs from our auto repair shop.",
    image: visit,
    icon: FiMapPin,
    features: [
      "Hands-on vehicle inspection",
      "Maintenance and repair services",
      "Discuss your vehicle's issues",
    ],
    action: "Call about shop service",
    href: `tel:${phoneNumber}`,
  },
  {
    number: "02",
    title: "We come to you",
    subtitle: "MOBILE MECHANIC",
    description:
      "Can't make it to the shop? Ask about mobile service for convenient help at your location.",
    image: come,
    icon: FiTruck,
    features: [
      "Convenient on-location service",
      "Ask about your repair needs",
      "Check mobile service availability",
    ],
    action: "Ask about mobile service",
    href: `tel:${phoneNumber}`,
  },
];

function ServiceOption({ option, featured }) {
  const Icon = option.icon;

  return (
    <article
      className={`service-option-card ${featured ? "service-option-featured" : ""}`}
    >
      <div className="service-option-image">
        <img src={option.image} alt="" loading="lazy" />
        <div className="service-option-image-shade" />

        <span className="service-option-number">{option.number}</span>

        <div className="service-option-icon">
          <Icon size={22} strokeWidth={1.8} />
        </div>

        <span className="service-option-label">{option.subtitle}</span>
      </div>

      <div className="service-option-body">
        <h3>{option.title}</h3>

        <p className="service-option-description">{option.description}</p>

        <ul className="service-option-features">
          {option.features.map((feature) => (
            <li key={feature}>
              <FiCheck aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <a className="service-option-cta" href={option.href}>
          <span>{option.action}</span>
          <FiArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export default function ShopMobileService() {
  return (
    <section
      id="service-options"
      className="service-options-section"
      aria-labelledby="service-options-heading"
    >
      <div className="service-options-glow" />

      <div className="service-options-container">
        <div className="service-options-heading">
          <p className="service-options-eyebrow">
            <span />
            REPAIR YOUR WAY
          </p>

          <h2 id="service-options-heading">
            Your car. Your schedule.
            <span> Your choice.</span>
          </h2>

          <p className="service-options-intro">
            Whether you come to us or need help at your location, let's find
            the right service for your vehicle.
          </p>
        </div>

        <div className="service-options-grid">
          {serviceOptions.map((option, index) => (
            <ServiceOption
              key={option.number}
              option={option}
              featured={index === 0}
            />
          ))}
        </div>

        <div className="service-options-bottom">
          <div className="service-options-bottom-copy">
            <span className="service-options-bottom-icon">
              <FiPhone aria-hidden="true" />
            </span>

            <p>
              <strong>Not sure which option you need?</strong>
              <span>Tell us what's going on with your vehicle.</span>
            </p>
          </div>

          <a href={`tel:${phoneNumber}`} className="service-options-call">
            Call M&amp;G <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
