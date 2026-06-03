const rawBaseUrl = process.env.REACT_APP_BASE_URL || "https://social-media-server-eiad.onrender.com";

export const BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const buildApiUrl = (path) =>
  `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export default BASE_URL;