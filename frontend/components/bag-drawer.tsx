'use client';
import { ShoppingBag, Plus, Minus, X } from 'lucide-react';
import { money } from '../lib/products';
import { useStore } from '../hooks/store-context';
import { useDialog } from '../hooks/use-dialog';
export function BagDrawer() {
  const { bag, setBag, drawer, setDrawer, bagCount } = useStore();
  const dialogRef = useDialog(drawer);
  return (
    <>
      {drawer && (
        <div className="overlay" onClick={() => setDrawer(false)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="bag-drawer"
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>
                Your bag <span>({bagCount})</span>
              </h2>
              <button aria-label="Close bag" onClick={() => setDrawer(false)}>
                <X />
              </button>
            </div>
            {bag.length === 0 ? (
              <div className="bag-empty">
                <ShoppingBag size={40} strokeWidth={1} />
                <h3>A little room for something good.</h3>
                <button
                  className="button dark"
                  onClick={() => {
                    setDrawer(false);
                    document
                      .getElementById('collection')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore the collection
                </button>
              </div>
            ) : (
              <>
                <div className="bag-items">
                  {bag.map((x, i) => (
                    <div className="bag-item" key={x.product.id + x.size}>
                      <img src={x.product.image} alt={x.product.name} />
                      <div>
                        <h3>{x.product.name}</h3>
                        <p>
                          Size {x.size} · {money(x.product.price)}
                        </p>
                        <div className="quantity">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() =>
                              setBag((b) =>
                                b.flatMap((v, j) =>
                                  j !== i
                                    ? [v]
                                    : v.qty > 1
                                      ? [{ ...v, qty: v.qty - 1 }]
                                      : [],
                                ),
                              )
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span>{x.qty}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() =>
                              setBag((b) =>
                                b.map((v, j) => (j === i ? { ...v, qty: v.qty + 1 } : v)),
                              )
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="remove-item"
                        aria-label={'Remove ' + x.product.name}
                        onClick={() => setBag((b) => b.filter((_, j) => i !== j))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bag-total">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      {money(bag.reduce((n, x) => n + x.qty * x.product.price, 0))}
                    </strong>
                  </div>
                  <p>This is a storefront demo. Orders and payments aren’t enabled.</p>
                  <button className="button dark" onClick={() => setDrawer(false)}>
                    Continue exploring
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
