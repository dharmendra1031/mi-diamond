const LEGACY_UPLOAD_PREFIX = "/uploads/";
const MEDIA_API_PREFIX = "/api/media/";

export function normalizeMediaUrl(url: string) {
  if (!url.startsWith(LEGACY_UPLOAD_PREFIX)) return url;
  return `${MEDIA_API_PREFIX}${url.slice(LEGACY_UPLOAD_PREFIX.length)}`;
}
