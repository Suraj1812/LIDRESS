'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Dialog } from '../commerce/dialog';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';
export function LocationDialog() {
  const open = useShop((state) => state.locationOpen);
  const setOpen = useShop((state) => state.openLocation);
  const save = useShop((state) => state.setLocation);
  const [pincode, setPincode] = useState('');
  const mutation = useMutation({
    mutationFn: () => api<{ city: string; pincode: string }>(`/delivery/${pincode}`),
    onSuccess: (result) => save(result.pincode, result.city),
  });
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Where are we delivering?"
      description="Set a PIN code to personalize your delivery estimate."
    >
      <div className="location-illustration">
        <MapPin size={38} />
      </div>
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <label>
          Delivery PIN code
          <input
            inputMode="numeric"
            pattern="[1-9][0-9]{5}"
            maxLength={6}
            required
            value={pincode}
            onChange={(event) => setPincode(event.target.value.replace(/\D/g, ''))}
            placeholder="Enter a 6-digit PIN code"
            autoComplete="postal-code"
          />
        </label>
        {mutation.error && <p className="form-error">{mutation.error.message}</p>}
        <button className="button primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Checking…' : 'Use this location'}
        </button>
        <p className="fine-print">Save your PIN code for shopping.</p>
      </form>
    </Dialog>
  );
}
