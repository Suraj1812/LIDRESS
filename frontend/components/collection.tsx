'use client';
import { ChevronDown, Heart, SlidersHorizontal, X, Scan, Search } from 'lucide-react';
import { money } from '../lib/products';
import { useStore } from '../hooks/store-context';

export function Collection() {
  const {
    filter,
    setFilter,
    sort,
    setSort,
    saved,
    setSaved,
    onlySaved,
    setOnlySaved,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    choose,
    visible,
  } = useStore();
  return (
    <>
      <section id="collection" className="collection">
        <div className="section-title">
          <div>
            <div className="eyebrow">THE GOOD KIND OF EVERYDAY</div>
            <h2>
              Find your next favourite<span>.</span>
            </h2>
          </div>
          <p>Made for real life. Ready for your fitting room.</p>
        </div>
        <div className="collection-toolbar">
          <div className="tabs">
            {['All pieces', 'Shirts', 'T-shirts', 'Jackets', 'Denim'].map((x) => (
              <button
                className={filter === x ? 'selected' : ''}
                key={x}
                onClick={() => setFilter(x)}
              >
                {x}
              </button>
            ))}
            <span className="piece-count">{visible.length} pieces</span>
          </div>
          <label className="sort">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option>Featured</option>
              <option>Price: low to high</option>
              <option>Price: high to low</option>
            </select>
            <ChevronDown size={13} />
          </label>
        </div>
        {showSearch && (
          <div className="search-box">
            <Search size={18} />
            <input
              autoFocus
              placeholder="Find your favourite piece…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              aria-label="Close search"
              onClick={() => {
                setSearch('');
                setShowSearch(false);
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}
        {onlySaved && (
          <button className="saved-filter" onClick={() => setOnlySaved(false)}>
            Saved pieces <X size={13} />
          </button>
        )}
        <div className="product-grid">
          {visible.map((p) => (
            <article className="product" key={p.id}>
              <div className="product-image">
                <img src={p.image} alt={p.name} />
                <span className="product-tag">{p.tag}</span>
                <button
                  className={'save-button ' + (saved.includes(p.id) ? 'is-saved' : '')}
                  aria-label={(saved.includes(p.id) ? 'Unsave ' : 'Save ') + p.name}
                  onClick={() =>
                    setSaved((s) =>
                      s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id],
                    )
                  }
                >
                  <Heart
                    size={18}
                    fill={saved.includes(p.id) ? 'currentColor' : 'none'}
                  />
                </button>
                <a className="try-button" href="#fitting-room" onClick={() => choose(p)}>
                  <Scan size={16} />
                  Try it on
                </a>
              </div>
              <div className="product-meta">
                <h3>{p.name}</h3>
                <span>{money(p.price)}</span>
              </div>
              <div className="product-bottom">
                <span>
                  {p.category} · {p.color}
                </span>
                <div className="swatches">
                  {p.swatches.map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="empty">
            No pieces here yet.{' '}
            <button
              onClick={() => {
                setOnlySaved(false);
                setFilter('All pieces');
                setSearch('');
              }}
            >
              Explore all pieces
            </button>
          </div>
        )}
      </section>
    </>
  );
}
