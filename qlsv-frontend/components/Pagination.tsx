type PaginationProps = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationProps) {
  return (
    <div className="mt-4 flex justify-center gap-2">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="border px-3 py-1 disabled:opacity-50"
      >
        Prev
      </button>

      <span>
        Page {page} / {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="border px-3 py-1 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
