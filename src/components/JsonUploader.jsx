import { useState } from "react";

export default function JsonUploader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setStatus("");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".json")) {
      setFile(null);
      setStatus("Please select a JSON file.");
      return;
    }

    setFile(selectedFile);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a JSON file first.");
      return;
    }

    setUploading(true);
    setStatus("Validating JSON...");

    try {
      const text = await file.text();

      JSON.parse(text);

      setStatus("Uploading data...");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: text,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.error ||
            "Upload failed"
        );
      }

      setStatus(
        "✓ Data updated successfully. Refresh the dashboard to see the new data."
      );

      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);

      setStatus(
        `Upload failed: ${error.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="data-management-card">

      {/* Header */}
      <div className="data-management-header">

        <div>
          <div className="data-management-eyebrow">
            DATA MANAGEMENT
          </div>

          <h2>
            Update Heatmap Data
          </h2>

          <p>
            Upload a new JSON dataset to update
            the dashboard.
          </p>
        </div>

        <div className="data-management-status">
          <span className="status-dot"></span>

          {file
            ? "FILE SELECTED"
            : "READY"}
        </div>

      </div>


      {/* Upload Controls */}
      <div className="upload-controls">

        <label className="file-picker">

          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            disabled={uploading}
          />

          <span className="file-picker-icon">
            +
          </span>

          <span>
            Choose JSON File
          </span>

        </label>


        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading
            ? "Uploading..."
            : "Upload Dataset"}
        </button>

      </div>


      {/* Selected File */}
      {file && (
        <div className="selected-file">

          <div className="file-check">
            ✓
          </div>

          <div className="selected-file-info">

            <strong>
              {file.name}
            </strong>

            <span>
              {(file.size / 1024).toFixed(1)} KB
            </span>

          </div>

        </div>
      )}


      {/* Status */}
      {status && (
        <div
          className={`upload-status ${
            status.startsWith("✓")
              ? "success"
              : status.startsWith("Upload failed")
              ? "error"
              : ""
          }`}
        >
          {status}
        </div>
      )}

    </section>
  );
}