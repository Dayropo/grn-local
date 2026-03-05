import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type ColumnDef } from "@tanstack/react-table"

export default function TableSkeleton({ columns }: { columns: ColumnDef<any>[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {Array.from({ length: columns.length }).map((_, i) => (
                  <TableHead key={i} className="h-10 bg-gray-100 px-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {Array.from({ length: columns.length }).map((_, colIdx) => (
                    <TableCell key={colIdx} className="h-14 px-4">
                      <div
                        className={
                          "h-4 animate-pulse rounded bg-gray-200 " +
                          (colIdx % 4 === 0
                            ? "w-40"
                            : colIdx % 4 === 1
                              ? "w-28"
                              : colIdx % 4 === 2
                                ? "w-20"
                                : "w-16")
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
