import React, { useState } from "react";
import ReactECharts from "echarts-for-react";

import {
  buildClassifiedHeatmap,
  getClassificationBorderColor,
} from "../utils/classifiedHeatmapUtils";

function Heatmap({ rows = [], onCellSelect }) {
  const {
    timeLabels,
    addressLabels,
    heatmapData,
  } = buildClassifiedHeatmap(rows);

  const [snapshotIndex, setSnapshotIndex] = useState(0);

  const SNAPSHOT_SIZE = 50;

  const totalSnapshots = Math.ceil(
    timeLabels.length / SNAPSHOT_SIZE
  );

  const snapshotStart =
    snapshotIndex * SNAPSHOT_SIZE;

  const snapshotEnd = Math.min(
    snapshotStart + SNAPSHOT_SIZE,
    timeLabels.length
  );

  const snapshotTimeLabels =
    timeLabels.slice(
      snapshotStart,
      snapshotEnd
    );

  /*
    Filter data to the current snapshot.

    IMPORTANT:
    We only filter the DATA here.
    We do NOT filter the addresses.

    This keeps all addresses visible
    on the Y-axis even when they have
    no activity in the current snapshot.
  */
  const filteredSnapshotData =
    heatmapData.filter(
      (item) =>
        item.value[0] >= snapshotStart &&
        item.value[0] < snapshotEnd &&
        item.value[2] > 0
    );

  /*
    Show ALL addresses.
  */
  const snapshotAddresses =
    addressLabels;

  /*
    Keep the original address indexes.

    Since snapshotAddresses contains
    all addresses in the same order as
    addressLabels, the indexes remain valid.
  */
  const addressIndexMap =
    Object.fromEntries(
      addressLabels.map(
        (_, index) => [
          index,
          index,
        ]
      )
    );

  /*
    Convert global heatmap coordinates
    into snapshot-local coordinates.
  */
  const snapshotData =
    filteredSnapshotData.map(
      (item) => ({
        ...item,
        value: [
          item.value[0] - snapshotStart,
          addressIndexMap[item.value[1]],
          item.value[2],
        ],
      })
    );

  const chartHeight = 700;

  /*
    Determine the heatmap colour based
    on threat level / classification.

    IMPORTANT:
    Intensity is NOT used for colour.
    Intensity remains the access count.
  */
  const getThreatColor = (row) => {
    if (!row || row.isEmpty) {
      return "#111827";
    }

    /*
      Bus Starver is explicitly treated
      as a high-threat classification.
    */
    if (
      row.classification === "Bus Starver"
    ) {
      return "#ef4444";
    }

    /*
      High threat → red
    */
    if (
      String(row.threat_level).toLowerCase() ===
      "high"
    ) {
      return "#ef4444";
    }

    /*
      Medium threat → orange
    */
    if (
      String(row.threat_level).toLowerCase() ===
      "medium"
    ) {
      return "#f97316";
    }

    /*
      Low threat / Normal → blue
    */
    if (
      String(row.threat_level).toLowerCase() ===
        "low" ||
      row.classification === "Normal"
    ) {
      return "#3b82f6";
    }

    /*
      Default for anything not explicitly
      classified above.
    */
    return "#3b82f6";
  };

  const option = {
    animation: false,

    tooltip: {
      formatter: (params) => {
        const row =
          params.data?.row;

        /*
          Empty / inactive cell
        */
        if (!row || row.isEmpty) {
          const timeIndex =
            params.data?.value?.[0];

          return `
            <strong>No Activity</strong><br/>
            <b>Address</b>:
            ${row?.address ?? "Unknown"}<br/>
            <b>Time Window</b>:
            ${snapshotTimeLabels[timeIndex] ?? "Unknown"}
          `;
        }

        return `
          <b>Address</b>: ${row.address}<br/>
          <b>Time Window</b>:
          ${row.time_window_start} -
          ${row.time_window_end} ns<br/>
          <b>Classification</b>:
          ${row.classification ?? "Unknown"}<br/>
          <b>Threat Level</b>:
          ${row.threat_level ?? "Unknown"}<br/>
          <b>Severity</b>:
          ${row.severity ?? "Unknown"}<br/>
          <b>Intensity</b>:
          ${row.intensity}<br/>
          <b>Total Transactions</b>:
          ${row.total_txns}
        `;
      },
    },

    grid: {
      top: 40,
      left: 30,
      right: 30,
      bottom: 40,
      containLabel: true,
    },

    /*
      TIME AXIS
    */
    xAxis: {
      type: "category",
      data: snapshotTimeLabels,

      axisLabel: {
        interval: 0,
        rotate: 45,
        margin: 15,
      },
    },

    /*
      ADDRESS AXIS
    */
    yAxis: {
      type: "category",
      data: snapshotAddresses,

      axisLabel: {
        interval: 0,
        fontSize: 10,
      },
    },

    /*
      HEATMAP SERIES
    */
    series: [
      {
        type: "heatmap",

        /*
          Disable progressive rendering so
          per-cell colours are applied
          consistently.
        */
        progressive: 0,
        progressiveThreshold: 0,

        /*
          Only active cells are included
          in snapshotData.

          Inactive addresses still appear
          on the Y-axis.
        */
        data: snapshotData,

        label: {
          show: false,
        },

        /*
          MAIN CELL STYLE

          ECharts determines the colour
          for each individual cell based
          on its row metadata.
        */
        itemStyle: {
          color: (params) => {
            const row =
              params.data?.row;

            return getThreatColor(row);
          },

          borderWidth: 1,

          borderColor: (params) => {
            const row =
              params.data?.row;

            if (
              !row ||
              row.isEmpty
            ) {
              return "#1f2d42";
            }

            return getClassificationBorderColor(
              row.classification
            );
          },
        },

        /*
          Highlight selected / hovered cell.
        */
        emphasis: {
          itemStyle: {
            borderColor: "#ffffff",
            borderWidth: 3,
          },
        },
      },
    ],
  };

  /*
    Cell click handler
  */
  const onEvents = {
    click: (params) => {
      const row =
        params.data?.row;

      /*
        Ignore empty cells.
      */
      if (
        !row ||
        row.isEmpty
      ) {
        return;
      }

      if (
        typeof onCellSelect ===
        "function"
      ) {
        onCellSelect(row);
      }
    },
  };

  /*
    No data
  */
  if (heatmapData.length === 0) {
    return (
      <section className="card">
        <h2>
          Memory Heatmap
        </h2>

        <p>
          No heatmap data available.
        </p>
      </section>
    );
  }

  /*
    Main component
  */
  return (
    <section className="card">
      <div className="section-header">
        <h2>
          Memory Heatmap
        </h2>

        <p>
          Snapshot{" "}
          {snapshotIndex + 1}
          /
          {totalSnapshots}
          {" | "}
          Showing:
          {" "}
          {timeLabels[snapshotStart]}
          {" → "}
          {timeLabels[snapshotEnd - 1]}
        </p>
      </div>

      {/* Snapshot Navigator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "15px",
        }}
      >
        <button
          disabled={
            snapshotIndex === 0
          }
          onClick={() =>
            setSnapshotIndex(
              snapshotIndex - 1
            )
          }
        >
          ◀ Previous
        </button>

        <input
          type="range"
          min="0"
          max={
            totalSnapshots - 1
          }
          value={
            snapshotIndex
          }
          onChange={(e) =>
            setSnapshotIndex(
              Number(
                e.target.value
              )
            )
          }
          style={{
            flex: 1,
          }}
        />

        <button
          disabled={
            snapshotIndex ===
            totalSnapshots - 1
          }
          onClick={() =>
            setSnapshotIndex(
              snapshotIndex + 1
            )
          }
        >
          Next ▶
        </button>
      </div>

      {/* Heatmap */}
      <div
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          maxHeight: "750px",
          width: "100%",
        }}
      >
        <ReactECharts
          option={option}
          onEvents={onEvents}
          notMerge={true}
          lazyUpdate={true}
          style={{
            height: `${chartHeight}px`,
            width: "100%",
          }}
        />
      </div>
    </section>
  );
}

export default Heatmap;