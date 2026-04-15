"use client";

type DeleteModalProps = {
  isOpen: boolean;
  title: string;
  itemLabel: string;
  itemName: string;
  description?: string;
  isDeleting: boolean;
  errorMessage: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteModal({
  isOpen,
  title,
  itemLabel,
  itemName,
  description,
  isDeleting,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-red-600">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-700">
          {description ?? (
            <>
              Ban co chac muon xoa {itemLabel} <strong>{itemName}</strong> khong?
            </>
          )}
        </p>

        {errorMessage && <p className="mb-4 text-sm text-red-600">{errorMessage}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2"
          >
            Khong
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              void onConfirm();
            }}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {isDeleting ? "Dang xoa..." : "Co"}
          </button>
        </div>
      </div>
    </div>
  );
}
