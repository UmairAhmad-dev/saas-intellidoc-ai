import React from 'react';
import './DocumentUpload.css';

export default function DocumentUpload({ file, uploadStatus, totalChunks, onFileUpload }) {
  return (
    <div className="upload-card">
      <h2>1. Data Ingestion Layer</h2>
      <label className="dropzone">
        <span className="upload-icon">📄</span>
        <span className="main-text">Click to upload PDF</span>
        <span className="sub-text">ANN feature translation happens locally</span>
        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={onFileUpload} />
      </label>

      {file && (
        <div className="status-panel">
          <p className="file-name">Selected: {file.name}</p>
          <p className="status-text">{uploadStatus}</p>
          {totalChunks > 0 && (
            <p className="vector-count">
              Indexed Math Vectors: <span>{totalChunks}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}