export type { Product } from '../../server/src/data/products';
export type EnquiryItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  quantity: number;
  notes: string;
};
