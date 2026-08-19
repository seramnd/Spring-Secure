import "../styles/dashboard.css";

import Heatmap from "../components/Heatmap";
import SemanticPanel from "../components/SemanticPanel";
import SelectedHeatmapCell from "../components/SelectedHeatmapCell";
import HeatmapFilters from "../components/HeatmapFilters";
import JsonUploader from "../components/JsonUploader";

import { dashboardData } from "../data/dashboardData";
import { useTrafficData } from "../hooks/useTrafficData";
import SnapshotNavigator from "../components/SnapshotNavigator";

function Dashboard() {
  const {
    loading,
    error,

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

    currentWindowIndex,
    currentWindow,
    snapshotWindows,
    currentWindowRows,
    goToPreviousWindow,
    goToNextWindow,
  } = useTrafficData();

  if (loading) return <main>Loading classified heatmap data...</main>;

  if (error) return <main>Error: {error}</main>;

  return (
    <main className="dashboard">
      <header className="app-header">
        <div className="header-title">
          <p className="eyebrow">MEMORY HEATMAP</p>
          <h1>Spring Secure</h1>
          <p className="header-subtitle">
           AXI4 Traffic Visualization & AI Monitoring
          </p>
        </div>

        <div className="connection-badge">
          <span className="connection-dot" />
          Connected
        </div>
      </header>

      <section className="data-management-card">
        <div className="data-management-header">
        <div>
          <p className="section-eyebrow">DATA MANAGEMENT</p>
          <h2>Update Heatmap Data</h2>
          <p>
          Upload a new JSON dataset to update the dashboard.
          </p>
        </div>

        <div className="upload-icon">
         ↥
      </div>
    </div>

      <JsonUploader />
  </section>

      <HeatmapFilters
        classificationFilter={classificationFilter}
        setClassificationFilter={setClassificationFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        addressFilter={addressFilter}
        setAddressFilter={setAddressFilter}
        addresses={addresses}
      />

      <div className="heatmap-container">
        <Heatmap
          rows={filteredRows}
          onCellSelect={setSelectedCell}
        />
      </div>

     <div className="analysis-grid">
      <SelectedHeatmapCell 
        selectedCell={selectedCell} 
      />
      <SemanticPanel 
        semantic={selectedCell?.semantic}
        selectedCell={selectedCell}
      />
    </div>


    </main>
  );
}

export default Dashboard;