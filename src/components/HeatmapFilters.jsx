function HeatmapFilters({
  classificationFilter,
  setClassificationFilter,
  severityFilter,
  setSeverityFilter,
  addressFilter,
  setAddressFilter,
  addresses = [],
}) {
  return (
    <section className="card">
      <h2>Filters</h2>

      <div className="filter-row">

        <select
          value={classificationFilter}
          onChange={(e) =>
            setClassificationFilter(e.target.value)
          }
        >
          <option value="All">All Classifications</option>
          <option value="Normal">Normal</option>
          <option value="Memory Prober">Memory Prober</option>
          <option value="Permission Violator">
            Permission Violator
          </option>
          <option value="Bus Starver">Bus Starver</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) =>
            setSeverityFilter(e.target.value)
          }
        >
          <option value="All">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={addressFilter}
          onChange={(e) =>
            setAddressFilter(e.target.value)
          }
        >
          <option value="All">All Addresses</option>

          {addresses.map((address) => (
            <option key={address} value={address}>
              {address}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setClassificationFilter("All");
            setSeverityFilter("All");
            setAddressFilter("All");
          }}
        >
          Clear Filters
        </button>

      </div>
    </section>
  );
}

export default HeatmapFilters;