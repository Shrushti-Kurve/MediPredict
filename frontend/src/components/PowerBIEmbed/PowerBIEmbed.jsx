import React, { useState, useEffect, useRef } from 'react';
import { 
  FaChartBar, 
  FaSyncAlt, 
  FaExpand, 
  FaCompress, 
  FaCog, 
  FaExternalLinkAlt, 
  FaTimes, 
  FaCheck,
  FaFileCode
} from 'react-icons/fa';
import { 
  POWER_BI_REPORTS, 
  POWER_BI_TITLES, 
  POWER_BI_CATEGORIES 
} from '../../config/powerbiConfig';
import './PowerBIEmbed.css';

const PowerBIEmbed = ({ 
  role = 'doctor', 
  customTitle = null, 
  customUrl = null, 
  height = '680px' 
}) => {
  const defaultTitle = POWER_BI_TITLES[role] || 'Power BI Dashboard';
  const defaultCategory = POWER_BI_CATEGORIES[role] || 'Healthcare Analytics';
  const containerRef = useRef(null);

  const [embedUrl, setEmbedUrl] = useState(() => {
    return localStorage.getItem(`powerbi_url_${role}`) || customUrl || POWER_BI_REPORTS[role] || '';
  });

  const [tempUrl, setTempUrl] = useState(embedUrl);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  useEffect(() => {
    const configuredUrl = localStorage.getItem(`powerbi_url_${role}`) || customUrl || POWER_BI_REPORTS[role] || '';
    setEmbedUrl(configuredUrl);
    setTempUrl(configuredUrl);
  }, [role, customUrl]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  };

  // Save custom embed URL
  const handleSaveEmbedUrl = (e) => {
    e.preventDefault();
    const cleanUrl = tempUrl.trim();
    setEmbedUrl(cleanUrl);
    if (cleanUrl) {
      localStorage.setItem(`powerbi_url_${role}`, cleanUrl);
    } else {
      localStorage.removeItem(`powerbi_url_${role}`);
    }
    setConfigModalOpen(false);
  };

  // Clear custom embed URL
  const handleClearUrl = () => {
    setTempUrl('');
    setEmbedUrl('');
    localStorage.removeItem(`powerbi_url_${role}`);
    setConfigModalOpen(false);
  };

  return (
    <div 
      className={`pbi-container ${isFullscreen ? 'pbi-fullscreen' : ''}`} 
      ref={containerRef}
    >
      {/* Power BI Embed Top Bar */}
      <div className="pbi-topbar">
        <div className="pbi-title-group">
          <div className="pbi-badge-brand">
            <span className="pbi-dot"></span>
            <span className="pbi-brand-text">Power BI Embedded</span>
          </div>
          <div className="pbi-titles">
            <h3 className="pbi-report-title">{customTitle || defaultTitle}</h3>
            <span className="pbi-report-id">{defaultCategory}</span>
          </div>
        </div>

        <div className="pbi-actions">
          <button 
            className={`pbi-icon-btn ${isRefreshing ? 'pbi-spinning' : ''}`} 
            onClick={handleRefresh} 
            title="Refresh Power BI Report"
            aria-label="Refresh Report"
          >
            <FaSyncAlt />
          </button>

          <button 
            className="pbi-icon-btn" 
            onClick={() => { setTempUrl(embedUrl); setConfigModalOpen(true); }}
            title="Configure Power BI Embed URL"
            aria-label="Settings"
          >
            <FaCog />
          </button>

          <button 
            className="pbi-icon-btn" 
            onClick={toggleFullscreen} 
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label="Fullscreen"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="pbi-viewport" style={{ minHeight: height }}>
        {embedUrl ? (
          <div className="pbi-iframe-wrapper">
            <iframe
              title={customTitle || defaultTitle}
              src={embedUrl}
              className="pbi-iframe"
              frameBorder="0"
              allowFullScreen="true"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="pbi-placeholder-container">
            <div className="pbi-placeholder-card">
              <div className="pbi-placeholder-icon-wrapper">
                <FaChartBar className="pbi-placeholder-icon" />
              </div>
              
              <h2 className="pbi-placeholder-title">Power BI Dashboard</h2>
              <p className="pbi-placeholder-subtitle">
                Power BI report will be available here.
              </p>

              <div className="pbi-placeholder-guide-box">
                <div className="pbi-guide-header">
                  <FaFileCode className="pbi-guide-icon" />
                  <span>Centralized Configuration File</span>
                </div>
                <p className="pbi-guide-text">
                  To connect your real Power BI Embedded report, paste your report/embed URL into:
                </p>
                <div className="pbi-code-snippet">
                  <code>src/config/powerbiConfig.js</code>
                </div>
                <div className="pbi-code-example">
                  <pre>{`POWER_BI_REPORTS = {
  ${role}: "YOUR_POWER_BI_EMBED_URL"
}`}</pre>
                </div>
              </div>

              <div className="pbi-placeholder-actions">
                <button 
                  type="button" 
                  className="btn btn-primary pbi-action-btn"
                  onClick={() => { setTempUrl(embedUrl); setConfigModalOpen(true); }}
                >
                  <FaExternalLinkAlt /> Enter / Test Power BI Embed URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONFIGURE EMBED URL MODAL */}
      {configModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCog className="text-primary" /> Configure Power BI Embed URL
              </h3>
              <button className="modal-close-btn" onClick={() => setConfigModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveEmbedUrl}>
              <div className="modal-body">
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Paste the Microsoft Power BI <strong>"Publish to web" URL</strong>, Azure Power BI Embedded report URL, or iframe <code>src</code> attribute below for the <strong>{defaultTitle}</strong>.
                </p>

                <div className="form-group">
                  <label htmlFor="pbiUrl" style={{ fontWeight: 600 }}>Power BI Embed URL</label>
                  <input
                    type="url"
                    id="pbiUrl"
                    className="form-control"
                    placeholder="https://app.powerbi.com/reportEmbed?reportId=...&autoAuth=true..."
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                  />
                  <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>
                    Leave blank to show the clean Power BI placeholder.
                  </small>
                </div>

                <div className="pbi-config-info-box">
                  <strong>How to obtain your Power BI Embed URL:</strong>
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '6px', fontSize: '0.85rem' }}>
                    <li>Open your report on Microsoft Power BI Service.</li>
                    <li>Go to <strong>File &gt; Embed report &gt; Website or portal</strong> (or <em>Publish to web</em>).</li>
                    <li>Copy the secure URL and paste it here or in <code>src/config/powerbiConfig.js</code>.</li>
                  </ol>
                </div>
              </div>
              <div className="modal-footer">
                {embedUrl && (
                  <button 
                    type="button" 
                    className="btn btn-outline-danger" 
                    onClick={handleClearUrl}
                    style={{ marginRight: 'auto' }}
                  >
                    Clear URL (Show Placeholder)
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setConfigModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaCheck /> Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerBIEmbed;
