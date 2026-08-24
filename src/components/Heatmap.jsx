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


  console.log("First heatmap item:", heatmapData[0]);
  console.log(
    "Bus Starver item:",
    heatmapData.find(
      (item) => item.row?.classification === "Bus Starver"
    )
  );
  console.log(
    "Last heatmap item:",
    heatmapData[heatmapData.length - 1]
  );


  const SNAPSHOT_SIZE = 50;


  const totalSnapshots = Math.ceil(
    timeLabels.length / SNAPSHOT_SIZE
  );


  const snapshotStart =
    snapshotIndex * SNAPSHOT_SIZE;


  const snapshotEnd =
    Math.min(
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

    This means all addresses will remain
    visible on the Y-axis, even if they
    have no activity in this snapshot.
  */
  const filteredSnapshotData =
    heatmapData.filter(
      (item) =>
        item.value[0] >= snapshotStart &&
        item.value[0] < snapshotEnd &&
        item.value[2] > 0
    );


  console.log(
    "Snapshot:",
    snapshotIndex + 1
  );

  console.log(
    "Filtered snapshot data:",
    filteredSnapshotData.length
  );


  /*
    SHOW ALL ADDRESSES

    Previously, the addresses were generated
    only from addresses with activity.

    Now we use the complete addressLabels list.
  */
  const snapshotAddresses =
    addressLabels;


  console.log(
    "Snapshot addresses:",
    snapshotAddresses.length
  );


  /*
    Keep the original address indexes.

    Since snapshotAddresses contains ALL
    addresses in the same order as addressLabels,
    the indexes do not need to be compressed.
  */
  const addressIndexMap =
    Object.fromEntries(
      addressLabels.map(
        (_, index) => [
          index,
          index
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

          addressIndexMap[
            item.value[1]
          ],

          item.value[2]
        ]
      })
    );


  /*
    Calculate maximum intensity
    for the current snapshot.
  */
  const maxIntensity =
    snapshotData.reduce(
      (max, item) =>
        Math.max(
          max,
          item.value[2]
        ),
      1
    );


  const chartHeight = 700;


  const option = {

    animation: false,


    tooltip: {
    formatter: (params) => {
    const row = params.data.row;

    if (!row || row.isEmpty) {
      const timeIndex = params.data.value[0];

      return `
        <strong>No Activity</strong><br/>
        <b>Address</b>: ${row?.address ?? "Unknown"}<br/>
        <b>Time Window</b>: ${snapshotTimeLabels[timeIndex]}
      `;
    }

    return `
      <b>Address</b>: ${row.address}<br/>
      <b>Time Window</b>:
      ${row.time_window_start} -
      ${row.time_window_end} ns<br/>
      <b>Intensity</b>: ${row.intensity}<br/>
      <b>Total Transactions</b>: ${row.total_txns}
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

      data:
        snapshotTimeLabels,

      axisLabel: {

        /*
          Show every time label
        */
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

      /*
        ALL addresses are displayed.
      */
      data:
        snapshotAddresses,

      axisLabel: {

        /*
          Show EVERY address label.
        */
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
        progressive: 5000,
        progressiveThreshold: 10000,
        /*
          Only active cells are included
          in snapshotData.

          Inactive addresses still appear
          on the Y-axis because snapshotAddresses
          contains ALL addresses.
        */
        data:
          snapshotData.map(
            (item) => {
              /*
                Handle empty cells
              */
              if (
                item.row?.isEmpty
              ) {
                return {
                  ...item,
                  itemStyle: {
                    color:
                      "#111827",
                  },
                };
              }
              
              if (item.row?.threat_level === "Bus Starver") {
                return {
                  ...item,
                  itemStyle: {
                  color: "#ef4444",
                },
              };
            }

              return {
                  ...item,
                 itemStyle: {
                 color: "#3b82f6",
                },
              };
            }
          ),

        label: {
          show: false,
        },


        itemStyle: {
          borderWidth: 1,
          borderColor: (params) => {
            const row =
              params.data.row;
            if (
              !row ||
              row.isEmpty
            ) {
              return "#1f2d42";
            }
            if (row.classification === "Bus Starver") {
              return "#ef4444";
            }

            return getClassificationBorderColor(
              row.classification
        );
          },
        },


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
    Cell click handler
  */
  const onEvents = {
    click: (params) => {
      const row =
        params.data?.row;
      /*
        Ignore empty cells
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

          {" "} | {" "}

          Showing:

          {" "}

          {timeLabels[snapshotStart]}

          {" "} → {" "}

          {timeLabels[snapshotEnd - 1]}

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


      {/* Heatmap */}

      <div
        style={{

          overflowX:
            "auto",

          overflowY:
            "hidden",

          maxHeight:
            "750px",

          width:
            "100%",
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