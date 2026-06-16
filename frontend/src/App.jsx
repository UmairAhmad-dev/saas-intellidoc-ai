import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import QueryConsole from './components/QueryConsole';
import './App.css';

export default function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [totalChunks, setTotalChunks] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadStatus('Processing document vectors...');
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:5050/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus('✅ Document Ingested Into Vector Space!');
        setTotalChunks(data.total_ai_chunks);
      } else {
        setUploadStatus(`❌ Error: ${data.detail}`);
      }
    } catch (err) {
      setUploadStatus('❌ Connection to ML Engine failed.');
    }
  };

  const handleSearchQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5050/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      });
      const data = await response.json();
      
      if (response.ok) {
        // This passes the whole object containing ai_answer to state
        setAiResults(data); 
      } else {
        alert(`Error: ${data.detail}`);
      }
    } catch (err) {
      alert('Failed to fetch from Retrieval Engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SaaS Intellidoc AI</h1>
        <p>Production-Ready Full-Stack RAG Engine Using ANN & Cosine Distance</p>
      </header>

      <div className="dashboard-workspace">
        <DocumentUpload 
          file={file}
          uploadStatus={uploadStatus}
          totalChunks={totalChunks}
          onFileUpload={handleFileUpload}
        />
        
        <QueryConsole 
          file={file}
          query={query}
          setQuery={setQuery}
          loading={loading}
          aiResults={aiResults}
          onSearch={handleSearchQuery}
        />
      </div>
    </div>
  );
}