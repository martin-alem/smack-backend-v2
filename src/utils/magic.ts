export const response_code = {
  CREATED: 201,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NO_CONTENT: 204,
  SUCCESS: 200,
};

export const error_codes = {
  EBR: "EBR", // Bad request
  EUA: "EUA", // Unauthorized user
  ESE: "ESE", // internal server error
};

export const success_codes = {
  SLP: "SLP", // login successful
  SUD: "SUD", // unauthorized device
};

export const config = {
  LOGIN_DURATION: 24,
  JWT_EXP: "5h",
  CODE_LENGTH: 6,
  V_CODE_EXP: 5,
  V_MSG: "your smack verification code",
};