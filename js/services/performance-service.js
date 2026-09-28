const EMPTY_RECORDS = Object.freeze([]);

/** Cria um índice efêmero para leituras locais repetidas, sem alterar registros. */
export function indexRecordsBy(records, key = "productId") {
  if (!Array.isArray(records)) throw new TypeError("Records must be an array.");
  const index = new Map();
  for (const record of records) {
    const value = record?.[key];
    if (value === undefined || value === null || value === "") continue;
    const group = index.get(value);
    if (group) group.push(record);
    else index.set(value, [record]);
  }
  return index;
}

export function indexedRecords(index, value) {
  if (!(index instanceof Map)) throw new TypeError("Index must be a Map.");
  return index.get(value) ?? EMPTY_RECORDS;
}
