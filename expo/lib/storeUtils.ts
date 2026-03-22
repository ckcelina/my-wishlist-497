export function normalizeStoreName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.(com|jo|sa|ae|uk|us|eg|kw|bh|qa|om|au|ca|de|fr|es|it|mx|br|in|pk|ng|ke|za|sg|my|ph|th|vn|id|jp|kr|cn|tw|nz|co\.uk|co\.in|co\.id|com\.au|com\.br|com\.mx|com\.tr|com\.sa|com\.eg)/g, " ")
    .replace(
      /\b(jordan|saudi|arabia|united arab emirates|uae|emirates|egypt|kuwait|bahrain|qatar|oman|lebanon|iraq|ksa|gcc|shop|store|online|official|express|delivery|market|markets|hypermarket|supermarket|pharmacy|megastore)\b/gi,
      " "
    )
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function storeMatchesAvailable(
  serpStore: string,
  availableStore: string
): boolean {
  const normSerp = normalizeStoreName(serpStore);
  const normAvail = normalizeStoreName(availableStore);
  if (!normSerp || !normAvail) return false;
  if (normSerp === normAvail) return true;
  const serpWords = normSerp.split(" ").filter((w) => w.length > 1);
  const availWords = normAvail.split(" ").filter((w) => w.length > 1);
  if (serpWords.length === 0 || availWords.length === 0) return false;
  const shorter =
    serpWords.length <= availWords.length ? serpWords : availWords;
  const longer =
    serpWords.length <= availWords.length ? availWords : serpWords;
  return shorter.every((w) => longer.includes(w));
}

export function extractUniqueStores(
  results: Array<{ store: string }>
): string[] {
  const seen = new Set<string>();
  return results
    .map((r) => r.store?.trim())
    .filter((s): s is string => Boolean(s) && s.length > 0)
    .filter((s) => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
}
