import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useEnquiry } from '../context/Enquiry';
const slides = [
  {
    headline: 'Your Partner in Reliable',
    accent: 'Industrial Solutions',
  },
  {
    headline: 'Innovating Today for Tomorrow’s',
    accent: 'Industrial Needs',
  },
  {
    headline: 'Unparalleled Precision for',
    accent: 'Unmatched Performance',
  },
];
export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const reduced = useReducedMotion();
  const touch = useRef<number | null>(null);
  const { setOpen } = useEnquiry();
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => {
    if (paused || hover || focus || hidden || reduced) return;
    const timer = setInterval(() => setActive((n) => (n + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [paused, hover, focus, hidden, reduced]);
  const slide = slides[active];
  return (
    <section
      className="hero hero-minimal"
      aria-roledescription="carousel"
      aria-label="Wyztec industrial solutions"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      }}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const delta = touch.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) setActive((n) => (n + (delta > 0 ? 1 : 2)) % 3);
        touch.current = null;
      }}
    >
      <div className="container hero-content">
        <div className="hero-kicker">
          <span /> YOUR INDUSTRIAL SUPPLY PARTNER
        </div>
        <div
          className="hero-text"
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${active + 1} of 3`}
        >
          <h1 key={active}>
            {slide.headline}
            <br />
            <span>{slide.accent}</span>
            <span className="hero-period">.</span>
          </h1>
          <p>
            Global brands. Technical expertise. Reliable supply.
            <br />
            Connecting your industry to the solutions it needs.
          </p>
          <div className="hero-ctas">
            <Link className="button primary" to="/products">
              Browse Products
            </Link>
            <button className="button hero-secondary" onClick={() => setOpen(true)}>
              Get Quote
            </button>
          </div>
        </div>
        <div className="hero-bottom">
          <span>BASED IN THE UAE. CONNECTED TO THE WORLD.</span>
          <div className="carousel-controls">
            <button
              aria-label="Previous slide"
              className="icon-button"
              onClick={() => setActive((active + 2) % 3)}
            >
              <ChevronLeft size={19} />
            </button>
            <div className="carousel-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={active === index ? 'true' : undefined}
                  onClick={() => setActive(index)}
                  className={index === active ? 'active' : ''}
                />
              ))}
            </div>
            <button
              aria-label="Next slide"
              className="icon-button"
              onClick={() => setActive((active + 1) % 3)}
            >
              <ChevronRight size={19} />
            </button>
            <button
              className="icon-button"
              onClick={() => setPaused(!paused)}
              aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            >
              {paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
