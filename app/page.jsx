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

  const executeRequest = (endpointId, method, path, body = null) => {
    const finalBody = customBodies[endpointId] ? JSON.parse(customBodies[endpointId]) : body;
    apiMutation.mutate({ endpointId, method, path, body: finalBody });
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

  const { routeList, port } = apiInfo;

  const endpoints = [
    {
      id: "register",
      method: "POST",
      path: "/register",
      summary: "새 사용자 계정 등록",
      description: "이메일과 비밀번호로 새로운 사용자를 등록합니다.",
      auth: false,
      requestBody: {
        email: "user@example.com",
        password: "securepassword123",
        name: "John Doe",
      },
      responses: {
        200: {
          description: "성공적으로 등록됨",
          example: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
        400: { description: "필수 필드 누락", example: { message: "Email/password required" } },
        409: { description: "이미 존재하는 사용자", example: { message: "User already exists" } },
      },
    },
    {
      id: "login",
      method: "POST",
      path: "/login",
      summary: "로그인 및 액세스 토큰 받기",
      description: "이메일과 비밀번호로 로그인하여 JWT 토큰을 받습니다.",
      auth: false,
      requestBody: {
        email: "user@example.com",
        password: "securepassword123",
      },
      responses: {
        200: {
          description: "로그인 성공",
          example: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
        401: { description: "잘못된 인증 정보", example: { message: "Invalid credentials" } },
      },
    },
  ];

  // Add resource endpoints dynamically
  routeList.forEach((r) => {
    const isPrivate = r.permission === "private";

    endpoints.push({
      id: `get-${r.key}`,
      method: "GET",
      path: `/${r.key}`,
      summary: `모든 ${r.key} 조회`,
      description: `모든 ${r.key} 항목을 조회하거나 ID 범위로 필터링합니다.`,
      auth: isPrivate,
      permission: r.permission,
      count: r.count,
      parameters: [
        { name: "from", in: "query", type: "number", description: "시작 ID", required: false },
        { name: "to", in: "query", type: "number", description: "종료 ID", required: false },
      ],
      responses: {
        200: {
          description: "성공",
          example: [
            { id: 1, message: "good" },
            { id: 2, message: "good" },
          ],
        },
        401: { description: "인증 필요", example: { message: "No token" } },
      },
    });

    endpoints.push({
      id: `get-${r.key}-id`,
      method: "GET",
      path: `/${r.key}/:id`,
      summary: `특정 ${r.key} 조회`,
      description: `ID로 특정 ${r.key} 항목을 조회합니다.`,
      auth: isPrivate,
      permission: r.permission,
      parameters: [{ name: "id", in: "path", type: "number", description: "항목 ID", required: true }],
      responses: {
        200: {
          description: "성공",
          example: { id: 1, message: "good" },
        },
        401: { description: "인증 필요", example: { message: "No token" } },
        404: { description: "항목을 찾을 수 없음", example: { message: "Not found" } },
      },
    });

    endpoints.push({
      id: `post-${r.key}`,
      method: "POST",
      path: `/${r.key}`,
      summary: `새 ${r.key} 생성`,
      description: `새로운 ${r.key} 항목을 생성합니다. ID는 자동으로 생성됩니다.`,
      auth: isPrivate,
      permission: r.permission,
      requestBody: {
        message: "your message here",
      },
      responses: {
        200: {
          description: "생성 성공",
          example: { id: 4, message: "your message here" },
        },
        400: { description: "잘못된 요청 본문", example: { message: "Invalid body" } },
        401: { description: "인증 필요", example: { message: "No token" } },
      },
    });
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles["header-content"]}>
          <h1>🚀 db-json-cli API</h1>
          <p>RESTful JSON API Documentation - Swagger Style</p>
          <div className={styles["base-url"]}>Base URL: http://localhost:{port}</div>
        </div>
      </div>

      {/* Auth Token Input */}
      <div className={styles.content}>
        <div className={styles["auth-box"]}>
          <div className={styles["auth-header"]}>
            <LockOutlined /> Authorization Token (비공개 엔드포인트용)
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
                        {endpoint.parameters && (
                          <div className={styles["params-section"]}>
                            <h4>Parameters</h4>
                            <table className={styles["params-table"]}>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Type</th>
                                  <th>In</th>
                                  <th>Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {endpoint.parameters.map((param, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <code>{param.name}</code>
                                      {param.required && <span className={styles.required}>*</span>}
                                    </td>
                                    <td>{param.type}</td>
                                    <td>{param.in}</td>
                                    <td>{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
                        onClick={() => {
                          const path = endpoint.path.replace(/:id/, "1");
                          executeRequest(endpoint.id, endpoint.method, path, endpoint.requestBody);
                        }}
                        className={styles["try-btn"]}
                        disabled={apiMutation.isPending}
                      >
                        ▶ {apiMutation.isPending ? "요청 중..." : "Try it out"}
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
