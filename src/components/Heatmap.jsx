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
      BLUE.
    */
    if (
      String(
        row.classification
      ).trim() ===
      "Normal"
    ) {
      return "#3b82f6";
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
    -------------------------------------------------
    Y-AXIS LABEL DENSITY
    -------------------------------------------------

    We now have only ACTIVE addresses.

    If there are still many active addresses,
    reduce the number of text labels displayed.

    This does NOT remove heatmap rows.
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
  const pixelsPerAddress =
    addressCount > 400
      ? 3
      : addressCount > 300
        ? 4
        : addressCount > 200
          ? 5
          : addressCount > 100
            ? 6
            : 8;

  const chartHeight =
    Math.max(
      300,
      addressCount *
        pixelsPerAddress
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


    /*
      -------------------------------------------------
      GRID
      -------------------------------------------------
    */
    grid: {

      top: 30,

      left: 120,

      right: 30,

      bottom: 110,

      containLabel: true,
    },


    /*
      -------------------------------------------------
      X AXIS
      -------------------------------------------------
    */
    xAxis: {

      type: "category",

      data:
        snapshotTimeLabels,

      axisLabel: {

        /*
          Show every time label.
        */
        interval: 0,

        rotate: 45,

        margin: 15,

        fontSize: 10,
      },

      axisLine: {

        lineStyle: {

          color: "#475569",
        },
      },
    },


    /*
      -------------------------------------------------
      Y AXIS
      -------------------------------------------------

      ONLY addresses with activity in the
      current snapshot are shown.

      All their activity cells remain.
    */
    yAxis: {

      type: "category",

      data:
        snapshotAddresses,

      axisLabel: {

        /*
          Reduce label clutter when there
          are many active addresses.
        */
        interval:
          yAxisLabelInterval,

        fontSize: 10,

        margin: 10,

        hideOverlap: true,
      },

      axisLine: {

        lineStyle: {

          color: "#475569",
        },
      },
    },


    /*
      -------------------------------------------------
      HEATMAP SERIES
      -------------------------------------------------
    */
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


        /*
          -------------------------------------------------
          CELL STYLE
          -------------------------------------------------
        */
        itemStyle: {
          color: (params) => {
          const row = params.data?.row;
          return getCellColor(row);
        },

        borderColor: (params) => {
          const row = params.data?.row;

          if (!row || row.isEmpty) {
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
    -------------------------------------------------
    NO ACTIVITY IN CURRENT SNAPSHOT
    -------------------------------------------------
  */
  if (
    snapshotAddresses.length === 0
  ) {

    return (

      <section className="card">

        <div
          className="section-header"
        >

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


        {/* Snapshot Navigator */}

        <div
          style={{

            display: "flex",

            alignItems:
              "center",

            gap: "15px",

            marginBottom:
              "15px",
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


        <p>
          No activity in this snapshot.
        </p>

      </section>
    );
  }


  /*
    -------------------------------------------------
    MAIN COMPONENT
    -------------------------------------------------
  */
  return (

    <section className="card">

      <div
        className="section-header"
      >

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


      {/* -------------------------------------------------
          SNAPSHOT NAVIGATOR
          ------------------------------------------------- */}

      <div
        style={{

          display: "flex",

          alignItems:
            "center",

          gap: "15px",

          marginBottom:
            "15px",
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


      {/* -------------------------------------------------
          HEATMAP
          -------------------------------------------------

          Only addresses with activity are shown.

          All activity for those addresses remains.

          The chart is vertically scrollable if
          there are many active addresses.
      */}
        <div
          style={{
          overflowX: "auto",
          overflowY: "hidden",
          width: "100%",
          paddingBottom: "5px",        
        }}
      >

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