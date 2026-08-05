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
  console.log("Last heatmap item:", heatmapData[heatmapData.length - 1]);


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
    Convert global heatmap coordinates
    into snapshot-local coordinates
  */
  const filteredSnapshotData =
    heatmapData.filter(
      (item) =>
        item.value[0] >= snapshotStart &&
        item.value[0] < snapshotEnd &&
        item.value[2] > 0
    );

  console.log("Snapshot:", snapshotIndex + 1);
  console.log("Filtered snapshot data:", filteredSnapshotData.length);

// Get only addresses with activity
  const snapshotAddressIndexes = [
    ...new Set(
      filteredSnapshotData.map(
        item => item.value[1]
      )
    )
  ];
  const snapshotAddresses =
    snapshotAddressIndexes.map(
      index => addressLabels[index]
    );

  console.log("Snapshot addresses:", snapshotAddresses.length);

// Create address index mapping
  const addressIndexMap =
    Object.fromEntries(
      snapshotAddressIndexes.map(
        (oldIndex, newIndex) => [
          oldIndex,
          newIndex
        ]
      )
    );
// Remap heatmap coordinates
  const snapshotData =
    filteredSnapshotData.map(
      item => ({
        ...item,

        value:[
        item.value[0] - snapshotStart,

        addressIndexMap[
        item.value[1]
      ],
        item.value[2]
      ]
    })
  );

  const maxIntensity = snapshotData.reduce(
    (max, item) =>
      Math.max(
        max,
        item.value[2]
      ),
    1
  );
  const chartHeight = 700;
  const chartWidth = "100%";

  const option = {
    animation: false,
    tooltip: {
      formatter: (params) => {
        const row = params.data.row;

        if (!row || row.isEmpty) {

          const timeIndex =
            params.data.value[0];
          return `
            <strong>No Activity</strong><br/>
            Address: ${row?.address ?? "Unknown"}<br/>
            Window:
            ${snapshotTimeLabels[timeIndex]}
          `;
        }

        const semanticItems =
          row.semantic
            ? row.semantic
                .map(
                  item => `• ${item}`
                )
                .join("<br/>")
            : "None";

        return `
          <strong>
            ${row.classification}
          </strong><br/><br/>

          <b>Address</b>:
          ${row.address}<br/>

          <b>Time Window</b>:
          ${row.time_window_start}
          -
          ${row.time_window_end} ns<br/>

          <b>Intensity</b>:
          ${row.intensity}<br/>

          <b>Total Transactions</b>:
          ${row.total_txns}<br/><br/>

          <b>Severity</b>:
          ${row.severity}<br/>

          <b>Threat Level</b>:
          ${row.threat_level}<br/>

          <b>Anomaly Score</b>:
          ${row.anomaly_score?.toFixed(3)}<br/>

          <b>AI Flag</b>:
          ${row.ai_flag ? "Yes" : "No"}<br/>

          <b>Matched Rule</b>:
          ${row.matched_rule}<br/><br/>

          <b>Semantic Analysis</b><br/>

          ${semanticItems}
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

    xAxis: {
      type: "category",
      data: snapshotTimeLabels,

      axisLabel: {
        interval: 5,
        rotate: 35,
      },
    },

    yAxis: {
      type: "category",
      data: snapshotAddresses,

      axisLabel: {
        interval: 5,
        fontSize: 10,
      },
    },

    visualMap: {
      min: 0,
      max: maxIntensity,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 10,

      inRange: {
        color: [
          "#facc15",
          "#dc2626",
        ],
      },
    },

    series: [
      {
        type: "heatmap",
        progressive: 5000,
        progressiveThreshold: 10000,

        data:
          snapshotData.map(
            (item) => {
              if(item.row?.isEmpty){
                return {
                  ...item,

                  itemStyle:{
                    color:"#111827",
                  },
                };
              }
              return item;
            }
          ),

        label:{
          show:false,
        },

        itemStyle:{
          borderWidth:1,
          borderColor:(params)=>{
            const row =
              params.data.row;

            if(!row || row.isEmpty){
              return "#1f2d42";
            }

            return getClassificationBorderColor(
              row.classification
            );
          },
        },

        emphasis:{
          itemStyle:{
            borderColor:"#ffffff",
            borderWidth:3,
          },
        },
      },
    ],
  };

  const onEvents = {
    click:(params)=>{
      const row =
        params.data?.row;

      if(!row || row.isEmpty){
        return;
      }

      if(typeof onCellSelect === "function"){
        onCellSelect(row);
      }
    },
  };

  if(heatmapData.length === 0){
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

  return (
    <section className="card">
      <div className="section-header">
        <h2>
          Memory Heatmap
        </h2>

        <p>
          Snapshot {snapshotIndex + 1}
          /
          {totalSnapshots}
          {" "}
          |
          Showing:
          {" "}
          {timeLabels[snapshotStart]}
          {" "}
          →
          {" "}
          {timeLabels[snapshotEnd - 1]}
        </p>
      </div>

      {/* Snapshot Navigator */}
      <div
        style={{
          display:"flex",
          alignItems:"center",
          gap:"15px",
          marginBottom:"15px",
        }}
      >
        <button
          disabled={
            snapshotIndex === 0
          }
          onClick={()=> 
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
          value={snapshotIndex}
          onChange={(e)=>
            setSnapshotIndex(
              Number(e.target.value)
            )
          }
          style={{
            flex:1,
          }}
        />
        <button
          disabled={
            snapshotIndex === totalSnapshots - 1
          }
          onClick={()=> 
            setSnapshotIndex(
              snapshotIndex + 1
            )
          }
        >
          Next ▶
        </button>
      </div>

      <div
        style={{
          overflowX:"auto",
          overflowY:"hidden",
          maxHeight:"750px",
          width:"100%",
        }}
      >
        <ReactECharts
          option={option}
          onEvents={onEvents}
          notMerge={true}
          lazyUpdate={true}
          style={{
            height:`${chartHeight}px`,
            width: "100%",
          }}
        />
      </div>

    </section>
  );
}
export default Heatmap;