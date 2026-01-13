"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [routeList, setRouteList] = useState([]);
  const [port, setPort] = useState(4000);
  const [loading, setLoading] = useState(true);
  const [activeEndpoint, setActiveEndpoint] = useState(null);

  useEffect(() => {
    fetch("/api/info")
      .then((res) => res.json())
      .then((data) => {
        setRouteList(data.routeList);
        setPort(data.port);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load API info:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <div className="loading-container">Loading...</div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-size: 1.5rem;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="container">
        <div className="header">
          <div className="header-content">
            <h1>🚀 db-json-cli API</h1>
            <p>RESTful JSON API Documentation</p>
          </div>
        </div>

        <div className="content">
          <div className="info-box">
            <h2>📖 API Information</h2>
            <p>Welcome to the db-json-cli API. This API provides RESTful endpoints for managing your data.</p>
            <div className="base-url">Base URL: http://localhost:{port}</div>
          </div>

          <div className="endpoints">
            <h2>Available Endpoints</h2>

            {routeList.map((r) => (
              <div key={r.key}>
                <div
                  className={`endpoint-item ${activeEndpoint === `${r.key}-get` ? "active" : ""}`}
                  onClick={() => setActiveEndpoint(activeEndpoint === `${r.key}-get` ? null : `${r.key}-get`)}
                >
                  <div className="endpoint-header">
                    <span className="method-badge method-get">GET</span>
                    <span className="endpoint-path">/{r.key}</span>
                    <span className={`permission-badge permission-${r.permission}`}>
                      {r.permission === "public" ? "🔓" : "🔒"} {r.permission.toUpperCase()}
                    </span>
                    <span className="endpoint-count">
                      {r.count} {r.count === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="endpoint-description">
                    Retrieve all {r.key} or filter by ID range using ?from=1&to=10
                  </div>
                  {activeEndpoint === `${r.key}-get` && (
                    <div className="endpoint-actions">
                      <a
                        href={`/api/${r.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn btn-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Try it out
                      </a>
                    </div>
                  )}
                </div>

                <div className="endpoint-item">
                  <div className="endpoint-header">
                    <span className="method-badge method-get">GET</span>
                    <span className="endpoint-path">/{r.key}/:id</span>
                    <span className={`permission-badge permission-${r.permission}`}>
                      {r.permission === "public" ? "🔓" : "🔒"} {r.permission.toUpperCase()}
                    </span>
                  </div>
                  <div className="endpoint-description">Retrieve a specific item by ID</div>
                </div>

                <div className="endpoint-item">
                  <div className="endpoint-header">
                    <span className="method-badge method-post">POST</span>
                    <span className="endpoint-path">/{r.key}</span>
                    <span className={`permission-badge permission-${r.permission}`}>
                      {r.permission === "public" ? "🔓" : "🔒"} {r.permission.toUpperCase()}
                    </span>
                  </div>
                  <div className="endpoint-description">Create a new item (ID will be auto-generated)</div>
                </div>
              </div>
            ))}

            <div className="endpoint-item">
              <div className="endpoint-header">
                <span className="method-badge method-post">POST</span>
                <span className="endpoint-path">/register</span>
              </div>
              <div className="endpoint-description">Register a new user account</div>
            </div>

            <div className="endpoint-item">
              <div className="endpoint-header">
                <span className="method-badge method-post">POST</span>
                <span className="endpoint-path">/login</span>
              </div>
              <div className="endpoint-description">Login and receive access tokens</div>
            </div>
          </div>
        </div>

        <div className="footer">
          <p>Generated by db-json-cli • Made with ♥</p>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%);
          color: #333;
          min-height: 100vh;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 3rem 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
        }
        .header h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        .header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
        }
        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .info-box {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .info-box h2 {
          color: #667eea;
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
        }
        .info-box p {
          color: #666;
          line-height: 1.6;
        }
        .base-url {
          background: #f8f9fa;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-family: "Courier New", monospace;
          color: #333;
          display: inline-block;
          margin-top: 0.5rem;
        }
        .endpoints {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .endpoints h2 {
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #667eea;
        }
        .endpoint-item {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .endpoint-item:hover,
        .endpoint-item.active {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }
        .endpoint-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .method-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .method-get {
          background: #e7f5ff;
          color: #1971c2;
        }
        .method-post {
          background: #d3f9d8;
          color: #2f9e44;
        }
        .permission-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .permission-public {
          background: #d3f9d8;
          color: #2f9e44;
        }
        .permission-private {
          background: #ffd43b;
          color: #856404;
        }
        .endpoint-path {
          font-family: "Courier New", monospace;
          font-size: 1.1rem;
          color: #333;
          font-weight: 500;
        }
        .endpoint-count {
          margin-left: auto;
          background: #667eea;
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .endpoint-description {
          color: #666;
          line-height: 1.5;
        }
        .endpoint-actions {
          margin-top: 1rem;
        }
        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
          display: inline-block;
        }
        .btn-primary {
          background: #667eea;
          color: white;
        }
        .btn-primary:hover {
          background: #5568d3;
          transform: translateY(-1px);
        }
        .footer {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}
