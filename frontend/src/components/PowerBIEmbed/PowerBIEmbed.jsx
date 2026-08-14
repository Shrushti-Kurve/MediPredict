import React, { useState, useEffect, useRef } from 'react';
import { 
  FaChartBar, 
  FaSyncAlt, 
  FaExpand, 
  FaCompress, 
  FaCog, 
  FaExternalLinkAlt, 
  FaShieldAlt, 
  FaInfoCircle, 
  FaTimes, 
  FaCheck,
  FaFilter
} from 'react-icons/fa';
import { POWER_BI_REPORTS } from '../../config/powerbiConfig';
import './PowerBIEmbed.css';

const PowerBIEmbed = ({ 
  role = 'doctor', 
  customTitle = null, 
  customUrl = null, 
  height = '620px' 
}) => {
  const reportConfig = POWER_BI_REPORTS[role] || POWER_BI_REPORTS.doctor;
  const containerRef = useRef(null);

  const [embedUrl, setEmbedUrl] = useState(() => {
    return localStorage.getItem(`powerbi_url_${role}`) || customUrl || reportConfig.defaultEmbedUrl || '';
  });

  const [tempUrl, setTempUrl] = useState(embedUrl);
  const [activeTab, setActiveTab] = useState('kpi');
  const [timeRange, setTimeRange] = useState('30D');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(embedUrl ? 'live' : 'preview'); // 'live' | 'preview'

  // Update viewMode if embedUrl changes
  useEffect(() => {
    if (embedUrl) {
      setViewMode('live');
    }
  }, [embedUrl]);

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
    }, 800);
  };

  // Save custom embed URL
  const handleSaveEmbedUrl = (e) => {
    e.preventDefault();
    setEmbedUrl(tempUrl.trim());
    localStorage.setItem(`powerbi_url_${role}`, tempUrl.trim());
    setConfigModalOpen(false);
    if (tempUrl.trim()) {
      setViewMode('live');
    }
  };

  // Clear custom embed URL
  const handleClearUrl = () => {
    setTempUrl('');
    setEmbedUrl('');
    localStorage.removeItem(`powerbi_url_${role}`);
    setViewMode('preview');
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
            <h3 className="pbi-report-title">{customTitle || reportConfig.title}</h3>
            <span className="pbi-report-id">Report ID: {reportConfig.reportId} • Category: {reportConfig.category}</span>
          </div>
        </div>

        <div className="pbi-actions">
          {/* View mode toggle button if embedUrl exists */}
          {embedUrl && (
            <div className="pbi-view-switch">
              <button 
                className={`pbi-switch-btn ${viewMode === 'live' ? 'active' : ''}`}
                onClick={() => setViewMode('live')}
                title="View Live Embedded Power BI Iframe"
              >
                Live Embed
              </button>
              <button 
                className={`pbi-switch-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
                title="View Simulated Analytics Preview"
              >
                Simulated Canvas
              </button>
            </div>
          )}

          {/* Time range selector in preview mode */}
          {viewMode === 'preview' && (
            <div className="pbi-time-filter">
              {['7D', '30D', '90D', 'YTD'].map(range => (
                <button
                  key={range}
                  className={`pbi-filter-chip ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          )}

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
            title="Configure Power BI Embed URL / Credentials"
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

      {/* Main Embed Viewport */}
      <div className="pbi-viewport" style={{ minHeight: height }}>
        {viewMode === 'live' && embedUrl ? (
          <div className="pbi-iframe-wrapper">
            <iframe
              title={reportConfig.title}
              src={embedUrl}
              className="pbi-iframe"
              frameBorder="0"
              allowFullScreen="true"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="pbi-simulated-canvas">
            {/* Live Analytics Banner */}
            <div className="pbi-status-banner">
              <div className="pbi-status-info">
                <FaShieldAlt className="pbi-status-icon" />
                <span>
                  <strong>Power BI Interactive Telemetry Canvas:</strong> {reportConfig.description}
                </span>
              </div>
              <div className="pbi-status-meta">
                <span>Last Refreshed: {lastRefreshed}</span>
                <span className="pbi-status-pill">Connected (Ready for Live Embed)</span>
              </div>
            </div>

            {/* Simulated Navigation Tabs */}
            <div className="pbi-tabs-bar">
              <button 
                className={`pbi-tab ${activeTab === 'kpi' ? 'active' : ''}`}
                onClick={() => setActiveTab('kpi')}
              >
                <FaChartBar /> Executive Overview
              </button>
              <button 
                className={`pbi-tab ${activeTab === 'trends' ? 'active' : ''}`}
                onClick={() => setActiveTab('trends')}
              >
                <FaFilter /> Clinical & Operational Trends
              </button>
              <button 
                className={`pbi-tab ${activeTab === 'geo' ? 'active' : ''}`}
                onClick={() => setActiveTab('geo')}
              >
                <FaInfoCircle /> Regional Distribution & Risk Matrix
              </button>
            </div>

            {/* KPI Metric Summary Cards */}
            <div className="pbi-metrics-grid">
              {reportConfig.metrics.map((metric, idx) => (
                <div key={idx} className="pbi-metric-card">
                  <div className="pbi-metric-header">
                    <span className="pbi-metric-label">{metric.label}</span>
                    <span className={`pbi-metric-badge ${metric.trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="pbi-metric-val">{metric.value}</div>
                  <div className="pbi-metric-bar-bg">
                    <div 
                      className={`pbi-metric-bar-fill ${metric.trend === 'up' ? 'fill-primary' : 'fill-accent'}`}
                      style={{ width: `${65 + (idx * 9) % 30}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Charts Area */}
            {activeTab === 'kpi' && (
              <div className="pbi-visuals-row">
                <div className="pbi-visual-card pbi-col-7">
                  <div className="pbi-visual-header">
                    <h4>Monthly Patient Velocity & Consultation Throughput ({timeRange})</h4>
                    <span className="pbi-visual-tag">Live Feed</span>
                  </div>
                  <div className="pbi-chart-placeholder">
                    <svg className="pbi-svg-chart" viewBox="0 0 500 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="pbiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0,130 Q70,90 140,110 T280,60 T400,80 T500,40 L500,180 L0,180 Z" 
                        fill="url(#pbiGrad)" 
                      />
                      <path 
                        d="M0,130 Q70,90 140,110 T280,60 T400,80 T500,40" 
                        fill="none" 
                        stroke="#0f766e" 
                        strokeWidth="3.5" 
                      />
                      {/* Data Points */}
                      <circle cx="0" cy="130" r="4" fill="#0f766e" />
                      <circle cx="140" cy="110" r="4" fill="#0f766e" />
                      <circle cx="280" cy="60" r="5" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                      <circle cx="400" cy="80" r="4" fill="#0f766e" />
                      <circle cx="500" cy="40" r="5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
                    </svg>
                    <div className="pbi-chart-axis">
                      <span>Week 1</span>
                      <span>Week 2</span>
                      <span>Week 3</span>
                      <span>Week 4</span>
                      <span>Current</span>
                    </div>
                  </div>
                </div>

                <div className="pbi-visual-card pbi-col-5">
                  <div className="pbi-visual-header">
                    <h4>Disease & Case Severity Distribution</h4>
                    <span className="pbi-visual-tag">Distribution</span>
                  </div>
                  <div className="pbi-distribution-list">
                    <div className="pbi-dist-item">
                      <div className="pbi-dist-info">
                        <span>Hypertension & Cardiac</span>
                        <span className="pbi-dist-pct font-weight-600">32%</span>
                      </div>
                      <div className="pbi-progress-track">
                        <div className="pbi-progress-bar" style={{ width: '32%', backgroundColor: '#0f766e' }}></div>
                      </div>
                    </div>

                    <div className="pbi-dist-item">
                      <div className="pbi-dist-info">
                        <span>Diabetes & Metabolic</span>
                        <span className="pbi-dist-pct font-weight-600">26%</span>
                      </div>
                      <div className="pbi-progress-track">
                        <div className="pbi-progress-bar" style={{ width: '26%', backgroundColor: '#2563eb' }}></div>
                      </div>
                    </div>

                    <div className="pbi-dist-item">
                      <div className="pbi-dist-info">
                        <span>Respiratory / Asthma</span>
                        <span className="pbi-dist-pct font-weight-600">21%</span>
                      </div>
                      <div className="pbi-progress-track">
                        <div className="pbi-progress-bar" style={{ width: '21%', backgroundColor: '#f59e0b' }}></div>
                      </div>
                    </div>

                    <div className="pbi-dist-item">
                      <div className="pbi-dist-info">
                        <span>Infectious & General</span>
                        <span className="pbi-dist-pct font-weight-600">21%</span>
                      </div>
                      <div className="pbi-progress-track">
                        <div className="pbi-progress-bar" style={{ width: '21%', backgroundColor: '#10b981' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="pbi-visuals-row">
                <div className="pbi-visual-card pbi-col-12">
                  <div className="pbi-visual-header">
                    <h4>Predictive Trend Analysis & Follow-up Compliance</h4>
                    <span className="pbi-visual-tag">ML Forecast Model</span>
                  </div>
                  <div className="pbi-forecast-grid">
                    <div className="pbi-forecast-item">
                      <span className="pbi-fc-label">Follow-up Adherence</span>
                      <span className="pbi-fc-val text-success">92.4%</span>
                      <p className="pbi-fc-desc">+6.1% compared to previous quarter baseline</p>
                    </div>
                    <div className="pbi-forecast-item">
                      <span className="pbi-fc-label">Predicted 30D Admissions</span>
                      <span className="pbi-fc-val text-primary">~184 Cases</span>
                      <p className="pbi-fc-desc">Seasonal surge forecasted in respiratory cases</p>
                    </div>
                    <div className="pbi-forecast-item">
                      <span className="pbi-fc-label">Medication Adherence Index</span>
                      <span className="pbi-fc-val text-secondary">87.9%</span>
                      <p className="pbi-fc-desc">Evaluated via pharmacy refill cycles</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'geo' && (
              <div className="pbi-visuals-row">
                <div className="pbi-visual-card pbi-col-12">
                  <div className="pbi-visual-header">
                    <h4>Rural Outreach & Regional Village Health Heatmap</h4>
                    <span className="pbi-visual-tag">Geographical GIS</span>
                  </div>
                  <div className="pbi-geo-table-wrapper">
                    <table className="pbi-geo-table">
                      <thead>
                        <tr>
                          <th>Village / Cluster</th>
                          <th>Registered Patients</th>
                          <th>Active Treatments</th>
                          <th>Critical Flags</th>
                          <th>Healthcare Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Village Rampur (Bihar)</strong></td>
                          <td>34 Patients</td>
                          <td>12 Active</td>
                          <td><span className="badge badge-warning">1 Critical</span></td>
                          <td><span className="badge badge-success">Optimal (94%)</span></td>
                        </tr>
                        <tr>
                          <td><strong>Village Pipra (MP)</strong></td>
                          <td>28 Patients</td>
                          <td>9 Active</td>
                          <td><span className="badge badge-info">0 Critical</span></td>
                          <td><span className="badge badge-success">Optimal (88%)</span></td>
                        </tr>
                        <tr>
                          <td><strong>Balarampur (West Bengal)</strong></td>
                          <td>41 Patients</td>
                          <td>18 Active</td>
                          <td><span className="badge badge-danger">2 Critical</span></td>
                          <td><span className="badge badge-warning">Moderate (76%)</span></td>
                        </tr>
                        <tr>
                          <td><strong>Navsar Village (Gujarat)</strong></td>
                          <td>19 Patients</td>
                          <td>6 Active</td>
                          <td><span className="badge badge-info">0 Critical</span></td>
                          <td><span className="badge badge-success">Optimal (91%)</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Embed Connect Notice */}
            <div className="pbi-footer-notice">
              <div className="pbi-notice-text">
                <FaInfoCircle />
                <span>
                  <strong>Connect Live Report:</strong> You can embed your real Power BI published report link or Azure Power BI iframe URL anytime by clicking the settings gear icon.
                </span>
              </div>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => { setTempUrl(embedUrl); setConfigModalOpen(true); }}
              >
                <FaExternalLinkAlt /> Enter Embed URL
              </button>
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
                <FaCog className="text-primary" /> Configure Power BI Embed
              </h3>
              <button className="modal-close-btn" onClick={() => setConfigModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveEmbedUrl}>
              <div className="modal-body">
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Paste the Microsoft Power BI <strong>"Publish to web" URL</strong>, Azure Power BI Embedded report URL, or iframe <code>src</code> attribute below.
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
                    Leave blank to use the simulated high-fidelity analytics canvas.
                  </small>
                </div>

                <div className="pbi-config-info-box">
                  <strong>How to obtain your Power BI Embed URL:</strong>
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '6px', fontSize: '0.85rem' }}>
                    <li>Open your report on Microsoft Power BI Service.</li>
                    <li>Go to <strong>File &gt; Embed report &gt; Website or portal</strong> (or <em>Publish to web</em>).</li>
                    <li>Copy the secure URL and paste it here.</li>
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
                    Clear & Switch to Preview
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
