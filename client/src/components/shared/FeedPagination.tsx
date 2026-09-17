import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import type { PostListMeta } from '../../types/post.types';

export function FeedPagination({ meta, page, onPageChange, disabled = false }: {
  meta: PostListMeta;
  page: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, index) => index + 1)
    .filter((pageNumber) => pageNumber === 1 || pageNumber === meta.totalPages || Math.abs(pageNumber - page) <= 1);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={disabled || !meta.hasPrevPage}
            onClick={(event) => {
              event.preventDefault();
              if (!disabled && meta.hasPrevPage) onPageChange(page - 1);
            }}
          />
        </PaginationItem>
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              href="#"
              isActive={pageNumber === page}
              aria-label={`Go to page ${pageNumber}`}
              onClick={(event) => {
                event.preventDefault();
                if (!disabled) onPageChange(pageNumber);
              }}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={disabled || !meta.hasNextPage}
            onClick={(event) => {
              event.preventDefault();
              if (!disabled && meta.hasNextPage) onPageChange(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
