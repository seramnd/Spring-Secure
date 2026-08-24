import React, { useState } from "react";
import ReactECharts from "echarts-for-react";

import {
  buildClassifiedHeatmap,
  getClassificationBorderColor,
} from "../utils/classifiedHeatmapUtils";


function Heatmap({ rows = [], onCellSelect }) {

  /*
    -------------------------------------------------
    BUILD COMPLETE HEATMAP DATA
    -------------------------------------------------

    The utility function receives the complete
    dataset and creates:

      - timeLabels
      - addressLabels
      - heatmapData

    We do NOT remove anything here.
  */
  const {
    timeLabels,
    addressLabels,
    heatmapData,
  } = buildClassifiedHeatmap(rows);


  /*
    -------------------------------------------------
    SNAPSHOT CONFIGURATION
    -------------------------------------------------
  */

  const SNAPSHOT_SIZE = 50;

  const [snapshotIndex, setSnapshotIndex] =
    useState(0);


  const totalSnapshots =
    Math.max(
      1,
      Math.ceil(
        timeLabels.length /
          SNAPSHOT_SIZE
      )
    );


  const snapshotStart =
    snapshotIndex *
    SNAPSHOT_SIZE;


  const snapshotEnd =
    Math.min(
      snapshotStart +
        SNAPSHOT_SIZE,
      timeLabels.length
    );


  /*
    Time labels belonging to the
    current snapshot.
  */
  const snapshotTimeLabels =
    timeLabels.slice(
      snapshotStart,
      snapshotEnd
    );


  /*
    -------------------------------------------------
    GET ALL CELLS FOR CURRENT SNAPSHOT
    -------------------------------------------------

    At this stage we still keep ALL cells,
    including empty cells.
  */
  const snapshotCells =
    heatmapData.filter(
      (item) => {

        const globalTimeIndex =
          item.value?.[0];

        return (
          globalTimeIndex >=
            snapshotStart &&
          globalTimeIndex <
            snapshotEnd
        );
      }
    );


  /*
    -------------------------------------------------
    FIND ACTIVE ADDRESSES
    -------------------------------------------------

    We remove an address ONLY if it has
    absolutely no activity in the current
    snapshot.

    An address is active when:

      - row exists
      - row is not empty
      - intensity > 0
  */
  const activeAddressSet =
    new Set(
      snapshotCells
        .filter(
          (item) => {

            const row =
              item.row;

            return (
              row &&
              !row.isEmpty &&
              Number(
                row.intensity
              ) > 0
            );
          }
        )
        .map(
          (item) =>
            item.row.address
        )
        .filter(Boolean)
    );


  /*
    -------------------------------------------------
    ACTIVE ADDRESS LIST
    -------------------------------------------------

    We start from the original addressLabels
    so the hexadecimal ordering remains consistent.

    Addresses with ZERO activity in this snapshot
    are removed.

    IMPORTANT:
    This does NOT remove any active cells.
  */
  const snapshotAddresses =
    addressLabels
      .filter(
        (address) =>
          activeAddressSet.has(
            address
          )
      )
      .sort(
        (a, b) =>
          Number.parseInt(a, 16) -
          Number.parseInt(b, 16)
      );


  /*
    -------------------------------------------------
    ADDRESS -> Y-AXIS INDEX
    -------------------------------------------------

    Example:

      0x1000       -> 0
      0x10200      -> 1
      0x80000040   -> 2
  */
  const addressIndexMap =
    new Map(
      snapshotAddresses.map(
        (address, index) => [
          address,
          index,
        ]
      )
    );


  /*
    -------------------------------------------------
    BUILD FINAL SNAPSHOT DATA
    -------------------------------------------------

    We keep EVERY active cell.

    Example:

      Address A
        28001-29001 -> active
        29001-30001 -> active
        30001-31001 -> active

    ALL THREE CELLS remain.

    We are only removing addresses that have
    no activity anywhere in the snapshot.
  */
  const snapshotData =
    snapshotCells
      .filter(
        (item) => {

          const row =
            item.row;

          const address =
            row?.address;

          return (
            row &&
            !row.isEmpty &&
            Number(
              row.intensity
            ) > 0 &&
            addressIndexMap.has(
              address
            )
          );
        }
      )
      .map(
        (item) => {

          const globalTimeIndex =
            item.value?.[0];

          const localTimeIndex =
            globalTimeIndex -
            snapshotStart;

          const address =
            item.row?.address;

          const addressIndex =
            addressIndexMap.get(
              address
            );


          return {

            ...item,

            /*
              ECharts coordinates:

                X = local time index
                Y = active address index
                Z = intensity
            */
            value: [

              localTimeIndex,

              addressIndex,

              Number(
                item.row?.intensity
              ) || 0,

            ],

            row:
              item.row,
          };
        }
      );


  /*
    -------------------------------------------------
    CELL COLOUR
    -------------------------------------------------

    This is intentionally centralized so
    the fill and border always agree.
  */
  const getCellColor = (row) => {

    /*
      Empty cell.
    */
    if (
      !row ||
      row.isEmpty
    ) {
      return "#111827";
    }


    /*
      BUS STARVER
      -------------------------
      Explicitly RED.
    */
    if (
      String(
        row.classification
      ).trim() ===
      "Bus Starver"
    ) {
      return "#ef4444";
    }


    /*
      HIGH THREAT
      -------------------------
      RED.
    */
    if (
      String(
        row.threat_level
      )
        .trim()
        .toLowerCase() ===
      "high"
    ) {
      return "#ef4444";
    }


    /*
      MEDIUM THREAT
      -------------------------
      ORANGE.
    */
    if (
      String(
        row.threat_level
      )
        .trim()
        .toLowerCase() ===
      "medium"
    ) {
      return "#f97316";
    }


    /*
      NORMAL
      -------------------------
      YELLOW
    */
    if (
      String(
        row.classification
      ).trim() ===
      "Normal"
    ) {
      return "#eab308";
    }


    /*
      Fallback to existing
      classification colour logic.
    */
    return getClassificationBorderColor(
      row.classification
    );
  };


  /*
    Y-AXIS LABEL DENSITY
  */
  const addressCount =
    snapshotAddresses.length;

  const labelInterval =
    Math.max(
      1,
      Math.ceil(
        addressCount / 15
      )
    );


  /*
    ECharts interval is zero-based.

    interval = 0 -> every label
    interval = 4 -> every 5th label
  */
  const yAxisLabelInterval =
    Math.max(
      0,
      labelInterval - 1
    );


  /*
    -------------------------------------------------
    CHART HEIGHT
    -------------------------------------------------

    Give each active address enough vertical
    space so the heatmap does not become a
    compressed wall of cells.
  */
  const timeCount =
    snapshotTimeLabels.length;

  let chartHeight;

  if (addressCount <= 10) {
    chartHeight = 220;
  } else if (addressCount <= 25) {
    chartHeight = 300;
  } else if (addressCount <= 50) {
    chartHeight = 400;
  } else if (addressCount <= 100) {
    chartHeight = addressCount * 6;
  } else if (addressCount <= 200) {
    chartHeight = addressCount * 5;
  } else {
    chartHeight = addressCount * 4;
  }

  // Keep the chart within a reasonable visual range
  chartHeight = Math.min(
    Math.max(chartHeight, 220),
    750
  );


  /*
    ECHARTS OPTION
  */
  const option = {

    /*
      Disable animation for large datasets.
    */
    animation: false,


    /*
      NO visualMap.

      Cell colour is controlled directly
      through itemStyle.color.
    */


    /*
      -------------------------------------------------
      TOOLTIP
      -------------------------------------------------
    */
    tooltip: {

      formatter: (params) => {

        const row =
          params.data?.row;


        /*
          Empty cell.
        */
        if (
          !row ||
          row.isEmpty
        ) {

          return `
            <strong>No Activity</strong><br/>
            Address:
            ${row?.address ?? "Unknown"}
          `;
        }


        /*
          Active cell.
        */
        return `
          <strong>Address:</strong>
          ${row.address}<br/>

          <strong>Time Window:</strong>
          ${row.time_window_start}
          -
          ${row.time_window_end}
          ns<br/>

          <strong>Classification:</strong>
          ${row.classification ??
          "Unknown"}<br/>

          <strong>Threat Level:</strong>
          ${row.threat_level ??
          "Unknown"}<br/>

          <strong>Severity:</strong>
          ${row.severity ??
          "Unknown"}<br/>

          <strong>Intensity:</strong>
          ${row.intensity}<br/>

          <strong>Total Transactions:</strong>
          ${row.total_txns}
        `;
      },
    },


    grid: {
      top: 20,
      left: 50,
      right: 30,
      bottom: 80,
      containLabel: true,
    },


    xAxis: {
      type: "category",
      data: snapshotTimeLabels,

      axisLabel: {
        interval: Math.max(
          0,
          Math.floor(
            snapshotTimeLabels.length / 12
          )
        ),
        rotate: 45,
        fontSize: 10,
        color: "#64748b",
      },

      axisLine: {
        lineStyle: {
          color: "#262626",
        },
      },

      axisTick: {
        show: false,
      },
    },


    yAxis: {
      type: "category",
      data: snapshotAddresses,

      axisLabel: {
        interval: 0,
        fontSize: 10,
        margin: 5,
        hideOverlap: true,
        color: "#525252",
      },

      axisLine: {
        lineStyle: {
          color: "#262626",
        },
      },

      axisTick: {
        show: false,
      },
    },


    series: [
      {
        type: "heatmap",

        /*
          Disable progressive rendering.
        */
        progressive: 0,
        progressiveThreshold: 0,

        /*
          ONLY ACTIVE CELLS ARE INCLUDED.

          Empty addresses have already been
          removed from snapshotAddresses.
        */
        data:
          snapshotData,

        label: {
          show: false,
        },

        itemStyle: {

          color: (params) => {
            const row =
              params.data?.row;

            return getCellColor(row);
          },

          borderColor: (params) => {
            const row =
              params.data?.row;

            if (
              !row ||
              row.isEmpty
            ) {
              return "#1f2d42";
            }

            return getCellColor(row);
          },

          borderWidth: 0.5,
        },

        /*
          -------------------------------------------------
          HOVER
          -------------------------------------------------
        */
        emphasis: {

          itemStyle: {

            borderColor:
              "#ffffff",

            borderWidth: 3,
          },
        },
      },
    ],
  };


  /*
    -------------------------------------------------
    CELL CLICK HANDLER
    -------------------------------------------------
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
    -------------------------------------------------
    NO DATA
    -------------------------------------------------
  */
  if (
    heatmapData.length === 0
  ) {

    return (

      <section className="heatmap-card">

        <div className="heatmap-header">

          <div>

            <div className="heatmap-eyebrow">
              TRAFFIC VISUALIZATION
            </div>

            <h2>
              Memory Heatmap
            </h2>

          </div>

          <div className="heatmap-status">
            NO DATA
          </div>

        </div>

        <p className="heatmap-empty">
          No heatmap data available.
        </p>

      </section>
    );
  }


  /*
    -------------------------------------------------
    NO ACTIVITY IN CURRENT SNAPSHOT
    -------------------------------------------------
  */
  if (
    snapshotAddresses.length === 0
  ) {

    return (

      <section className="heatmap-card">

        <div className="heatmap-header">

          <div>

            <div className="heatmap-eyebrow">
              TRAFFIC VISUALIZATION
            </div>

            <h2>
              Memory Heatmap
            </h2>

            <p>
              Snapshot{" "}
              {snapshotIndex + 1}
              {" / "}
              {totalSnapshots}
              {" | "}
              Showing:{" "}
              {
                timeLabels[
                  snapshotStart
                ]
              }
              {" → "}
              {
                timeLabels[
                  snapshotEnd - 1
                ]
              }
            </p>

          </div>

          <div className="heatmap-status">
            NO ACTIVE TRAFFIC
          </div>

        </div>


        {/* Snapshot Navigator */}

        <div className="snapshot-controls">

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


        <div className="heatmap-empty">
          No activity in this snapshot.
        </div>

      </section>
    );
  }


  /*
    -------------------------------------------------
    MAIN COMPONENT
    -------------------------------------------------
  */
  return (

    <section className="heatmap-card">

      <div className="heatmap-header">

        <div>

          <div className="heatmap-eyebrow">
            TRAFFIC VISUALIZATION
          </div>

          <h2>
            Memory Heatmap
          </h2>

          <p>
            Snapshot{" "}
            {snapshotIndex + 1}
            {" / "}
            {totalSnapshots}
            {" | "}
            Showing:{" "}
            {
              timeLabels[
                snapshotStart
              ]
            }
            {" → "}
            {
              timeLabels[
                snapshotEnd - 1
              ]
            }
          </p>

        </div>


        <div className="heatmap-status">
          {addressCount} ACTIVE{" "}
          {addressCount === 1
            ? "ADDRESS"
            : "ADDRESSES"}
        </div>

      </div>


      {/* -------------------------------------------------
          SNAPSHOT NAVIGATOR
          ------------------------------------------------- */}

      <div className="snapshot-controls">

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


      {/* -------------------------------------------------
          HEATMAP
          -------------------------------------------------

          Only addresses with activity are shown.

          All activity for those addresses remains.

          The chart is horizontally scrollable
          if required.
      */}

      <div className="heatmap-chart-wrapper">

        <ReactECharts
          option={
            option
          }
          onEvents={
            onEvents
          }
          notMerge={
            true
          }
          lazyUpdate={
            true
          }
          style={{
            height:
              `${chartHeight}px`,
            width:
              "100%",
          }}
        />

      </div>

    </section>
  );
}


export default Heatmap;