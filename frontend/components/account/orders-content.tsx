'use client';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle2, Package, MapPin, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '../../../shared/schemas';
import { money } from '../../../shared/catalog';
import { useSession } from '../../hooks/use-session';
import { useShop } from '../../lib/store';
import { api } from '../../lib/api';
import { EmptyState, ErrorState } from '../commerce/states';
export function OrdersContent({ id }: { id?: string }) {
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['orders', user?.id, id || 'all'],
    queryFn: () =>
      id
        ? api<{ order: Order }>(`/orders/${id}`).then((result) => [result.order])
        : api<{ orders: Order[] }>('/orders').then((result) => result.orders),
    enabled: !!user,
  });
  const cancel = useMutation({
    mutationFn: (orderId: string) => api(`/orders/${orderId}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Demo order cancelled');
    },
  });
  if (sessionPending) return <div className="page-loading">Loading your orders…</div>;
  if (!user)
    return (
      <main className="page-container">
        <div className="empty-state">
          <Package size={45} />
          <h1>Your orders, all together.</h1>
          <p>Sign in to view your demo order history.</p>
          <button
            className="button primary"
            onClick={() => useShop.getState().openAuth()}
          >
            Sign in
          </button>
        </div>
      </main>
    );
  return (
    <main className="page-container">
      <div className="page-heading">
        <h1>{id ? 'Order details' : 'My orders'}</h1>
        <Link href="/search" className="text-button">
          Continue shopping
        </Link>
      </div>
      {query.isPending ? (
        <div className="page-loading">Loading orders…</div>
      ) : query.isError ? (
        <ErrorState message={query.error.message} retry={() => query.refetch()} />
      ) : !query.data?.length ? (
        <EmptyState
          title="Your story starts with a good find."
          description="Your demo orders will appear here after checkout."
        />
      ) : (
        query.data.map((order) => (
          <article className="shop-panel order-card" key={order.id}>
            <header>
              <div>
                <strong>{order.id}</strong>
                <p>Placed {format(new Date(order.createdAt), 'd MMM yyyy, h:mm a')}</p>
              </div>
              <span className={`order-status ${order.status}`}>
                <CheckCircle2 size={16} />
                {order.status === 'placed' ? 'Demo order placed' : 'Cancelled'}
              </span>
            </header>
            <div className="order-products">
              {order.items.map((item) => (
                <Link
                  href={`/products/${item.productId}`}
                  key={`${item.productId}-${item.size}`}
                >
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      Size {item.size} · Qty {item.quantity}
                    </p>
                    <strong>{money(item.price * item.quantity)}</strong>
                  </div>
                </Link>
              ))}
            </div>
            <div className="order-footer">
              <span>
                Total <strong>{money(order.total)}</strong>
              </span>
              {!id && (
                <Link href={`/orders/${order.id}`} className="button outline">
                  View details
                </Link>
              )}
              {order.status === 'placed' && (
                <button
                  className="text-button"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate(order.id)}
                >
                  Cancel demo order
                </button>
              )}
            </div>
            {id && (
              <div className="order-address">
                <MapPin size={20} />
                <div>
                  <strong>Delivery address</strong>
                  <p>
                    {order.address.name}
                    <br />
                    {order.address.line1}, {order.address.city}, {order.address.state} –{' '}
                    {order.address.pincode}
                  </p>
                  <small>
                    Simulation only. No payment collected, no package dispatched.
                  </small>
                </div>
              </div>
            )}
          </article>
        ))
      )}
      {cancel.error && <p className="form-error">{cancel.error.message}</p>}
    </main>
  );
}
