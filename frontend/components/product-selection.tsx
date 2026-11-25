'use client';
import { Check, ShoppingBag, Sparkles } from 'lucide-react';
import { products, money } from '../lib/products';
import { useStore } from '../hooks/store-context';
export function ProductSelection() {
  const { selected, size, setSize, setSettings, setToast, choose, add } = useStore();
  return (
    <aside className="selection">
      <div className="selection-label">
        IN YOUR FITTING ROOM{' '}
        <span>
          {String(selected.id).padStart(2, '0')} /{' '}
          {String(products.length).padStart(2, '0')}
        </span>
      </div>
      <div className="selected-product">
        <img src={selected.image} alt={selected.name} />
        <div>
          <span>{selected.category}</span>
          <h3>{selected.name}</h3>
          <strong>{money(selected.price)}</strong>
        </div>
      </div>
      <p className="product-desc">{selected.desc}</p>
      <div className="field-label">
        Colour <span>{selected.color}</span>
      </div>
      <div className="selected-colors">
        {selected.swatches.map((c, i) => (
          <span
            title={i === 0 ? selected.color : 'Other colours coming soon'}
            className={i === 0 ? 'current' : ''}
            key={c}
          >
            <i style={{ background: c }} />
          </span>
        ))}
      </div>
      <div className="field-label">
        Size{' '}
        <button
          onClick={() =>
            setToast(
              'Chest measurements: XS 32–34″ · S 35–37″ · M 38–40″ · L 41–43″ · XL 44–46″',
            )
          }
        >
          Size guide
        </button>
      </div>
      <div className="sizes">
        {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
          <button
            key={s}
            className={s === size ? 'chosen' : ''}
            onClick={() => setSize(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <button className="button dark add-button" onClick={add}>
        <ShoppingBag size={17} />
        Add to bag <span>{money(selected.price)}</span>
      </button>
      <div className="fit-disclaimer">
        2D style overlay. Size selection is for your bag, not a fit prediction.
      </div>
      <div className="switch-label">A DIFFERENT MOOD? TRY ANOTHER.</div>
      <div className="garment-strip">
        {products.map((p) => (
          <button
            key={p.id}
            className={selected.id === p.id ? 'current' : ''}
            aria-label={'Try ' + p.name}
            onClick={() => choose(p)}
          >
            <img src={p.image} alt={p.name} />
            {selected.id === p.id && (
              <span>
                <Check size={11} />
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="connection-hint">
        <Sparkles size={16} />
        <span>
          Free body tracking. Your camera stays on your device.{' '}
          <button onClick={() => setSettings(true)}>How it works</button>
        </span>
      </div>
    </aside>
  );
}
