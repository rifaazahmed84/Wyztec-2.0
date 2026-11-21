import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trash2, ClipboardList } from 'lucide-react';
import Overlay from './Overlay';
import ContactForm from './ContactForm';
import { useEnquiry } from '../context/Enquiry';
export default function EnquiryDrawer() {
  const { items, open, setOpen, update, remove, clear } = useEnquiry();
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (!open) setSubmitted(false);
  }, [open]);
  if (!open) return null;
  return (
    <Overlay title="Your product enquiry" onClose={() => setOpen(false)}>
      {items.length || submitted ? (
        <>
          <p className="muted">
            Tell us the quantities and specifications you need. Our team will prepare a technical
            offer.
          </p>
          <div className="basket-items">
            {items.map((item) => (
              <div className="basket-item" key={item.productId}>
                <img src={item.image} alt={item.name} width={88} height={88} />
                <div>
                  <span className="eyebrow">{item.brand}</span>
                  <Link to={`/products/${item.slug}`} onClick={() => setOpen(false)}>
                    {item.name}
                  </Link>
                  <div className="quantity-row">
                    <label htmlFor={`qty-${item.productId}`}>Quantity</label>
                    <input
                      id={`qty-${item.productId}`}
                      type="number"
                      min={1}
                      max={9999}
                      value={item.quantity}
                      onChange={(e) =>
                        update(item.productId, {
                          quantity: Math.min(
                            9999,
                            Math.max(1, Math.trunc(Number(e.target.value) || 1)),
                          ),
                        })
                      }
                    />
                    <button
                      className="icon-button"
                      onClick={() => remove(item.productId)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <label className="sr-only" htmlFor={`notes-${item.productId}`}>
                    Notes for {item.name}
                  </label>
                  <input
                    id={`notes-${item.productId}`}
                    className="item-notes"
                    maxLength={1000}
                    placeholder="Model, rating or application notes"
                    value={item.notes}
                    onChange={(e) => update(item.productId, { notes: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
          <ContactForm
            items={items}
            onSuccess={() => {
              setSubmitted(true);
              clear();
            }}
            onReset={() => setSubmitted(false)}
            compact
          />
        </>
      ) : (
        <div className="empty-state">
          <ClipboardList size={42} />
          <h3>Start with the right product.</h3>
          <p>Add products to build a single enquiry for your project.</p>
          <Link className="button primary" to="/products" onClick={() => setOpen(false)}>
            Explore the catalog
          </Link>
          <div className="or-divider">Or tell us what you need</div>
          <ContactForm compact />
        </div>
      )}
    </Overlay>
  );
}
