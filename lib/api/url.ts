export function getApiUrl(path: string | URL): string | URL {
  if (path instanceof URL || /^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_ADDRESS;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_ADDRESS is not configured");
  }

  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
