import { useEffect, useState } from "react";
import { getClassifiedHeatmapData } from "../api/classifiedHeatmapApi";

export function useTrafficData() {
  const [classifiedRows, setClassifiedRows] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  const [classificationFilter, setClassificationFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [addressFilter, setAddressFilter] = useState("All");

  const [currentWindowIndex, setCurrentWindowIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getClassifiedHeatmapData();
        setClassifiedRows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const addresses = [
    ...new Set(classifiedRows.map((row) => row.address || "Unknown")),
  ];

  const filteredRows = classifiedRows.filter((row) => {
    if (
      classificationFilter !== "All" &&
      row.classification !== classificationFilter
    ) {
      return false;
    }

    if (severityFilter !== "All" && row.severity !== severityFilter) {
      return false;
    }

    if (addressFilter !== "All" && (row.address || "Unknown") !== addressFilter) {
      return false;
    }

    return true;
  });

  const snapshotWindows = [
    ...new Map(
      filteredRows.map((row) => {
        const key = `${row.time_window_start}-${row.time_window_end}`;

        return [
          key,
          {
            start: row.time_window_start,
            end: row.time_window_end,
          },
        ];
      })
    ).values(),
  ];

  const safeWindowIndex = Math.min(
    currentWindowIndex,
    Math.max(snapshotWindows.length - 1, 0)
  );

  const currentWindow = snapshotWindows[safeWindowIndex];

  const currentWindowRows = currentWindow
    ? filteredRows.filter(
        (row) =>
          row.time_window_start === currentWindow.start &&
          row.time_window_end === currentWindow.end
      )
    : [];

  function goToPreviousWindow() {
    setSelectedCell(null);
    setCurrentWindowIndex((index) => Math.max(index - 1, 0));
  }

  function goToNextWindow() {
    setSelectedCell(null);
    setCurrentWindowIndex((index) =>
      Math.min(index + 1, Math.max(snapshotWindows.length - 1, 0))
    );
  }

  return {
    loading,
    error,

    classifiedRows,
    filteredRows,
    addresses,

    selectedCell,
    setSelectedCell,

    classificationFilter,
    setClassificationFilter,

    severityFilter,
    setSeverityFilter,

    addressFilter,
    setAddressFilter,

    currentWindowIndex: safeWindowIndex,
    setCurrentWindowIndex,

    currentWindow,
    snapshotWindows,
    currentWindowRows,

    goToPreviousWindow,
    goToNextWindow,
  };
}