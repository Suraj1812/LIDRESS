import { OrdersContent } from '../../../components/account/orders-content';
export const metadata = { title: 'Order details' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrdersContent id={id} />;
}
