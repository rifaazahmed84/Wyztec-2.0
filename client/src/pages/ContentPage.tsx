import SEO from '../components/SEO';
import {
  AboutSection,
  WhySection,
  IndustrySection,
  SegmentsSection,
  BrandsSection,
  ContactSection,
} from '../components/Sections';
import { company } from '../config';
import { MapPin, Phone, Mail } from 'lucide-react';
const metadata: Record<string, [string, string]> = {
  about: ['About Wyztec', 'Industrial supply. Personal commitment.'],
  industries: ['Our Industries', 'Built around the way you work.'],
  'market-segments': ['Market Segments', 'The components behind your operations.'],
  contact: ['Contact Wyztec', 'Let’s move your project forward.'],
};
export default function ContentPage({ page }: { page: string }) {
  const [title, headline] = metadata[page];
  return (
    <>
      <SEO
        title={title}
        description={`${headline} Connect with Wyztec Solutions FZ-LLC, your multi-brand industrial supplies partner in the United Arab Emirates.`}
      />
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">WYZTEC · GLOBAL INDUSTRIAL SUPPLIES</span>
          <h1>{headline}</h1>
          <p>{title}</p>
        </div>
      </section>
      {page === 'about' ? (
        <>
          <AboutSection full />
          <WhySection />
          <BrandsSection />
        </>
      ) : page === 'industries' ? (
        <IndustrySection />
      ) : page === 'market-segments' ? (
        <SegmentsSection />
      ) : (
        <section className="section contact-details">
          <div className="container">
            <div className="contact-details-grid">
              <div>
                <MapPin />
                <h2>Visit us</h2>
                <p>{company.address}</p>
                <a
                  className="text-link"
                  href="https://www.google.com/maps/search/?api=1&query=Al+Hamra+Industrial+Zone+Ras+Al+Khaimah+UAE"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </a>
              </div>
              <div>
                <Phone />
                <h2>Call us</h2>
                <a href={`tel:${company.tel}`}>{company.phone}</a>
                <p>We are online 24/7.</p>
              </div>
              <div>
                <Mail />
                <h2>Email us</h2>
                <a href={`mailto:${company.email}`}>{company.email}</a>
                <a href="mailto:info@wyztec.com">info@wyztec.com</a>
              </div>
            </div>
            <iframe
              title="Map of Al Hamra Industrial Zone, Ras Al Khaimah"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Al%20Hamra%20Industrial%20Zone%20Ras%20Al%20Khaimah%20UAE&output=embed"
              width="1200"
              height="360"
            />
          </div>
        </section>
      )}
      <ContactSection />
    </>
  );
}
