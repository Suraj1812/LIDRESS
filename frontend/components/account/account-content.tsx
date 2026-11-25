'use client';
import { AccountSkeleton, AddressesSkeleton } from '../commerce/skeletons';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRound, Package, Heart, MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { addressSchema, type Address, type AddressInput } from '../../../shared/schemas';
import { useSession } from '../../hooks/use-session';
import { useShop } from '../../lib/store';
import { api } from '../../lib/api';
import { ErrorState } from '../commerce/states';
import { AddressFields } from '../checkout/address-fields';
export function AccountContent() {
  const { data, isPending } = useSession();
  const user = data?.user;
  const [adding, setAdding] = useState(false);
  const client = useQueryClient();
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { type: 'Home', locality: '' },
  });
  const addresses = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => api<{ addresses: Address[] }>('/account/addresses'),
    enabled: !!user,
  });
  const save = useMutation({
    mutationFn: (address: AddressInput) =>
      api('/account/addresses', { method: 'POST', body: JSON.stringify(address) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['addresses'] });
      setAdding(false);
      form.reset();
      toast.success('Address saved');
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/account/addresses/${id}`, { method: 'DELETE' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['addresses'] }),
  });
  if (isPending) return <AccountSkeleton />;
  if (!user)
    return (
      <main className="page-container">
        <div className="empty-state">
          <UserRound size={44} />
          <h1>A little more personal.</h1>
          <p>Sign in for your orders, wishlist, and saved addresses.</p>
          <button
            className="button primary"
            onClick={() => useShop.getState().openAuth()}
          >
            Sign in / Create account
          </button>
        </div>
      </main>
    );
  return (
    <main className="page-container">
      <div className="account-welcome">
        <span className="avatar">{user.name[0].toUpperCase()}</span>
        <div>
          <p>Hello,</p>
          <h1>{user.name}</h1>
          <span>{user.email}</span>
        </div>
      </div>
      <div className="account-shortcuts">
        <Link href="/orders">
          <Package />
          <strong>My orders</strong>
          <span>Track your purchases</span>
        </Link>
        <Link href="/wishlist">
          <Heart />
          <strong>Wishlist</strong>
          <span>All your saved good finds</span>
        </Link>
        <Link href="/cart">
          <Package />
          <strong>Your bag</strong>
          <span>Pick up where you left off</span>
        </Link>
      </div>
      <section className="shop-panel address-panel">
        <div className="section-heading">
          <h2>Saved addresses</h2>
          <button className="button outline" onClick={() => setAdding(!adding)}>
            <Plus size={16} />
            Add address
          </button>
        </div>
        {adding && (
          <form
            className="form-stack"
            onSubmit={form.handleSubmit((values) => save.mutate(values))}
          >
            <AddressFields form={form} />
            {save.error && <p className="form-error">{save.error.message}</p>}
            <button className="button primary" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save address'}
            </button>
          </form>
        )}
        {addresses.isPending ? (
          <AddressesSkeleton />
        ) : addresses.isError ? (
          <ErrorState
            message={addresses.error.message}
            retry={() => addresses.refetch()}
          />
        ) : (
          <div className="address-grid">
            {addresses.data?.addresses.map((address) => (
              <article key={address.id}>
                <span className="address-type">{address.type}</span>
                <strong>
                  {address.name} · {address.phone}
                </strong>
                <p>
                  {address.line1}, {address.locality} {address.city}, {address.state} –{' '}
                  {address.pincode}
                </p>
                <button
                  className="text-button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(address.id!)}
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}
        {!addresses.isPending &&
          !addresses.isError &&
          !addresses.data?.addresses.length &&
          !adding && <p className="muted">No saved addresses yet.</p>}
      </section>
    </main>
  );
}
