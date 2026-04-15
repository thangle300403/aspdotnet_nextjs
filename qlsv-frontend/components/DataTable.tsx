import { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyText?: string;
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
};

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyText = "No data found.",
  onAdd,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div>
      {onAdd && (
        <div className="mb-4">
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add
          </button>
        </div>
      )}
      <table className="w-full border-collapse">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-2 text-left ${column.className ?? ""}`.trim()}
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-gray-100 hover:bg-gray-100"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 ${column.className ?? ""}`.trim()}
                >
                  {column.render(row)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="px-2 py-1 bg-green-400 text-white rounded"
                    >
                      Edit
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && <p className="mt-4 text-gray-500">{emptyText}</p>}
    </div>
  );
}
