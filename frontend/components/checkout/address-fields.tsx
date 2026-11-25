'use client';
import type { useForm } from 'react-hook-form';
import type { AddressInput } from '../../../shared/schemas';
export function AddressFields({
  form,
}: {
  form: ReturnType<typeof useForm<AddressInput>>;
}) {
  return (
    <div className="address-fields">
      {(['name', 'phone', 'pincode', 'line1', 'locality', 'city', 'state'] as const).map(
        (field) => (
          <label key={field} className={field === 'line1' ? 'wide' : ''}>
            {
              {
                name: 'Full name',
                phone: 'Mobile number',
                pincode: 'PIN code',
                line1: 'House, building and street',
                locality: 'Locality (optional)',
                city: 'City',
                state: 'State',
              }[field]
            }
            <input
              {...form.register(field)}
              autoComplete={
                field === 'name'
                  ? 'name'
                  : field === 'phone'
                    ? 'tel'
                    : field === 'pincode'
                      ? 'postal-code'
                      : field === 'line1'
                        ? 'street-address'
                        : 'off'
              }
              inputMode={field === 'phone' || field === 'pincode' ? 'numeric' : 'text'}
            />
            {form.formState.errors[field] && (
              <small className="field-error">
                {form.formState.errors[field]?.message}
              </small>
            )}
          </label>
        ),
      )}
    </div>
  );
}
