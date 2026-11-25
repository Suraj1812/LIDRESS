import Link from 'next/link';
import { ShoppingBag, AlertCircle } from 'lucide-react';
export function EmptyState({
  title,
  description,
  action = 'Explore products',
  href = '/search',
}: {
  title: string;
  description: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="empty-state">
      <span>
        <ShoppingBag size={42} strokeWidth={1.3} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href={href} className="button primary">
        {action}
      </Link>
    </div>
  );
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={23} />
      <p>{message}</p>
      {retry && (
        <button className="button outline" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export { ProductSkeleton } from './skeletons';
