import { ChevronLeft, ChevronRight } from "lucide-react"
import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (perPage: number) => void
  loading?: boolean
  itemsPerPageOptions?: number[]
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  itemsPerPageOptions = [5, 10, 20, 50, 100], // default options
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, currentPage + 2)

    // Adjust to show 5 numbers when possible
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4)
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4)
      }
    }

    if (startPage > 1) pages.push(1)
    if (startPage > 2) pages.push("...")

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages - 1) pages.push("...")
    if (endPage < totalPages) pages.push(totalPages)

    return pages
  }

  return (
    <div className={cn("mt-4 flex w-full flex-col items-center justify-end gap-4 sm:flex-row")}>
      {/* Pagination Controls */}
      <div className="flex items-center gap-3">
        {/* Previous Button */}
        <Button
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          aria-label="Previous Page"
          variant="outline"
        >
          <ChevronLeft className="h-5" />
        </Button>

        {/* Page Numbers with Animation */}
        <div className="flex gap-2">
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={page}
                size="icon-sm"
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                variant={currentPage === page ? "default" : "outline"}
              >
                {page}
              </Button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-600">
                {page}
              </span>
            ),
          )}
        </div>

        {/* Next Button */}
        <Button
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          aria-label="Next Page"
          variant="outline"
        >
          <ChevronRight className="h-5" />
        </Button>
      </div>
    </div>
  )
}

export default Pagination
