import engine from "/engine.jfif";
import brake from "/brake.jfif";
import transmission from "/transmission.jfif";
import diagnostics from "/diagnostics.jfif";
import mobile from "/mobile.jfif";
import oil from "/oil.jfif";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiSettings,
  FiDisc,
  FiDroplet,
  FiTool,
  FiActivity,
  FiTruck,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./Services.css";

const services = [
  {
    icon: FiSettings,
    title: "Engine Repair",
    description:
      "Engine diagnostics and repair to help identify problems and get your vehicle running properly.",
    number: "01",
    image: engine,
  },
  {
    icon: FiDisc,
    title: "Brake Service",
    description:
      "Brake inspections and repairs to help keep your vehicle safe and responsive on the road.",
    number: "02",
    image: brake,
  },
  {
    icon: FiDroplet,
    title: "Oil Changes",
    description:
      "Routine oil and filter changes to support engine health and everyday performance.",
    number: "03",
    image: oil,
  },
  {
    icon: FiTool,
    title: "Transmission Repair",
    description:
      "Help diagnosing and addressing transmission issues, shifting problems, and related concerns.",
    number: "04",
    image: transmission,
  },
  {
    icon: FiActivity,
    title: "Diagnostics",
    description:
      "Vehicle diagnostics to help pinpoint warning lights, unusual behavior, and mechanical issues.",
    number: "05",
    image: diagnostics,
  },
  {
    icon: FiTruck,
    title: "Mobile Mechanic",
    description:
      "Convenient mobile mechanic service when bringing your vehicle to a shop isn't practical.",
    number: "06",
    image: mobile,
  },
];

function ServiceCard({ service, active, onSelect }) {
  const Icon = service.icon;

  return (
    <article
      className={`service-card ${active ? "is-active" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`${service.title}${active ? ", selected" : ""}`}
    >
      <div className="service-card-image">
       <img
  src={service.image}
  alt={`${service.title} service`}
  loading="lazy"
/>
        <div className="service-card-image-overlay" />

        <span className="service-card-number">
          {service.number} / 06
        </span>

        <div className="service-card-icon">
          <Icon size={23} strokeWidth={1.7} />
        </div>
      </div>

      <div className="service-card-content">
        <p className="service-card-eyebrow">AUTOMOTIVE SERVICE</p>

        <h3>{service.title}</h3>

        <p className="service-card-description">
          {service.description}
        </p>

        <div className="service-card-bottom">
          <span>{active ? "Selected service" : "Explore service"}</span>

          <span className="service-card-arrow">
            <FiArrowUpRight size={18} />
          </span>
        </div>
      </div>

      <div className="service-card-accent" />
    </article>
  );
}

export default function Services() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const activeIndexRef = useRef(0);
  const isJumpingRef = useRef(false);

  const total = services.length;

  const renderedServices = [
    { serviceIndex: total - 1, loopIndex: 0 },
    ...services.map((_, index) => ({
      serviceIndex: index,
      loopIndex: index + 1,
    })),
    { serviceIndex: 0, loopIndex: total + 1 },
  ];

  const moveToCard = useCallback((renderIndex, behavior = "smooth") => {
    const carousel = carouselRef.current;
    const card = cardRefs.current[renderIndex];

    if (!carousel || !card) return;

    const left =
      card.offsetLeft - (carousel.clientWidth - card.clientWidth) / 2;

    carousel.scrollTo({ left, behavior });
  }, []);

  const selectService = useCallback(
    (index) => {
      const normalizedIndex = (index + total) % total;

      activeIndexRef.current = normalizedIndex;
      setActiveIndex(normalizedIndex);

      moveToCard(normalizedIndex + 1);
    },
    [moveToCard, total]
  );

  const handleCarouselScroll = useCallback(() => {
    if (isJumpingRef.current) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    const center = carousel.scrollLeft + carousel.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    // Reposition from the cloned cards to their real counterparts.
    if (closestIndex === 0 || closestIndex === total + 1) {
      const realIndex = closestIndex === 0 ? total : 1;
      const logicalIndex = realIndex - 1;

      isJumpingRef.current = true;
      activeIndexRef.current = logicalIndex;
      setActiveIndex(logicalIndex);
      moveToCard(realIndex, "instant");

      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });

      return;
    }

    const logicalIndex = closestIndex - 1;

    if (logicalIndex >= 0 && logicalIndex < total) {
      activeIndexRef.current = logicalIndex;
      setActiveIndex((current) =>
        current === logicalIndex ? current : logicalIndex
      );
    }
  }, [moveToCard, total]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      moveToCard(1, "instant");
    });

    const handleResize = () => {
      moveToCard(activeIndexRef.current + 1, "instant");
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [moveToCard]);

  return (
    <section
      id="services"
      className="services-section relative overflow-hidden border-t border-white/10 bg-[#0b0c0f]"
    >
      <div className="services-background-glow pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-[#e32636]/[0.06] blur-3xl" />

      <div className="services-container relative mx-auto max-w-7xl">
        <div className="services-heading flex flex-col gap-5 px-5 sm:px-0 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-3 text-xs font-bold tracking-[3px] text-[#e32636] uppercase">
              <span className="h-px w-8 bg-[#e32636]" />
              What We Do
            </p>

            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Reliable care for
              <span className="text-zinc-500"> every mile.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:mt-5 sm:text-base">
              From routine maintenance to complex repairs, get help with your
              vehicle&apos;s needs from M&G Auto Repair.
            </p>
          </div>

          <a
            href="#contact"
            className="inline-flex w-fit items-center gap-3 border-b border-[#e32636] pb-2 text-sm font-semibold text-white transition-colors hover:text-[#e32636]"
          >
            Discuss a repair <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="services-carousel-shell">
          <button
            type="button"
            className="services-arrow services-arrow-left"
            onClick={() => selectService(activeIndexRef.current - 1)}
            aria-label="Previous service"
          >
            <FiChevronLeft size={23} />
          </button>

          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="services-carousel"
            aria-label="Automotive services carousel"
          >
            {renderedServices.map(({ serviceIndex, loopIndex }) => {
              const service = services[serviceIndex];

              return (
                <ServiceCard
                  key={`${service.number}-${loopIndex}`}
                  service={service}
                  active={activeIndex === serviceIndex}
                 onSelect={selectService.bind(null, serviceIndex)}
                />
              );
            }).map((card, index) => (
              <div
                className="services-carousel-item"
                key={renderedServices[index].loopIndex}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
              >
                {card}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="services-arrow services-arrow-right"
            onClick={() => selectService(activeIndexRef.current + 1)}
            aria-label="Next service"
          >
            <FiChevronRight size={23} />
          </button>
        </div>

        <div className="services-carousel-footer">
          <div className="services-pagination" aria-label="Choose a service">
            {services.map((service, index) => (
              <button
                key={service.number}
                type="button"
                onClick={() => selectService(index)}
                aria-label={`Show ${service.title}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={activeIndex === index ? "is-active" : ""}
              />
            ))}
          </div>

          <p className="services-counter">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="services-counter-divider">/</span>
            {String(total).padStart(2, "0")}
          </p>
        </div>

        <p className="services-note px-5 text-xs leading-5 text-zinc-500 sm:px-0">
          Not sure what your vehicle needs? Contact us to discuss the symptoms
          and available service options.
        </p>
      </div>
    </section>
  );
}
