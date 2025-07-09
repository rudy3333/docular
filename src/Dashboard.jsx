import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

function Dashboard({ onLogout }) {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [summaryState, setSummaryState] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDocs = async () => {
    setLoadingDocs(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/list_pdfs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUploadedDocs(data.pdfs);
      } else {
        setUploadedDocs([]);
      }
    } catch (err) {
      setUploadedDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch("/upload_pdf", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadMessage({ type: "success", text: `Uploaded: ${data.filename}` });
        fetchDocs();
      } else {
        setUploadMessage({ type: "error", text: data.error || "Upload failed." });
      }
    } catch (err) {
      setUploadMessage({ type: "error", text: "Network error." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleStartChat = (doc) => {
    setChatMessages([]);
    setChatInput("");
    navigate(`/chat?id=${encodeURIComponent(doc.pdf_id)}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setChatMessages((msgs) => [...msgs, userMsg]);
    setSending(true);
    // TODO: Replace with real backend call
    setTimeout(() => {
      setChatMessages((msgs) => [
        ...msgs,
        { sender: "ai", text: "(Mock AI response for: " + chatInput + ")" }
      ]);
      setSending(false);
    }, 800);
    setChatInput("");
  };

  const handleBackToDocs = () => {
    setChatMessages([]);
    setChatInput("");
    navigate("/");
  };
  let activeDoc = null;
  if (location.pathname === '/chat') {
    const params = new URLSearchParams(location.search);
    const docId = params.get('id');
    if (docId && uploadedDocs.length > 0) {
      activeDoc = uploadedDocs.find(doc => String(doc.pdf_id) === String(docId));
    }
  }

  useEffect(() => {
    let pollTimeout;
    setSummaryState(null);
    setSummaryData(null);
    const fetchSummary = async () => {
      if (activeDoc && activeDoc.pdf_id) {
        try {
          const token = localStorage.getItem("token");
          const summaryRes = await fetch(`/pdf_summary/${activeDoc.pdf_id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const summaryData = await summaryRes.json();
          if (summaryData.success && summaryData.summary && chatMessages.length === 0) {
            let summaryText = summaryData.summary;
            if (typeof summaryText !== 'string') {
              if (summaryText && typeof summaryText === 'object' && 'value' in summaryText) {
                summaryText = summaryText.value;
              } else {
                summaryText = JSON.stringify(summaryText, null, 2);
              }
            }
            setChatMessages([
              { sender: "system", text: summaryText }
            ]);
          }
          const res = await fetch(`/pdf_content/${activeDoc.pdf_id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            if (data.summary && data.summary.state === "loading") {
              setSummaryState("loading");
              setSummaryData(null);
              pollTimeout = setTimeout(fetchSummary, 1000);
            } else if (data.summary && data.summary.state === "generated") {
              setSummaryState("generated");
              setSummaryData(data.summary);
              console.log("[OCR SUMMARY]", data.summary);
            } else {
              setSummaryState(null);
              setSummaryData(null);
              console.warn("Unexpected summary state:", data.summary);
            }
          } else {
            setSummaryState(null);
            setSummaryData(null);
            console.warn("Failed to fetch summary:", data.error);
          }
        } catch (err) {
          setSummaryState(null);
          setSummaryData(null);
          console.error("Error fetching summary:", err);
        }
      }
    };
    if (activeDoc && activeDoc.pdf_id) {
      fetchSummary();
    }
    return () => {
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [activeDoc]);

  return (
    <div className="dashboard" style={{ maxWidth: 900, margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px #0001" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>📄 Docular Dashboard</h2>
        <button className="cta-button" onClick={onLogout}>Logout</button>
      </header>
      {location.pathname !== '/chat' ? (
        <>
          <section style={{ marginTop: "2rem" }}>
            <h3>Upload a PDF</h3>
            <input type="file" accept="application/pdf" ref={fileInputRef} style={{ display: "none" }} onChange={handleUpload} />
            <button className="cta-button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>
            {uploadMessage && (
              <div style={{
                color: uploadMessage.type === "error" ? "red" : "#22c55e",
                background: uploadMessage.type === "success" ? "#e6ffe6" : uploadMessage.type === "error" ? "#ffe6e6" : "transparent",
                fontWeight: uploadMessage.type === "success" || uploadMessage.type === "error" ? "bold" : "normal",
                borderRadius: "4px",
                padding: "0.5rem 1rem",
                marginTop: "1rem",
                boxShadow: uploadMessage.type === "success"
                  ? "0 0 8px #22c55e55"
                  : uploadMessage.type === "error"
                  ? "0 0 8px #ff000055"
                  : "none"
              }}>
                {uploadMessage.text}
              </div>
            )}
          </section>
          <section style={{ marginTop: "2rem" }}>
            <h3>Your Documents</h3>
            {loadingDocs ? (
              <p>Loading documents...</p>
            ) : uploadedDocs.length === 0 ? (
              <p>No documents uploaded yet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {uploadedDocs.map(doc => (
                  <li key={doc.pdf_id} style={{ display: "flex", alignItems: "center", marginBottom: 12, background: "#f6f6f6", borderRadius: 6, padding: "0.5rem 1rem" }}>
                    <span style={{ flex: 1 }}>
                      {doc.filename}
                    </span>
                    <button className="cta-button" style={{ fontSize: "0.95rem", padding: "0.4rem 1.2rem" }} onClick={() => handleStartChat(doc)}>Chat</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section style={{ marginTop: "2rem" }}>
            <h3>Chat History</h3>
            <div style={{ background: "#f9f9f9", borderRadius: 6, minHeight: 80, padding: "1rem", color: "#888" }}>
              (Chat history will appear here after you start chatting with a document.)
            </div>
          </section>
        </>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 32 }}>
          <div style={{ flex: 1, minWidth: 320, maxWidth: 480, background: '#f6f6f6', borderRadius: 8, padding: 16, boxSizing: 'border-box', position: 'relative' }}>
            <button className="cta-button" style={{ marginBottom: 16 }} onClick={handleBackToDocs}>&larr; Back to Documents</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1.2rem', flex: 1 }} title={activeDoc && activeDoc.filename}>
                {activeDoc && activeDoc.filename}
              </h3>
              <button
                className="cta-button"
                title="Delete document"
                style={{
                  background: '#ff4d4f',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  minHeight: 28,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: 4
                }}
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`/delete_pdf/${activeDoc.pdf_id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await res.json();
                      if (data.success) {
                        handleBackToDocs();
                        fetchDocs();
                      } else {
                        alert('Failed to delete document: ' + (data.error || 'Unknown error'));
                      }
                    } catch (err) {
                      alert('Network error while deleting document.');
                    }
                  }
                }}
              >
                <span role="img" aria-label="Delete">🗑️</span>
              </button>
            </div>
            {activeDoc && activeDoc.attachments && activeDoc.attachments.length > 0 ? (
              <iframe
                src={activeDoc.attachments[0].url}
                title="PDF Preview"
                style={{ width: '100%', height: 500, border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}
              />
            ) : (
              <div style={{ color: '#888', padding: 24, textAlign: 'center' }}>
                (No PDF preview available)
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 320, maxWidth: 400, background: '#f9f9f9', borderRadius: 8, padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0 }}>Chat</h3>
            {summaryState === 'loading' && (
              <div style={{ textAlign: 'center', margin: '32px 0', color: '#888' }}>
                <div className="spinner" style={{ margin: '0 auto 16px', width: 40, height: 40, border: '4px solid #eee', borderTop: '4px solid #22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div>This document is being processed...</div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, maxHeight: 400 }}>
              {chatMessages.length === 0 && summaryState !== 'loading' ? (
                <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>
                  (No messages yet. Start the conversation!)
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{
                    margin: '8px 0',
                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      background: msg.sender === 'user' ? '#22c55e' : '#e6e6e6',
                      color: msg.sender === 'user' ? '#fff' : '#222',
                      borderRadius: 16,
                      padding: '8px 16px',
                      fontWeight: 'bold',
                      maxWidth: '80%',
                      wordBreak: 'break-word'
                    }}>{msg.text}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type your question..."
                style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                disabled={sending}
              />
              <button className="cta-button" type="submit" disabled={sending || !chatInput.trim()} style={{ minWidth: 80 }}>
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 