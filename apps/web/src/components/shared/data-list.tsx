import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sow-platform/ui';

export interface DataListColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataListProps<T> {
  data: T[];
  getRowKey: (row: T) => string;
  columns: DataListColumn<T>[];
  renderCard: (row: T) => React.ReactNode;
  emptyMessage: string;
}

/**
 * Shared list-page rendering: a full data table at `sm` and above, and a
 * stacked card view below `sm` so tables never overflow on mobile.
 */
export function DataList<T>({
  data,
  getRowKey,
  columns,
  renderCard,
  emptyMessage,
}: DataListProps<T>) {
  return (
    <>
      <div className="hidden rounded-md border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.header} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((col) => (
                  <TableCell key={col.header} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        {data.map((row) => (
          <div
            key={getRowKey(row)}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            {renderCard(row)}
          </div>
        ))}
        {data.length === 0 && (
          <div className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    </>
  );
}
