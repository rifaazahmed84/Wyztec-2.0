import type { Product } from '../types';

/** Optional model comparison, used only by products that supply a modelTable. */
export default function ProductModelTable({
  name,
  table,
}: {
  name: string;
  table: NonNullable<Product['modelTable']>;
}) {
  return (
    <div
      className="product-model-table"
      role="region"
      aria-label={`${name} models`}
      tabIndex={0}
      style={{ maxWidth: '100%', overflowX: 'auto', contain: 'inline-size' }}
    >
      <table className="spec-table" style={{ minWidth: 640, tableLayout: 'fixed' }}>
        <caption className="sr-only">Models for {name}</caption>
        <colgroup>
          <col style={{ width: '16%' }} />
          <col style={{ width: '50%' }} />
          <col style={{ width: '34%' }} />
        </colgroup>
        <thead>
          <tr>
            {table.headings.map((heading) => (
              <th key={heading} scope="col" style={{ width: 'auto' }}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map(([model, product, temperature]) => (
            <tr key={model}>
              <th scope="row" style={{ width: 'auto' }}>
                {model}
              </th>
              <td>{product}</td>
              <td>{temperature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
