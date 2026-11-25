import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '../../../../shared/catalog';
import { pageMetadata } from '../../../lib/metadata';
import { ProductDetail } from '../../../components/catalog/product-detail';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(Number(id));
  if (!product) notFound();
  return pageMetadata({
    title: product.title,
    description: `${product.brand} ${product.title}. ${product.description}`.slice(
      0,
      160,
    ),
    path: `/products/${product.id}`,
    image: product.images[0],
  });
}
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProduct(Number(id));
  if (!product) notFound();
  return <ProductDetail key={product.id} initialProduct={product} />;
}
