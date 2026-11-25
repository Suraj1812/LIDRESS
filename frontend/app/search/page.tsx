import { Suspense } from 'react';
import type { Metadata } from 'next';
import { categories } from '../../../shared/catalog';
import { pageMetadata } from '../../lib/metadata';
import { CatalogBrowser } from '../../components/catalog/catalog-browser';
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const query = first(params.q)?.trim();
  const category = categories.find(
    (item) => item.id === first(params.category) && item.id !== 'all',
  );
  const title = query
    ? `Search results for “${query.slice(0, 80)}”`
    : category
      ? `Shop ${category.name}`
      : 'Shop all products';
  const description = query
    ? `Explore products matching “${query.slice(0, 80)}” at LIDRESS. Filter by brand, price and category to find your everyday favourites.`
    : category
      ? `Discover ${category.name.toLowerCase()} at LIDRESS. Explore the collection and find your next everyday favourite.`
      : 'Explore fashion, footwear, watches, electronics and home essentials at LIDRESS. Browse by category, brand and price.';
  return pageMetadata({
    title,
    description,
    path: category ? `/search?category=${category.id}` : '/search',
    noIndex: !!query || Object.keys(params).some((key) => key !== 'category'),
  });
}
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-loading">Finding good things for you…</div>}>
      <CatalogBrowser />
    </Suspense>
  );
}
