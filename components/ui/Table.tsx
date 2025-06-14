import React, { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

const Table = <T extends { id: string | number }, >({ columns, data, onRowClick, isLoading = false, emptyStateMessage = "Nenhum dado disponível." }: TableProps<T>): React.ReactNode => {
  if (isLoading) {
    return <div className="text-center py-8 text-text-muted">Carregando dados...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-text-muted">{emptyStateMessage}</div>;
  }
  
  return (
    <div className="overflow-x-auto shadow-md rounded-lg border border-neutral-light-gray">
      <table className="min-w-full divide-y divide-neutral-light-gray bg-neutral-card">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-neutral-card divide-y divide-neutral-light-gray">
          {data.map((item) => (
            <tr 
              key={item.id} 
              className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col, index) => (
                <td 
                  key={index} 
                  className={`px-6 py-4 whitespace-nowrap text-sm text-text-dark ${col.className || ''}`}
                >
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;