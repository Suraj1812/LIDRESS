import { ProgressiveImage } from '../commerce/progressive-image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { categories } from '../../../shared/catalog';
export function CategoryNav({ compact = false }: { compact?: boolean }) {
  return (
    <nav
      className={compact ? 'category-nav compact' : 'category-nav'}
      aria-label="Shop by category"
    >
      {categories.map((category) => (
        <Link
          key={category.id}
          href={category.id === 'all' ? '/search' : `/search?category=${category.id}`}
        >
          {!compact && (
            <span className="category-image">
              <ProgressiveImage src={category.image} alt="" />
            </span>
          )}
          <span>
            {category.name}
            {category.id !== 'all' && <ChevronDown size={12} />}
          </span>
        </Link>
      ))}
    </nav>
  );
}
