import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Phone, ClipboardList, ArrowUp, MessageCircle, Mail, MapPin } from 'lucide-react';
import logo from '../assets/logo.svg';
import { company, navigation, socialLinks } from '../config';
import { useEnquiry } from '../context/Enquiry';
import Overlay from './Overlay';
import EnquiryDrawer from './EnquiryDrawer';
export default function Layout() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items, setOpen } = useEnquiry();
  const location = useLocation();
  useEffect(() => {
    setMenu(false);
    if (location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        }),
      );
    } else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 450);
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>GLOBAL INDUSTRIAL SUPPLIES · RAS AL KHAIMAH, UAE</span>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <span>We are online 24/7</span>
        </div>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" aria-label="Wyztec home">
            <img
              src={logo}
              className="logo"
              width={216}
              height={54}
              alt="Wyztec — Global Industrial Supplies"
            />
          </Link>
          <nav aria-label="Main navigation">
            {navigation.map(([name, path]) => (
              <NavLink key={path} end={path === '/'} to={path}>
                {name}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <a href={`tel:${company.tel}`} className="header-phone">
              <Phone size={15} />
              <span>(+971) 551264045</span>
            </a>
            <button
              className="enquiry-toggle icon-button"
              onClick={() => setOpen(true)}
              aria-label={`Open enquiry list, ${items.length} products`}
            >
              <ClipboardList size={21} />
              {items.length > 0 && <span className="badge-count">{items.length}</span>}
            </button>
            <button className="button primary header-quote" onClick={() => setOpen(true)}>
              Get Quote
            </button>
            <button
              className="icon-button menu-button"
              aria-label="Open navigation menu"
              onClick={() => setMenu(true)}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <Overlay title="Navigation" onClose={() => setMenu(false)}>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navigation.map(([name, path]) => (
              <NavLink key={path} to={path} onClick={() => setMenu(false)}>
                {name}
              </NavLink>
            ))}
          </nav>
          <a href={`tel:${company.tel}`}>{company.phone}</a>
          <button
            className="button primary"
            onClick={() => {
              setMenu(false);
              setOpen(true);
            }}
          >
            Get Quote
          </button>
        </Overlay>
      )}
      <main id="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-intro">
            <Link to="/">
              <img
                src={logo}
                width={230}
                height={57}
                alt="Wyztec Global Industrial Supplies"
                loading="lazy"
              />
            </Link>
            <p>
              Reliable products.
              <br />
              Lasting partnerships.
            </p>
            <small>Your industrial supply partner in the UAE.</small>
          </div>
          <div>
            <h3>Explore</h3>
            {navigation.map(([name, path]) => (
              <Link key={path} to={path}>
                {name}
              </Link>
            ))}
          </div>
          <div>
            <h3>Visit us</h3>
            <p>{company.address}</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Al+Hamra+Industrial+Zone+Ras+Al+Khaimah+UAE"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={16} /> Find us on the map
            </a>
          </div>
          <div>
            <h3>Let’s talk</h3>
            <a href={`tel:${company.tel}`}>
              <Phone size={16} />
              {company.phone}
            </a>
            <a href="mailto:info@wyztec.com">
              <Mail size={16} />
              info@wyztec.com
            </a>
            <a href={`mailto:${company.email}`}>
              <Mail size={16} />
              {company.email}
            </a>
            {socialLinks.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <div className="container footer-bottom">
          <small>© {new Date().getFullYear()} Wyztec Solutions FZ-LLC. All Rights Reserved.</small>
          <span>Built on trust. Driven by industry.</span>
        </div>
      </footer>
      <div className="floating">
        <button
          className="floating-quote"
          onClick={() => setOpen(true)}
          aria-label="Request a quote"
        >
          <ClipboardList size={20} />
          <span>Request a quote</span>
        </button>
        <a
          href={company.whatsapp}
          className="whatsapp"
          target="_blank"
          rel="noreferrer"
          aria-label="Discuss requirements on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
        {scrolled && (
          <button
            className="back-top icon-button"
            aria-label="Back to top"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'auto'
                  : 'smooth',
              })
            }
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>
      <EnquiryDrawer />
    </>
  );
}
