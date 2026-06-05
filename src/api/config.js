const rawBaseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

export const BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const buildApiUrl = (path) =>
  `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export default BASE_URL;