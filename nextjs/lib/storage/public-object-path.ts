export function getPublicObjectPath(publicUrl: string | null, bucket: string) {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex < 0) return null;

  const encodedPath = publicUrl.slice(markerIndex + marker.length).split(/[?#]/, 1)[0];
  if (!encodedPath) return null;

  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}
