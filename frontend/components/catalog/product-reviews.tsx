'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../../../shared/catalog';
import { useSession } from '../../hooks/use-session';
import { useShop } from '../../lib/store';
import { api } from '../../lib/api';
import { ErrorState } from '../commerce/states';
import { ReviewListSkeleton } from '../commerce/skeletons';
type Review = {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
};
export function ProductReviews({ product }: { product: Product }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['reviews', product.id],
    queryFn: () => api<{ reviews: Review[] }>(`/products/${product.id}/reviews`),
  });
  const mutation = useMutation({
    mutationFn: (values: { rating: number; title: string; comment: string }) =>
      api(`/products/${product.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product.id] });
      setWriting(false);
      toast.success('Your review has been saved');
    },
  });
  return (
    <section className="detail-section">
      <div className="section-heading">
        <h2>Ratings & reviews</h2>
        <button
          className="button outline"
          onClick={() => {
            if (!session?.user) useShop.getState().openAuth();
            else setWriting(!writing);
          }}
        >
          Write a review
        </button>
      </div>
      <div className="review-overview">
        <strong>
          {product.rating.toFixed(1)} <Star fill="currentColor" size={22} />
        </strong>
        <span>
          Sample catalogue rating
          <br />
          <small>Customer reviews below are submitted on LIDRESS.</small>
        </span>
      </div>
      {writing && (
        <form
          className="form-stack review-form"
          onSubmit={(event) => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            mutation.mutate({
              rating,
              title: String(values.get('title')),
              comment: String(values.get('comment')),
            });
          }}
        >
          <label>
            Your rating
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
          </label>
          <label>
            Review title
            <input
              name="title"
              minLength={3}
              maxLength={100}
              required
              placeholder="What stood out?"
            />
          </label>
          <label>
            Your experience
            <textarea
              name="comment"
              minLength={10}
              maxLength={1000}
              required
              rows={3}
              placeholder="Tell other shoppers what you think."
            />
          </label>
          {mutation.error && <p className="form-error">{mutation.error.message}</p>}
          <button className="button primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Submit review'}
          </button>
        </form>
      )}
      {isPending ? (
        <ReviewListSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} retry={() => refetch()} />
      ) : data?.reviews.length ? (
        data.reviews.map((review) => (
          <article className="review" key={review.id}>
            <span className="rating-pill">
              {review.rating}
              <Star size={10} fill="currentColor" />
            </span>
            <div>
              <strong>{review.title}</strong>
              <p>{review.comment}</p>
              <small>
                {review.name} ·{' '}
                {new Date(review.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString(
                  'en-IN',
                )}
              </small>
            </div>
          </article>
        ))
      ) : (
        <p className="muted">Be the first to share your experience with this product.</p>
      )}
    </section>
  );
}
