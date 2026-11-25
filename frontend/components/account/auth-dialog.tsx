'use client';
import { ProgressiveImage } from '../commerce/progressive-image';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { registerSchema, loginSchema, type User } from '../../../shared/schemas';
import { Dialog } from '../commerce/dialog';
import { useShop } from '../../lib/store';
import { api } from '../../lib/api';
import { sessionKey } from '../../hooks/use-session';

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof loginSchema>) =>
      api<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(sessionKey, result);
      onSuccess();
      toast.success('Welcome back to LIDRESS');
    },
  });
  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="form-stack"
    >
      <label>
        Email address
        <input
          type="email"
          autoComplete="email"
          {...form.register('email')}
          placeholder="you@example.com"
        />
        {form.formState.errors.email && (
          <small className="field-error">{form.formState.errors.email.message}</small>
        )}
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete="current-password"
          {...form.register('password')}
          placeholder="Your password"
        />
        {form.formState.errors.password && (
          <small className="field-error">{form.formState.errors.password.message}</small>
        )}
      </label>
      {mutation.error && (
        <p role="alert" className="form-error">
          {mutation.error.message}
        </p>
      )}
      <button className="button primary full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="fine-print">
        Your account keeps your bag, wishlist, addresses, and demo orders together.
      </p>
    </form>
  );
}
function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof registerSchema>) =>
      api<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(sessionKey, result);
      onSuccess();
      toast.success('Your LIDRESS account is ready');
    },
  });
  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="form-stack"
    >
      {(['name', 'email', 'password'] as const).map((field) => (
        <label key={field}>
          {field === 'name'
            ? 'Full name'
            : field === 'email'
              ? 'Email address'
              : 'Create a password'}
          <input
            type={
              field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'
            }
            autoComplete={
              field === 'password' ? 'new-password' : field === 'name' ? 'name' : 'email'
            }
            {...form.register(field)}
            placeholder={
              field === 'name'
                ? 'Your name'
                : field === 'email'
                  ? 'you@example.com'
                  : 'At least 8 characters'
            }
          />
          {form.formState.errors[field] && (
            <small className="field-error">{form.formState.errors[field]?.message}</small>
          )}
        </label>
      ))}
      {mutation.error && (
        <p role="alert" className="form-error">
          {mutation.error.message}
        </p>
      )}
      <button className="button primary full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating your account…' : 'Create account'}
      </button>
      <p className="fine-print">
        This demo stores account details securely. It does not process real purchases.
      </p>
    </form>
  );
}
export function AuthDialog() {
  const open = useShop((state) => state.authOpen);
  const setOpen = useShop((state) => state.openAuth);
  const [register, setRegister] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={register ? 'A better everyday starts here.' : 'Good to see you again.'}
      description={
        register
          ? 'Create your LIDRESS account.'
          : 'Sign in to pick up where you left off.'
      }
      className="auth-dialog"
    >
      <div className="auth-brand">
        <ProgressiveImage src="/brand/lidress-wordmark.png" alt="lidress" />
        <div>
          <ShoppingBag size={48} strokeWidth={1} />
          <h3>
            Your finds.
            <br />
            Your favourites.
            <br />
            All in one place.
          </h3>
        </div>
        <span>
          <ShieldCheck size={16} /> Your shopping, securely saved.
        </span>
      </div>
      <div className="auth-form">
        {register ? (
          <RegisterForm onSuccess={() => setOpen(false)} />
        ) : (
          <LoginForm onSuccess={() => setOpen(false)} />
        )}
        <button
          className="text-button auth-switch"
          onClick={() => setRegister(!register)}
        >
          {register
            ? 'Already have an account? Sign in'
            : 'New to LIDRESS? Create an account'}
        </button>
      </div>
    </Dialog>
  );
}
