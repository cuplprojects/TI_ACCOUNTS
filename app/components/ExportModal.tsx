"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faDownload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (
    params: Omit<ExportParams, "dateFrom" | "dateTo">
  ) => Promise<void>;
  title: string;
  totalCount: number;
  maxLimit?: number;
}

export interface ExportParams {
  offset: number;
  limit: number;
  format: "csv" | "xlsx";
  search?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  title,
  totalCount,
  maxLimit = 1000,
}) => {
  const [startRecord, setStartRecord] = useState<number | null>(null);
  const [endRecord, setEndRecord] = useState<number | null>(null);
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Max gap between start and end record
  const MAX_GAP = maxLimit;

  const handleStartRecordChange = (newValue: number | null) => {
    if (newValue === null) {
      setStartRecord(null);
    } else {
      const clampedValue = Math.max(1, Math.min(newValue, totalCount));
      setStartRecord(clampedValue);
    }
    setRangeError(null); // Clear error on change
  };

  const handleEndRecordChange = (newValue: number | null) => {
    if (newValue === null) {
      setEndRecord(null);
    } else {
      const clampedValue = Math.min(newValue, totalCount);
      setEndRecord(clampedValue);
    }
    setRangeError(null); // Clear error on change
  };

  const handleExport = async () => {
    // Validate and clamp values before export
    const actualStart = startRecord === null ? 1 : Math.max(1, startRecord);
    const actualEnd =
      endRecord === null ? totalCount : Math.min(totalCount, endRecord);

    if (actualStart > totalCount || actualEnd < 1) {
      setRangeError("Export range is outside available records.");
      return;
    }

    if (actualStart > actualEnd) {
      setRangeError("Start record cannot be greater than end record.");
      return;
    }

    if (actualEnd - actualStart + 1 > MAX_GAP) {
      setRangeError(
        `The maximum export limit is ${MAX_GAP.toLocaleString()} records. Please adjust your range.`
      );
      return;
    }

    setIsExporting(true);
    try {
      await onExport({
        offset: actualStart - 1, // Convert to 0-based offset
        limit: actualEnd - actualStart + 1, // Calculate limit
        format,
      });
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const reset = React.useCallback(() => {
    setStartRecord(null);
    setEndRecord(null);
    setFormat("csv");
    setIsExporting(false);
    setRangeError(null);
  }, []); // Dependencies removed as totalCount/maxLimit are props and don't need to trigger reset on change

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Export {title}
            </h3>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Total Info */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Total Available:</strong> {totalCount.toLocaleString()}{" "}
                records
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Maximum {maxLimit.toLocaleString()} records per export
              </p>
            </div>

            {/* Range Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start record
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalCount}
                    value={startRecord === null ? "" : startRecord}
                    placeholder="1"
                    onChange={(e) =>
                      handleStartRecordChange(
                        e.target.value === "" ? null : parseInt(e.target.value)
                      )
                    }
                    disabled={isExporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End record
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalCount}
                    value={endRecord === null ? "" : endRecord}
                    placeholder={totalCount.toString()}
                    onChange={(e) =>
                      handleEndRecordChange(
                        e.target.value === "" ? null : parseInt(e.target.value)
                      )
                    }
                    disabled={isExporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
              {rangeError && (
                <p className="text-red-500 text-xs mt-1">{rangeError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Will export records {startRecord === null ? 1 : startRecord} to{" "}
                {endRecord === null ? totalCount : endRecord} (
                {(endRecord === null ? totalCount : endRecord) -
                  (startRecord === null ? 1 : startRecord) +
                  1}{" "}
                records)
              </p>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="flex gap-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="csv"
                    checked={format === "csv"}
                    onChange={(e) => setFormat(e.target.value as "csv")}
                    disabled={isExporting}
                    className="mr-2"
                  />
                  <span className="text-sm">CSV</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="xlsx"
                    checked={format === "xlsx"}
                    onChange={(e) => setFormat(e.target.value as "xlsx")}
                    disabled={isExporting}
                    className="mr-2"
                  />
                  <span className="text-sm">Excel (XLSX)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={
                isExporting || startRecord === null || endRecord === null
              }
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin mr-2"
                  />
                  Exporting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
