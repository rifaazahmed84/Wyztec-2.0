import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product, EnquiryItem } from '../types';
import { track } from '../analytics';
type Basket = {
  items: EnquiryItem[];
  open: boolean;
  setOpen: (value: boolean) => void;
  add: (p: Product) => void;
  update: (id: string, patch: Partial<Pick<EnquiryItem, 'quantity' | 'notes'>>) => void;
  remove: (id: string) => void;
  clear: () => void;
  notice: string;
};
const Context = createContext<Basket | null>(null);
export function readBasket(): EnquiryItem[] {
  try {
    const data = JSON.parse(localStorage.getItem('wyztec-enquiry-v1') || '[]');
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (i: EnquiryItem) =>
          typeof i.productId === 'string' &&
          typeof i.name === 'string' &&
          typeof i.slug === 'string' &&
          typeof i.brand === 'string' &&
          typeof i.image === 'string' &&
          typeof i.notes === 'string' &&
          Number.isInteger(i.quantity) &&
          i.quantity > 0 &&
          i.quantity <= 9999,
      )
      .slice(0, 50);
  } catch {
    return [];
  }
}
export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EnquiryItem[]>(readBasket);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem('wyztec-enquiry-v1', JSON.stringify(items));
    } catch {
      /* Keep the enquiry usable when browser storage is disabled. */
    }
  }, [items]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);
  const add = (p: Product) => {
    setItems((current) => {
      const found = current.find((i) => i.productId === p.id);
      return found
        ? current.map((i) =>
            i.productId === p.id ? { ...i, quantity: Math.min(i.quantity + 1, 9999) } : i,
          )
        : [
            ...current,
            {
              productId: p.id,
              slug: p.slug,
              name: p.name,
              brand: p.brand,
              image: p.images[0].src,
              quantity: 1,
              notes: '',
            },
          ].slice(0, 50);
    });
    setNotice(`${p.name} added to your enquiry`);
    track('enquiry_add', { product: p.slug });
  };
  return (
    <Context.Provider
      value={{
        items,
        open,
        setOpen,
        add,
        notice,
        update: (id, patch) =>
          setItems((current) => current.map((i) => (i.productId === id ? { ...i, ...patch } : i))),
        remove: (id) => setItems((current) => current.filter((i) => i.productId !== id)),
        clear: () => setItems([]),
      }}
    >
      {children}
      <div className={`toast ${notice ? 'visible' : ''}`} role="status">
        {notice}
        <button onClick={() => setOpen(true)}>View enquiry</button>
      </div>
    </Context.Provider>
  );
}
export function useEnquiry() {
  const context = useContext(Context);
  if (!context) throw new Error('Missing EnquiryProvider');
  return context;
}
