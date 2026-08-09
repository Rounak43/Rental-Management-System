/**
 * Shared utility: build a full URL for any backend-served asset.
 *
 * Rules:
 *  - If the path is already a full URL (http/https), return it as-is.
 *  - Otherwise, prepend the backend origin derived from VITE_API_BASE_URL.
 *    e.g. '/uploads/products/img.jpg' → 'http://localhost:5001/uploads/products/img.jpg'
 */

// Strip the trailing "/api" part from the API base URL to get the server origin.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * @param {string|null|undefined} path  - e.g. '/uploads/products/img.jpg'
 * @param {string} [fallback='']        - URL to return when path is falsy
 * @returns {string}
 */
export const getImageUrl = (path, fallback = '') => {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_ORIGIN}${clean}`;
};

export default getImageUrl;
