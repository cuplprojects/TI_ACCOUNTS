import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

export type DateRange = "all" | "today" | "yesterday" | "thisMonth" | "lastMonth" | "custom";

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
}

const dateRangeOptions = [
  { id: "all" as DateRange, label: "All Dates" },
  { id: "today" as DateRange, label: "Today" },
  { id: "yesterday" as DateRange, label: "Yesterday" },
  { id: "thisMonth" as DateRange, label: "This Month" },
  { id: "lastMonth" as DateRange, label: "Last Month" },
  { id: "custom" as DateRange, label: "Custom Date" },
];

export default function DateRangeSelector({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
}: DateRangeSelectorProps) {
  // Get today's date in YYYY-MM-DD format to disable future dates
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Format date for display (YYYY-MM-DD to readable format)
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faCalendar} className="text-gray-10 h-4 w-4" />
        <span className="text-sm font-semibold text-gray-10">Date Range:</span>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {dateRangeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onRangeChange(option.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              selectedRange === option.id
                ? "bg-primary text-white"
                : "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedRange === "custom" && (
        <div className="flex gap-2 items-center ml-2">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => onCustomStartChange(e.target.value)}
            max={maxDate}
            className="px-3 py-1.5 border border-gray-line rounded-md text-xs focus:outline-none"
          />
          <span className="text-gray-10">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => onCustomEndChange(e.target.value)}
            max={maxDate}
            className="px-3 py-1.5 border border-gray-line rounded-md text-xs focus:outline-none"
          />
          
        </div>
      )}
    </div>
  );
}
