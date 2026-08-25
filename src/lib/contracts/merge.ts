export function mergeContractBody(
  template: string,
  values: Record<string, string | number | null | undefined>,
) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = values[key];
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  });
}

export const DEFAULT_CONTRACT_DISCLAIMER =
  "This is an operational draft. Garden House or an attorney should review the language before treating it as a legally binding contract.";
