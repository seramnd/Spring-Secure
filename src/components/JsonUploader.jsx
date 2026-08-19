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

      // Make sure the file contains valid JSON.
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

      setStatus(`Upload failed: ${error.message}`);

    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="json-uploader">
      <h2>Update Heatmap Data</h2>

      <p>
        Select a new heatmap JSON file to update the dashboard.
      </p>

      <input
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {file && (
        <p>
          Selected file: <strong>{file.name}</strong>
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload JSON"}
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}