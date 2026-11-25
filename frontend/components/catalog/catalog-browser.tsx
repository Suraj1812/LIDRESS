'use client';
import { ProductGridSkeleton, SkeletonBlock } from '../commerce/skeletons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronRight, SlidersHorizontal, X, Filter } from 'lucide-react';
import { products, categories, type Product } from '../../../shared/catalog';
import { api } from '../../lib/api';
import { ProductCard } from './product-card';
import { EmptyState, ErrorState } from '../commerce/states';
import { CategoryNav } from '../layout/category-nav';

export function CatalogBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const category = params.get('category') || 'all';
  const query = params.get('q') || '';
  const sort = params.get('sort') || 'popular';
  const currentCategory = categories.find((item) => item.id === category);
  const title = query
    ? `Results for “${query}”`
    : category === 'all'
      ? 'All products'
      : currentCategory?.name || 'All products';
  const selectedBrands = (params.get('brand') || '').split(',').filter(Boolean);
  const brands = Array.from(
    new Set(
      products
        .filter((product) => category === 'all' || product.category === category)
        .map((product) => product.brand),
    ),
  ).sort();
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ['catalog', params.toString()],
      queryFn: () =>
        api<{ products: Product[]; total: number; page: number; pages: number }>(
          `/products?${params.toString()}`,
        ),
      placeholderData: keepPreviousData,
      staleTime: 30000,
    });
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    router.push(`/search?${next.toString()}`, { scroll: false });
  }
  function reset() {
    const next = new URLSearchParams();
    if (category !== 'all') next.set('category', category);
    if (query) next.set('q', query);
    router.push(`/search?${next}`);
  }
  function setPrice(value: string) {
    const next = new URLSearchParams(params.toString());
    next.delete('page');
    if (value) {
      const [min, max] = value.split('-');
      next.set('minPrice', min);
      next.set('maxPrice', max);
    } else {
      next.delete('minPrice');
      next.delete('maxPrice');
    }
    router.push(`/search?${next}`, { scroll: false });
  }
  const activeCount =
    Number(!!params.get('minPrice')) +
    Number(!!params.get('rating')) +
    selectedBrands.length;
  const filters = (
    <>
      <div className="filter-heading">
        <h2>Filters</h2>
        <button onClick={reset}>Clear all</button>
      </div>
      <div className="filter-section">
        <h3>Categories</h3>
        <Link href="/search" className={category === 'all' ? 'active-category' : ''}>
          All categories
        </Link>
        {categories
          .filter((item) => item.id !== 'all')
          .map((item) => (
            <Link
              key={item.id}
              className={category === item.id ? 'active-category' : ''}
              href={`/search?category=${item.id}`}
            >
              {item.name}
            </Link>
          ))}
      </div>
      <div className="filter-section">
        <h3>Price</h3>
        <select
          aria-label="Filter by price"
          value={
            params.get('minPrice')
              ? `${params.get('minPrice')}-${params.get('maxPrice')}`
              : ''
          }
          onChange={(event) => setPrice(event.target.value)}
        >
          <option value="">Any price</option>
          <option value="0-999">Under ₹1,000</option>
          <option value="1000-4999">₹1,000 – ₹4,999</option>
          <option value="5000-9999">₹5,000 – ₹9,999</option>
          <option value="10000-49999">₹10,000 – ₹49,999</option>
          <option value="50000-9999999">₹50,000 and above</option>
        </select>
      </div>
      <div className="filter-section">
        <h3>Customer rating</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={params.get('rating') === '4'}
            onChange={(event) => update('rating', event.target.checked ? '4' : '')}
          />
          4 ★ & above
        </label>
      </div>
      <div className="filter-section">
        <h3>Brand</h3>
        <div className="brand-filter-list">
          {brands.map((brand) => (
            <label key={brand} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() =>
                  update(
                    'brand',
                    (selectedBrands.includes(brand)
                      ? selectedBrands.filter((item) => item !== brand)
                      : [...selectedBrands, brand]
                    ).join(','),
                  )
                }
              />
              {brand}
            </label>
          ))}
        </div>
      </div>
      <div className="filter-assurance">
        <SlidersHorizontal size={24} />
        <strong>
          A little less scrolling.
          <br />A little more finding.
        </strong>
        <p>Make your search work for you.</p>
      </div>
    </>
  );
  return (
    <>
      <CategoryNav compact />
      <main className="catalog-layout">
        <aside className={`filters-sidebar ${filtersOpen ? 'filters-open' : ''}`}>
          <button
            className="filter-close icon-button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          >
            <X />
          </button>
          {filters}
        </aside>
        {filtersOpen && (
          <button
            className="filter-backdrop"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
        )}
        <section className="catalog-results">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span>{title}</span>
          </div>
          <div className="catalog-title">
            <div>
              <h1>{title}</h1>
              <span>
                {isError ? (
                  'Products are temporarily unavailable'
                ) : data && !isPlaceholderData ? (
                  `${data.total} products found`
                ) : (
                  <SkeletonBlock width={120} height={12} />
                )}
              </span>
            </div>
            <button
              className="button outline mobile-filter-trigger"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter size={16} />
              Filters {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>
          <div className="sort-bar">
            <span>Sort by</span>
            {[
              { id: 'popular', name: 'Relevance' },
              { id: 'price-asc', name: 'Price — Low to High' },
              { id: 'price-desc', name: 'Price — High to Low' },
              { id: 'rating', name: 'Top rated' },
              { id: 'discount', name: 'Biggest savings' },
            ].map((option) => (
              <button
                key={option.id}
                className={sort === option.id ? 'selected' : ''}
                onClick={() => update('sort', option.id)}
              >
                {option.name}
              </button>
            ))}
          </div>
          {activeCount > 0 && (
            <div className="active-filters">
              <span>{activeCount} active filters</span>
              <button onClick={reset}>
                Clear filters <X size={12} />
              </button>
            </div>
          )}
          {isError ? (
            <ErrorState message={error.message} retry={() => refetch()} />
          ) : isPending || isPlaceholderData ? (
            <ProductGridSkeleton />
          ) : data.products.length === 0 ? (
            <EmptyState
              title="No matches this time."
              description="Try a different search or clear a filter to discover more."
            />
          ) : (
            <>
              <div
                className={`catalog-grid ${isFetching ? 'updating' : ''}`}
                aria-busy={isFetching}
              >
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="pagination">
                <span>
                  Showing {(data.page - 1) * 24 + 1}–
                  {Math.min(data.page * 24, data.total)} of {data.total}
                </span>
                <div>
                  {Array.from({ length: data.pages }, (_, index) => (
                    <button
                      key={index}
                      aria-label={`Page ${index + 1}`}
                      aria-current={data.page === index + 1 ? 'page' : undefined}
                      className={data.page === index + 1 ? 'selected' : ''}
                      onClick={() => {
                        update('page', String(index + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
