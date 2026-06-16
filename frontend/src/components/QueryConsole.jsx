import React from 'react';
import './QueryConsole.css';

export default function QueryConsole({ file, query, setQuery, loading, aiResults, onSearch }) {
  // Debug log to see exactly what is entering the component on every single render
  console.log("🔴 LIVE FRONTEND AI DATA RECEIPT:", aiResults);

  return (
    <div className="console-wrapper">
      <div className="console-card">
        <h2>2. Vector Space Interrogation</h2>
        <form onSubmit={onSearch} className="console-form">
          <input 
            type="text"
            placeholder={file ? "Ask anything about the document..." : "Please upload a PDF first to unlock console"}
            disabled={!file}
            className="console-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading || !file || !query.trim()} className="console-btn">
            {loading ? "Synthesizing..." : "Query AI"}
          </button>
        </form>
      </div>

      {aiResults && (
        <div className="results-container">
          
          {/* GENERATIVE ANSWER SECTION */}
          <div className="ai-response-card">
            <div className="ai-header">
              <span className="ai-badge">Gemini Synthesized Answer</span>
            </div>
            <div className="ai-text-box">
              {/* Force React to re-evaluate the string to bypass state caching */}
              {aiResults.ai_answer ? (
                <p className="ai-text" key={aiResults.ai_answer}>{aiResults.ai_answer}</p>
              ) : typeof aiResults === "string" ? (
                <p className="ai-text">{aiResults}</p>
              ) : (
                <pre style={{ color: '#ff4a4a', background: '#1e1e24', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
                  ⚠️ State Mismatch Debug Block: {JSON.stringify(aiResults)}
                </pre>
              )}
            </div>
          </div>

          <h3 className="section-title" style={{ marginTop: '20px' }}>Mathematical Context Verifications:</h3>
          
          {aiResults.matched_contexts?.map((context, index) => (
            <div key={`${index}-${context.slice(0,10)}`} className="vector-match-card">
              <div className="match-header">
                <span className="match-badge">Vector Distance Block #{index + 1}</span>
                <span className="page-badge">
                  Source Page: <strong>{aiResults.source_pages?.[index] || "1"}</strong>
                </span>
              </div>
              <p className="match-text">"{context}"</p>
            </div>
          ))}

          {(!aiResults.matched_contexts || aiResults.matched_contexts.length === 0) && (
            <p className="placeholder-text">No mathematical context segments retrieved.</p>
          )}
        </div>
      )}
    </div>
  );
}