import React, { useState } from "react";
import ReactECharts from "echarts-for-react";

import {
  buildClassifiedHeatmap,
  getClassificationBorderColor,
} from "../utils/classifiedHeatmapUtils";


function Heatmap({ rows = [], onCellSelect }) {

  /*
    Build complete heatmap data.

    IMPORTANT:
    We keep ALL addresses and ALL activity.
    Nothing is removed just because it is inactive.
  */
  const {
    timeLabels,
    addressLabels,
    heatmapData,
  } = buildClassifiedHeatmap(rows);


  /*
    Snapshot configuration.

    Each snapshot contains a fixed number
    of time windows.
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
    Time labels for the current snapshot.
  */
  const snapshotTimeLabels =
    timeLabels.slice(
      snapshotStart,
      snapshotEnd
    );


  /*
    ALL addresses remain visible.

    We deliberately do NOT filter this list
    based on activity.
  */
  const snapshotAddresses =
    addressLabels;


  /*
    Build a lookup for address indexes.

    The original heatmap already uses
    addressIndex from addressLabels,
    so we preserve that structure.
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
    Get all heatmap cells belonging
    to the current snapshot.

    Empty cells are retained.
  */
  const snapshotData =
    heatmapData
      .filter(
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
              Convert the global time index
              to the local snapshot index.
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
    Colour logic.

    This is deliberately kept separate
    so that both the cell fill and border
    use exactly the same colour.
  */
  const getCellColor = (row) => {

    /*
      Empty / inactive cell.
    */
    if (
      !row ||
      row.isEmpty
    ) {
      return "#111827";
    }


    /*
      Bus Starver is RED.
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
      High threat is RED.
    */
    if (
      String(
        row.threat_level
      ).toLowerCase()
        .trim() ===
      "high"
    ) {
      return "#ef4444";
    }


    /*
      Medium threat is ORANGE.
    */
    if (
      String(
        row.threat_level
      ).toLowerCase()
        .trim() ===
      "medium"
    ) {
      return "#f97316";
    }


    /*
      Normal remains BLUE.
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
      Fallback to your existing
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

    IMPORTANT:

    We are NOT removing addresses.

    We only reduce how many text labels
    are displayed.

    Every address still exists as a heatmap row.
  */

  const addressCount =
    snapshotAddresses.length;


  /*
    Target approximately 20-25 visible
    labels at a time.

    Example:

    20 addresses
      -> show every address

    100 addresses
      -> show roughly every 5th

    500 addresses
      -> show roughly every 20th

    1000 addresses
      -> show roughly every 40th
  */
  const labelInterval =
    Math.max(
      1,
      Math.ceil(
        addressCount / 25
      )
    );


  /*
    ECharts interval is zero-based.

    interval = 1 means every 2nd label.
    interval = 4 means every 5th label.

    Therefore subtract 1.
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

    Every address gets its own vertical space.

    The container below is scrollable, so a large
    number of addresses does not compress the chart.
  */
  const pixelsPerAddress =
    addressCount > 500
      ? 14
      : addressCount > 250
        ? 16
        : 20;


  const chartHeight =
    Math.max(
      500,
      addressCount *
        pixelsPerAddress
    );


  /*
    -------------------------------------------------
    ECHARTS OPTION
    -------------------------------------------------
  */
  const option = {

    /*
      Disable animation because this is
      a large heatmap.
    */
    animation: false,


    /*
      NO visualMap.

      Cell colours are controlled directly
      through itemStyle.color.
    */


    tooltip: {

      formatter: (params) => {

        const row =
          params.data?.row;


        /*
          Empty / inactive cell.
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

      ALL addresses remain here.

      Only the text labels are reduced.
    */
    yAxis: {

      type: "category",

      data:
        snapshotAddresses,

      axisLabel: {

        /*
          Reduce text clutter without
          removing any heatmap rows.
        */
        interval:
          yAxisLabelInterval,

        fontSize: 10,

        margin: 10,

        /*
          Keep labels readable.
        */
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
      HEATMAP
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
          ALL cells are rendered.

          This includes:

          - Bus Starver
          - Normal
          - Memory Prober
          - Permission Violator
          - Empty
          - other classifications
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

          /*
            CELL FILL

            Bus Starver -> RED
            High threat -> RED
            Medium -> ORANGE
            Normal -> BLUE
          */
          color: (params) => {

            const row =
              params.data?.row;

            return getCellColor(
              row
            );
          },


          /*
            CELL BORDER

            IMPORTANT:

            The border uses the SAME colour
            as the cell fill.

            This prevents the old blue border
            from visually dominating red cells.
          */
          borderColor: (params) => {

            const row =
              params.data?.row;


            if (
              !row ||
              row.isEmpty
            ) {

              return "#1f2d42";
            }


            return getCellColor(
              row
            );
          },


          borderWidth: 1,
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

          ALL addresses are retained.

          If the chart is taller than the container,
          the user can scroll vertically.
          ------------------------------------------------- */}

      <div
        style={{

          overflowX:
            "auto",

          overflowY:
            "auto",

          maxHeight:
            "750px",

          width:
            "100%",

          /*
            Give the scrollbar a little
            separation from the chart.
          */
          paddingBottom:
            "5px",
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