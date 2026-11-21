import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
export default function NotFound() {
  return (
    <div className="container not-found">
      <SEO
        title="Page not found"
        description="Find your way back to Wyztec’s industrial product catalog."
        noindex
      />
      <span className="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>
        A small detour.
        <br />
        Let’s get you back.
      </h1>
      <p>The page you’re looking for may have moved or is no longer available.</p>
      <div className="hero-ctas">
        <Link className="button primary" to="/products">
          Explore products
        </Link>
        <Link className="button secondary" to="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}
