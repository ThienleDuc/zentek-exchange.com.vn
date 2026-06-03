import { REPO_URL } from '../services/api';

/**
 * Returns the proper product image URL.
 * If the path is a link (HTTP/HTTPS/data/blob), returns it as-is.
 * Otherwise, appends the path to REPO_URL/uploads/images/ (new uploads) or REPO_URL/uploads/products/ (legacy)
 */
export const getProductImageUrl = (path: string | null | undefined): string => {
  if (!path) return '/default-product.svg';
  
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('blob:') || 
    path.startsWith('data:')
  ) {
    return path;
  }
  
  // Clean up leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If it already has the upload folder prefix, append directly to REPO_URL
  if (cleanPath.startsWith('uploads/')) {
    return `${REPO_URL}/${cleanPath}`;
  }
  
  // Distinguish between legacy raw product filenames (e.g. asus-rog-1.jpg) and newly uploaded raw filenames (UUIDs).
  // Newly uploaded filenames (base64url of UUID) have a basename of exactly 48 characters.
  const filename = cleanPath.split('/').pop() || '';
  const nameWithoutExt = filename.split('.')[0] || '';
  
  if (nameWithoutExt.length === 48) {
    return `${REPO_URL}/uploads/images/${cleanPath}`;
  }
  
  // Default fallback: assume it is a legacy raw product filename (e.g. asus-rog-1.jpg)
  return `${REPO_URL}/uploads/products/${cleanPath}`;
};

/**
 * Returns the proper store logo URL.
 * If the path is a link, returns it as-is.
 * Otherwise, returns REPO_URL + path.
 */
export const getStoreLogoUrl = (path: string | null | undefined): string => {
  if (!path) return '/default-shop.svg';
  
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('blob:') || 
    path.startsWith('data:')
  ) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (cleanPath.startsWith('uploads/')) {
    return `${REPO_URL}/${cleanPath}`;
  }
  
  return `${REPO_URL}/uploads/images/${cleanPath}`;
};

/**
 * Returns the proper user avatar URL.
 * If the path is a link, returns it as-is.
 * Otherwise, returns REPO_URL + path.
 */
export const getUserAvatarUrl = (path: string | null | undefined): string => {
  if (!path) return '/default-avatar.svg';
  
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('blob:') || 
    path.startsWith('data:')
  ) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (cleanPath.startsWith('uploads/')) {
    return `${REPO_URL}/${cleanPath}`;
  }
  
  return `${REPO_URL}/uploads/images/${cleanPath}`;
};

/**
 * Returns the proper media URL for chat or reviews.
 * If the path is a link, returns it as-is.
 * Otherwise, returns REPO_URL + path under media folder.
 */
export const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('blob:') || 
    path.startsWith('data:')
  ) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (cleanPath.startsWith('uploads/')) {
    return `${REPO_URL}/${cleanPath}`;
  }
  
  return `${REPO_URL}/uploads/media/${cleanPath}`;
};

/**
 * Returns the proper document URL.
 * If the path is a link, returns it as-is.
 * Otherwise, returns REPO_URL + path under files folder.
 */
export const getDocumentUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  if (
    path.startsWith('http://') || 
    path.startsWith('https://') || 
    path.startsWith('blob:') || 
    path.startsWith('data:')
  ) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (cleanPath.startsWith('uploads/')) {
    return `${REPO_URL}/${cleanPath}`;
  }
  
  return `${REPO_URL}/uploads/files/${cleanPath}`;
};
