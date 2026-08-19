import "../styles/dashboard.css";

import Heatmap from "../components/Heatmap";
import SemanticPanel from "../components/SemanticPanel";
import SelectedHeatmapCell from "../components/SelectedHeatmapCell";
import HeatmapFilters from "../components/HeatmapFilters";

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
        <div>
          <p className="eyebrow">Memory Heatmap</p>
          <h1>Spring Secure</h1>
        </div>

        <div className="connection-badge">
          <span className="connection-dot" />
          Connected
        </div>
      </header>

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