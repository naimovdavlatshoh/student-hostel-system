import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
}) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        onPageChange(page);
    };

    if (totalPages <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
            if (totalPages > 5) {
                pages.push("ellipsis");
                pages.push(totalPages);
            }
        } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push("ellipsis");
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push("ellipsis");
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push("ellipsis");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200",
                    "hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                    "focus:outline-none focus:ring-2 focus:ring-gray-300"
                )}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((page, index) => {
                if (page === "ellipsis") {
                    return (
                        <div
                            key={`ellipsis-${index}`}
                            className="h-8 w-8 flex items-center justify-center"
                        >
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </div>
                    );
                }

                const pageNumber = page as number;
                const isActive = currentPage === pageNumber;

                return (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageClick(pageNumber)}
                        className={cn(
                            "h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-gray-300",
                            isActive
                                ? "bg-mainbg/15 text-maintx"
                                : "hover:bg-gray-200 text-gray-700"
                        )}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {pageNumber}
                    </button>
                );
            })}

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200",
                    "hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                    "focus:outline-none focus:ring-2 focus:ring-gray-300"
                )}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

export default CustomPagination;
