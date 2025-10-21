# db-json-cli

JSON file 기반의 백엔드 서버 + JWT 인증 + CLI 도구

---

## 📦 설치

```bash
npm install -g db-json-cli
```

---

## 🚀 사용법

### 1. 서버 시작

```bash
db-json-cli --db ./path/to/db.json --port 4000
```

- `--db` : JSON 파일 경로
- `--port` : 서버 포트 (기본 4000)

---

### 2. JSON 구조

```json
{
  "users": [],
  "list": [{ "id": 1, "title": "Private item" }],
  "public": [{ "id": 1, "title": "Public item" }],
  "rules": {
    "list": "private",
    "public": "public"
  }
}
```

- `users` : 회원 정보 저장
- `list` : 인증 필요 데이터 ex)
- `public` : 누구나 접근 가능한 데이터 ex)
- `rules` : 각 키의 접근 권한 설정 (`private` 또는 `public`)

---

### 3. API

#### 회원가입

```http
POST /register
Content-Type: application/json

{
  "email": "example@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

응답:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

#### 로그인

```http
POST /login
Content-Type: application/json

{
  "email": "example@example.com",
  "password": "password123"
}
```

응답:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

#### 데이터 조회

- **인증 필요 데이터** (`private`)

```http
GET /list/1
Authorization: Bearer <accessToken>
```

- **인증 불필요 데이터** (`public`)

```http
GET /public/1
```

- 여러 아이템 조회 시 범위 지정 가능

```http
GET /list?from=1&to=10
```

---

### 4. CLI 옵션

```bash
db-json-cli --db ./src/db/db.json --port 5000
```

- `--db` : JSON 파일 경로
- `--port` : 포트

---

### 5. 라이선스

MIT © 2025 정지헌
