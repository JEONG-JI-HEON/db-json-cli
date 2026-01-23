// 공통 에러 메시지
export const errorMessages = {
  // 인증 관련
  EMAIL_PASSWORD_REQUIRED: "이메일/비밀번호가 필요합니다",
  INVALID_CREDENTIALS: "인증 정보가 올바르지 않습니다",
  USER_ALREADY_EXISTS: "사용자가 이미 존재합니다",
  NO_TOKEN: "토큰이 없습니다",
  INVALID_TOKEN: "유효하지 않은 토큰입니다",

  // 리소스 관련
  RESOURCE_NOT_FOUND: "리소스를 찾을 수 없습니다",
  ITEM_NOT_FOUND: "찾을 수 없습니다",
  INVALID_BODY: "잘못된 본문입니다",

  // 작업 실패
  LOGIN_FAILED: "로그인에 실패했습니다",
  REGISTER_FAILED: "등록에 실패했습니다",
  FETCH_FAILED: "조회에 실패했습니다",
  CREATE_FAILED: "생성에 실패했습니다",
  UPDATE_FAILED: "수정에 실패했습니다",
  DELETE_FAILED: "삭제에 실패했습니다",
};

// 기본 인증 엔드포인트 스키마
export const authSchemas = {
  register: {
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
      400: {
        description: "필수 필드 누락",
        example: { message: errorMessages.EMAIL_PASSWORD_REQUIRED },
      },
      409: {
        description: "이미 존재하는 사용자",
        example: { message: errorMessages.USER_ALREADY_EXISTS },
      },
      500: {
        description: "서버 오류",
        example: { message: errorMessages.REGISTER_FAILED },
      },
    },
  },
  login: {
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
      400: {
        description: "필수 필드 누락",
        example: { message: errorMessages.EMAIL_PASSWORD_REQUIRED },
      },
      401: {
        description: "잘못된 인증 정보",
        example: { message: errorMessages.INVALID_CREDENTIALS },
      },
      500: {
        description: "서버 오류",
        example: { message: errorMessages.LOGIN_FAILED },
      },
    },
  },
};

// 리소스 엔드포인트 자동 생성 함수
export const generateResourceSchemas = (routeList) => {
  const schemas = [];

  routeList.forEach((r) => {
    const isPrivate = r.permission === "private";

    // GET /{resource}
    schemas.push({
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
            { id: 1, message: "예시 데이터" },
            { id: 2, message: "예시 데이터" },
          ],
        },
        401: { description: "인증 필요", example: { message: errorMessages.NO_TOKEN } },
        404: { description: "리소스를 찾을 수 없음", example: { message: errorMessages.RESOURCE_NOT_FOUND } },
        500: { description: "서버 오류", example: { message: errorMessages.FETCH_FAILED } },
      },
    });

    // GET /{resource}/:id
    schemas.push({
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
          example: { id: 1, message: "예시 데이터" },
        },
        401: { description: "인증 필요", example: { message: errorMessages.NO_TOKEN } },
        404: { description: "항목을 찾을 수 없음", example: { message: errorMessages.ITEM_NOT_FOUND } },
        500: { description: "서버 오류", example: { message: errorMessages.FETCH_FAILED } },
      },
    });

    // POST /{resource}
    schemas.push({
      id: `post-${r.key}`,
      method: "POST",
      path: `/${r.key}`,
      summary: `새 ${r.key} 생성`,
      description: `새로운 ${r.key} 항목을 생성합니다. ID는 자동으로 생성됩니다.`,
      auth: isPrivate,
      permission: r.permission,
      requestBody: {
        message: "여기에 메시지를 입력하세요",
      },
      responses: {
        200: {
          description: "생성 성공",
          example: { id: 4, message: "여기에 메시지를 입력하세요" },
        },
        400: { description: "잘못된 요청 본문", example: { message: errorMessages.INVALID_BODY } },
        401: { description: "인증 필요", example: { message: errorMessages.NO_TOKEN } },
        404: { description: "리소스를 찾을 수 없음", example: { message: errorMessages.RESOURCE_NOT_FOUND } },
        500: { description: "서버 오류", example: { message: errorMessages.CREATE_FAILED } },
      },
    });

    // PUT /{resource}/:id
    schemas.push({
      id: `put-${r.key}-id`,
      method: "PUT",
      path: `/${r.key}/:id`,
      summary: `${r.key} 수정`,
      description: `ID로 특정 ${r.key} 항목을 수정합니다.`,
      auth: isPrivate,
      permission: r.permission,
      parameters: [{ name: "id", in: "path", type: "number", description: "항목 ID", required: true }],
      requestBody: {
        message: "수정된 메시지",
      },
      responses: {
        200: {
          description: "수정 성공",
          example: { id: 1, message: "수정된 메시지" },
        },
        400: { description: "잘못된 요청 본문", example: { message: errorMessages.INVALID_BODY } },
        401: { description: "인증 필요", example: { message: errorMessages.NO_TOKEN } },
        404: { description: "항목을 찾을 수 없음", example: { message: errorMessages.ITEM_NOT_FOUND } },
        500: { description: "서버 오류", example: { message: errorMessages.UPDATE_FAILED } },
      },
    });

    // DELETE /{resource}/:id
    schemas.push({
      id: `delete-${r.key}-id`,
      method: "DELETE",
      path: `/${r.key}/:id`,
      summary: `${r.key} 삭제`,
      description: `ID로 특정 ${r.key} 항목을 삭제합니다.`,
      auth: isPrivate,
      permission: r.permission,
      parameters: [{ name: "id", in: "path", type: "number", description: "항목 ID", required: true }],
      responses: {
        200: {
          description: "삭제 성공",
          example: { id: 1, message: "삭제된 메시지" },
        },
        401: { description: "인증 필요", example: { message: errorMessages.NO_TOKEN } },
        404: { description: "항목을 찾을 수 없음", example: { message: errorMessages.ITEM_NOT_FOUND } },
        500: { description: "서버 오류", example: { message: errorMessages.DELETE_FAILED } },
      },
    });
  });

  return schemas;
};
