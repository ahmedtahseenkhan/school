import React from 'react';
import clsx from 'clsx';

export type Column<T> = {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  accessor?: (row: T) => React.ReactNode;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  initialSortKey?: string;
  showSearch?: boolean;
};

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

export function Table<T extends Record<string, any>>({ columns, data, className, initialSortKey, showSearch = true }: TableProps<T>) {
  const [sort, setSort] = React.useState<SortState>(initialSortKey ? { key: initialSortKey, dir: 'asc' } : null);
  const [query, setQuery] = React.useState('');

  const onSort = (key: string) => {
    setSort((prev: SortState) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  };

  const filtered = React.useMemo(() => {
    if (!showSearch || !query) return data;
    const q = query.toLowerCase();
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, query]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => (typeof c.key === 'string' ? c.key : String(c.key)) === sort.key);
    if (!col) return filtered;
    const key = col.key as string;
    return [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const cmp = av > bv ? 1 : av < bv ? -1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort, columns]);

  return (
    <div className={clsx('w-full overflow-x-auto', className)}>
      {showSearch && (
        <div className="flex items-center justify-between gap-2 py-2">
          <input
            type="search"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-64 max-w-full rounded-md border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Search table"
          />
        </div>
      )}
      <table className="min-w-full border-separate border-spacing-0" role="table">
        <thead>
          <tr className="text-left text-sm text-gray-600 dark:text-gray-300">
            {columns.map((c) => {
              const key = typeof c.key === 'string' ? c.key : String(c.key);
              const active = sort?.key === key;
              const ariaSort = active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none';
              return (
                <th
                  key={key}
                  scope="col"
                  style={{ width: c.width }}
                  className={clsx('sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-800 px-2 py-1 font-semibold', c.width && 'whitespace-nowrap')}
                  aria-sort={ariaSort as any}
                >
                  {c.sortable ? (
                    <button
                      onClick={() => onSort(key)}
                      className="inline-flex items-center gap-1 hover:underline"
                      aria-label={`Sort by ${c.header}`}
                    >
                      {c.header}
                      {active && <span>{sort!.dir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-900/60">
              {columns.map((c) => {
                const key = typeof c.key === 'string' ? c.key : String(c.key);
                return (
                  <td key={key} className="border-b border-gray-100 dark:border-gray-800 px-3 py-1.5">
                    {c.accessor ? c.accessor(row) : String(row[key] ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
          {!sorted.length && (
            <tr>
              <td className="px-3 py-2 text-sm text-gray-500" colSpan={columns.length}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
