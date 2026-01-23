# db-json-cli

JSON 파일 기반의 즉시 사용 가능한 REST API 서버 + JWT 인증 + Swagger 스타일 문서화

---

## ✨ 특징

- 🚀 **즉시 시작**: JSON 파일만 있으면 바로 REST API 서버 실행
- 🔐 **JWT 인증**: 내장된 회원가입/로그인 시스템
- 📝 **자동 문서화**: Swagger 스타일 API 문서 자동 생성
- 🎯 **간단한 권한 관리**: public/private 리소스 관리
- 🔄 **CRUD 자동 생성**: GET, POST, PUT, DELETE 엔드포인트 자동 생성
- 🎨 **한글 지원**: 모든 에러 메시지 한글 제공

---

## 📦 설치

```bash
npm install -g db-json-cli
```

---

## 🚀 빠른 시작

### 1. JSON 파일 생성

`db.json` 파일을 생성하세요:

```json
{
  "users": [],
  "todos": [
    { "id": 1, "title": "할 일 1", "completed": false },
    { "id": 2, "title": "할 일 2", "completed": true }
  ],
  "posts": [{ "id": 1, "title": "첫 번째 글", "content": "내용" }],
  "rules": {
    "todos": "private",
    "posts": "public"
  }
}
```

### 2. 서버 실행

```bash
db-json-cli --db ./db.json --port 4000
```

### 3. API 문서 확인

브라우저에서 `http://localhost:4000` 접속하여 자동 생성된 API 문서를 확인하세요!

---

## 📖 JSON 구조

```json
{
  "users": [],                    // 회원 정보 (자동 관리)
  "리소스명1": [...],              // 데이터 리소스
  "리소스명2": [...],              // 데이터 리소스
  "rules": {                      // 접근 권한 설정
    "리소스명1": "private",        // 인증 필요
    "리소스명2": "public"          // 누구나 접근 가능
  }
}
```

### 필수 필드

- **users**: 회원 정보를 저장하는 배열 (시스템이 자동으로 관리)
- **rules**: 각 리소스의 접근 권한 설정

### 접근 권한

- `"private"`: JWT 토큰이 있어야만 접근 가능
- `"public"`: 누구나 접근 가능 (기본값)

---

## 🔑 인증 API

### 회원가입

```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**응답 (200 OK)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**에러 응답**

- `400`: 이메일/비밀번호가 필요합니다
- `409`: 사용자가 이미 존재합니다
- `422`: 올바른 이메일 형식이 아닙니다 / 비밀번호는 최소 8자 이상이어야 합니다

---

### 로그인

```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 (200 OK)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**에러 응답**

- `400`: 이메일/비밀번호가 필요합니다
- `401`: 인증 정보가 올바르지 않습니다

---

## 📡 리소스 API

### 전체 조회

```http
GET /{리소스명}
Authorization: Bearer <accessToken>  # private인 경우에만
```

**예시**

```http
GET /todos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**

```json
[
  { "id": 1, "title": "할 일 1", "completed": false },
  { "id": 2, "title": "할 일 2", "completed": true }
]
```

---

### 범위 조회 (페이지네이션)

```http
GET /{리소스명}?from=1&to=10
Authorization: Bearer <accessToken>  # private인 경우에만
```

**예시**

```http
GET /todos?from=1&to=5
```

---

### 단일 조회

```http
GET /{리소스명}/{id}
Authorization: Bearer <accessToken>  # private인 경우에만
```

**예시**

```http
GET /todos/1
```

**응답**

```json
{ "id": 1, "title": "할 일 1", "completed": false }
```

**에러 응답**

- `400`: 올바른 ID 형식이 아닙니다
- `404`: 찾을 수 없습니다

---

### 생성

```http
POST /{리소스명}
Authorization: Bearer <accessToken>  # private인 경우에만
Content-Type: application/json

{
  "title": "새로운 할 일",
  "completed": false
}
```

**응답 (200 OK)**

```json
{
  "id": 3,
  "title": "새로운 할 일",
  "completed": false
}
```

**에러 응답**

- `400`: 잘못된 본문입니다
- `401`: 토큰이 없습니다 (private 리소스)
- `413`: 요청 데이터가 너무 큽니다
- `422`: 필수 필드가 누락되었습니다

---

### 수정

```http
PUT /{리소스명}/{id}
Authorization: Bearer <accessToken>  # private인 경우에만
Content-Type: application/json

{
  "title": "수정된 할 일",
  "completed": true
}
```

**응답 (200 OK)**

```json
{
  "id": 1,
  "title": "수정된 할 일",
  "completed": true
}
```

**에러 응답**

- `400`: 잘못된 본문입니다
- `404`: 찾을 수 없습니다

---

### 삭제

```http
DELETE /{리소스명}/{id}
Authorization: Bearer <accessToken>  # private인 경우에만
```

**응답 (200 OK)**

```json
{
  "id": 1,
  "title": "삭제된 할 일",
  "completed": true
}
```

**에러 응답**

- `404`: 찾을 수 없습니다

---

## 🛠️ CLI 옵션

```bash
db-json-cli [옵션]
```

### 옵션

| 옵션            | 설명           | 기본값 |
| --------------- | -------------- | ------ |
| `--db <경로>`   | JSON 파일 경로 | 필수   |
| `--port <포트>` | 서버 포트      | 4000   |

### 예시

```bash
# 기본 사용
db-json-cli --db ./db.json

# 포트 지정
db-json-cli --db ./data/db.json --port 5000

# 절대 경로 사용
db-json-cli --db /home/user/data/db.json --port 8080
```

---

## 📚 에러 코드

| 상태 코드 | 의미             | 예시 메시지                   |
| --------- | ---------------- | ----------------------------- |
| 400       | 잘못된 요청      | 이메일/비밀번호가 필요합니다  |
| 401       | 인증 실패        | 토큰이 없습니다               |
| 403       | 권한 없음        | 접근이 금지되었습니다         |
| 404       | 찾을 수 없음     | 찾을 수 없습니다              |
| 409       | 충돌             | 사용자가 이미 존재합니다      |
| 413       | 페이로드 초과    | 요청 데이터가 너무 큽니다     |
| 422       | 유효성 검증 실패 | 올바른 이메일 형식이 아닙니다 |
| 500       | 서버 오류        | 서버 오류가 발생했습니다      |

---

## 💡 사용 예시

### 1. Todo 앱 백엔드

```json
{
  "users": [],
  "todos": [],
  "rules": {
    "todos": "private"
  }
}
```

```bash
db-json-cli --db ./todo-db.json --port 3000
```

### 2. 블로그 백엔드

```json
{
  "users": [],
  "posts": [],
  "comments": [],
  "rules": {
    "posts": "public",
    "comments": "private"
  }
}
```

```bash
db-json-cli --db ./blog-db.json --port 4000
```

### 3. 쇼핑몰 백엔드

```json
{
  "users": [],
  "products": [],
  "orders": [],
  "reviews": [],
  "rules": {
    "products": "public",
    "orders": "private",
    "reviews": "public"
  }
}
```

```bash
db-json-cli --db ./shop-db.json --port 5000
```

---

## 🎯 주요 기능

### 자동 ID 생성

새로운 항목을 생성할 때 ID는 자동으로 부여됩니다.

```http
POST /todos
Content-Type: application/json

{
  "title": "할 일"
}
```

→ 자동으로 `{ "id": 1, "title": "할 일" }` 생성

### 비밀번호 암호화

사용자 비밀번호는 bcrypt를 사용하여 자동으로 암호화됩니다.

### JWT 토큰

- **Access Token**: 인증에 사용 (짧은 만료 시간)
- **Refresh Token**: Access Token 갱신에 사용 (긴 만료 시간)

### 입력 검증

- 이메일 형식 검증
- 비밀번호 최소 길이 (8자)
- ID 형식 검증 (양의 정수)
- 쿼리 파라미터 검증
- 페이로드 크기 제한 (1MB)

---

## 🔧 개발 환경

### 요구사항

- Node.js 14.0.0 이상

### 의존성

- `express`: 웹 서버
- `jsonwebtoken`: JWT 인증
- `bcryptjs`: 비밀번호 암호화
- `cors`: CORS 처리

---

## 📄 라이선스

MIT © 2026 hitorigotoh

---
