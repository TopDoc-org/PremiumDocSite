import { environment } from '../../environments/environment';

/**
 * Build a Cloudinary image URL with automatic format/quality and optional transforms.
 * @param publicId  e.g. 'knocdoc/jasbir/hero/profile'
 * @param transforms  e.g. 'w_600' or 'w_400,h_400,c_fill' (appended after f_auto,q_auto)
 */
export function cloudinaryUrl(publicId: string, transforms?: string): string {
  const base = environment.cloudinaryBaseUrl;
  const parts = ['f_auto', 'q_auto'];
  if (transforms) parts.push(transforms);
  return `${base}/${parts.join(',')}/${publicId}`;
}
