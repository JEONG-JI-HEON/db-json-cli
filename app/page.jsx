"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UnlockOutlined, LockOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import styles from "./page.module.scss";

const SwaggerApiDocs = () => {
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [activeTab, setActiveTab] = useState({});
  const [authToken, setAuthToken] = useState("");
  const [responseData, setResponseData] = useState({});
  const [customBodies, setCustomBodies] = useState({});
  const [parameterValues, setParameterValues] = useState({});

  // API 정보 가져오기
  const { data: apiInfo, isLoading } = useQuery({
    queryKey: ["apiInfo"],
    queryFn: async () => {
      const res = await fetch("/api/info");
      if (!res.ok) throw new Error("API 정보를 불러오는데 실패했습니다");
      return res.json();
    },
  });

  // API 요청 mutation
  const apiMutation = useMutation({
    mutationFn: async ({ method, path, body }) => {
      const headers = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const options = { method, headers };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(`/api${path}`, options);
      const data = await res.json();
      return { status: res.status, data };
    },
    onSuccess: (result, variables) => {
      setResponseData((prev) => ({
        ...prev,
        [variables.endpointId]: result,
      }));
    },
    onError: (error, variables) => {
      setResponseData((prev) => ({
        ...prev,
        [variables.endpointId]: { status: "error", data: error.message },
      }));
    },
  });

  const toggleEndpoint = (id) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const setTab = (endpointId, tab) => {
    setActiveTab((prev) => ({
      ...prev,
      [endpointId]: tab,
    }));
  };

  const handleParameterChange = (endpointId, paramName, value) => {
    setParameterValues((prev) => ({
      ...prev,
      [endpointId]: {
        ...prev[endpointId],
        [paramName]: value,
      },
    }));
  };

  const buildRequestPath = (endpoint, endpointId) => {
    let path = endpoint.path;
    const params = parameterValues[endpointId] || {};
    const queryParams = [];

    if (endpoint.parameters) {
      endpoint.parameters.forEach((param) => {
        const value = params[param.name];

        if (value) {
          if (param.in === "path") {
            // path 파라미터 치환 (예: /:id -> /1)
            path = path.replace(`:${param.name}`, value);
          } else if (param.in === "query") {
            // query 파라미터 추가
            queryParams.push(`${param.name}=${encodeURIComponent(value)}`);
          }
        } else if (param.in === "path") {
          // path 파라미터가 비어있으면 기본값 사용
          path = path.replace(`:${param.name}`, "1");
        }
      });
    }

    // 쿼리 파라미터 추가
    if (queryParams.length > 0) {
      path += `?${queryParams.join("&")}`;
    }

    return path;
  };

  const executeRequest = (endpointId, endpoint) => {
    const path = buildRequestPath(endpoint, endpointId);
    const finalBody = customBodies[endpointId] ? JSON.parse(customBodies[endpointId]) : endpoint.requestBody;
    apiMutation.mutate({ endpointId, method: endpoint.method, path, body: finalBody });
  };

  const handleBodyChange = (endpointId, value) => {
    setCustomBodies((prev) => ({
      ...prev,
      [endpointId]: value,
    }));
  };

  if (isLoading) {
    return <div className={styles["loading-container"]}>로딩 중...</div>;
  }

  const { port, apiSchemas } = apiInfo;
  const endpoints = Object.values(apiSchemas);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles["header-content"]}>
          <h1>db-json-cli API</h1>
          <div className={styles["base-url"]}>Base URL: http://localhost:{port}</div>
        </div>
      </div>

      {/* Auth Token Input */}
      <div className={styles.content}>
        <div className={styles["auth-box"]}>
          <div className={styles["auth-header"]}>
            <LockOutlined /> Authorization Token (인증 필요 API용)
          </div>
          <input
            type="text"
            placeholder="Bearer token을 입력하세요..."
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            className={styles["auth-input"]}
          />
        </div>

        {/* Endpoints */}
        <div className={styles.endpoints}>
          <h2>📚 API Endpoints</h2>
          {endpoints.map((endpoint) => {
            const isExpanded = expandedEndpoints[endpoint.id];
            const currentTab = activeTab[endpoint.id] || "request";
            const response = responseData[endpoint.id];

            return (
              <div key={endpoint.id} className={styles["swagger-endpoint"]}>
                {/* Endpoint Header */}
                <div
                  onClick={() => toggleEndpoint(endpoint.id)}
                  className={`${styles["swagger-header"]} ${isExpanded ? styles.expanded : ""}`}
                >
                  <div className={styles["swagger-header-left"]}>
                    <span className={isExpanded ? styles["icon-down"] : styles["icon-right"]}>
                      {isExpanded ? <DownOutlined /> : <RightOutlined />}
                    </span>
                    <span className={`${styles["method-badge"]} ${styles[`method-${endpoint.method.toLowerCase()}`]}`}>
                      {endpoint.method}
                    </span>
                    <span className={styles["endpoint-path"]}>{endpoint.path}</span>
                    {endpoint.auth && (
                      <span className={`${styles["permission-badge"]} ${styles["permission-private"]}`}>
                        <LockOutlined /> 인증 필요
                      </span>
                    )}
                    {!endpoint.auth && endpoint.permission && (
                      <span className={`${styles["permission-badge"]} ${styles["permission-public"]}`}>
                        <UnlockOutlined /> 공개
                      </span>
                    )}
                  </div>
                  <span className={styles["endpoint-summary"]}>{endpoint.summary}</span>
                </div>

                {/* Endpoint Details */}
                {isExpanded && (
                  <div className={styles["swagger-details"]}>
                    <p className={styles["endpoint-description"]}>{endpoint.description}</p>

                    {/* Tabs */}
                    <div className={styles["swagger-tabs"]}>
                      <button
                        onClick={() => setTab(endpoint.id, "request")}
                        className={`${styles["tab-btn"]} ${currentTab === "request" ? styles.active : ""}`}
                      >
                        Request
                      </button>
                      <button
                        onClick={() => setTab(endpoint.id, "responses")}
                        className={`${styles["tab-btn"]} ${currentTab === "responses" ? styles.active : ""}`}
                      >
                        Responses
                      </button>
                    </div>

                    {/* Request Tab */}
                    {currentTab === "request" && (
                      <div className={styles["tab-content"]}>
                        {/* ✅ Parameters 입력 필드 */}
                        {endpoint.parameters && (
                          <div className={styles["params-section"]}>
                            <h4>Parameters</h4>
                            <div className={styles["params-inputs"]}>
                              {endpoint.parameters.map((param, idx) => (
                                <div key={idx} className={styles["param-input-row"]}>
                                  <label className={styles["param-label"]}>
                                    <code>{param.name}</code>
                                    {param.required && <span className={styles.required}>*</span>}
                                    <span className={styles["param-meta"]}>
                                      ({param.type}, {param.in})
                                    </span>
                                  </label>
                                  <input
                                    type={param.type === "number" ? "number" : "text"}
                                    placeholder={param.description}
                                    value={parameterValues[endpoint.id]?.[param.name] || ""}
                                    onChange={(e) => handleParameterChange(endpoint.id, param.name, e.target.value)}
                                    className={styles["param-input"]}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {endpoint.requestBody && (
                          <div className={styles["body-section"]}>
                            <h4>Request Body</h4>
                            <textarea
                              className={styles["body-editor"]}
                              value={customBodies[endpoint.id] || JSON.stringify(endpoint.requestBody, null, 2)}
                              onChange={(e) => handleBodyChange(endpoint.id, e.target.value)}
                              rows={10}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Responses Tab */}
                    {currentTab === "responses" && (
                      <div className={styles["tab-content"]}>
                        {Object.entries(endpoint.responses).map(([code, resp]) => (
                          <div key={code} className={styles["response-item"]}>
                            <div className={`${styles["response-header"]} ${styles[`status-${code[0]}xx`]}`}>
                              {code} - {resp.description}
                            </div>
                            <pre className={styles["code-block"]}>{JSON.stringify(resp.example, null, 2)}</pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Try It Out Section */}
                    <div className={styles["try-section"]}>
                      <button
                        onClick={() => executeRequest(endpoint.id, endpoint)}
                        className={styles["try-btn"]}
                        disabled={apiMutation.isPending}
                      >
                        ▶ {apiMutation.isPending ? "요청 중..." : "테스트하기"}
                      </button>

                      {/* Response Display */}
                      {response && (
                        <div className={styles["response-display"]}>
                          <h4>Response</h4>
                          <div
                            className={`${styles["response-status"]} ${styles[`status-${String(response.status)[0]}xx`]}`}
                          >
                            Status: {response.status}
                          </div>
                          <pre className={styles["code-block"]}>{JSON.stringify(response.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>♥</p>
      </div>
    </div>
  );
};

export default SwaggerApiDocs;
