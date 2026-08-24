function HeatmapFilters({
  classificationFilter,
  setClassificationFilter,
  severityFilter,
  setSeverityFilter,
  addressFilter,
  setAddressFilter,
  addresses = [],
}) {
  const clearFilters = () => {
    setClassificationFilter("All");
    setSeverityFilter("All");
    setAddressFilter("All");
  };

  const filtersActive =
    classificationFilter !== "All" ||
    severityFilter !== "All" ||
    addressFilter !== "All";

  return (
    <section className="filters-card">

      {/* Header */}
      <div className="filters-header">
        <div>
          <div className="filters-eyebrow">
            TRAFFIC FILTERS
          </div>

          <h2>Filters</h2>
        </div>

        <div className="filters-status">
          {filtersActive ? "FILTERS ACTIVE" : "ALL TRAFFIC"}
        </div>
      </div>

      {/* Filter controls */}
      <div className="filters-row">

        {/* Classification */}
        <div className="filter-group">
          <label htmlFor="classification-filter">
            CLASSIFICATION
          </label>

          <select
            id="classification-filter"
            value={classificationFilter}
            onChange={(e) =>
              setClassificationFilter(e.target.value)
            }
          >
            <option value="All">
              All Classifications
            </option>

            <option value="Normal">
              Normal
            </option>

            <option value="Memory Prober">
              Memory Prober
            </option>

            <option value="Permission Violator">
              Permission Violator
            </option>

            <option value="Bus Starver">
              Bus Starver
            </option>
          </select>
        </div>

        {/* Severity */}
        <div className="filter-group">
          <label htmlFor="severity-filter">
            SEVERITY
          </label>

          <select
            id="severity-filter"
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value)
            }
          >
            <option value="All">
              All Severities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>
        </div>

        {/* Address */}
        <div className="filter-group">
          <label htmlFor="address-filter">
            ADDRESS
          </label>

          <select
            id="address-filter"
            value={addressFilter}
            onChange={(e) =>
              setAddressFilter(e.target.value)
            }
          >
            <option value="All">
              All Addresses
            </option>

            {addresses.map((address) => (
              <option
                key={address}
                value={address}
              >
                {address}
              </option>
            ))}
          </select>
        </div>

        {/* Clear */}
        <button
          className="clear-filters"
          onClick={clearFilters}
          disabled={!filtersActive}
        >
          Clear Filters
        </button>

      </div>
    </section>
  );
}

export default HeatmapFilters;