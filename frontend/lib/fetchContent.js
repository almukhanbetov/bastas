export async function fetchPageContent(apiUrl, page) {
  const res = await fetch(`${apiUrl}/api/v1/content/${page}`);
  if (!res.ok) {
    throw new Error(`content request failed: ${res.status}`);
  }
  const sections = await res.json();
  return Object.fromEntries(sections.map((s) => [s.sectionKey, s]));
}
