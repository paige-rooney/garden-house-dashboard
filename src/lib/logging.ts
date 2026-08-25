type LogFields = Record<string, unknown>;

export function logInfo(message: string, fields: LogFields = {}) {
  console.info(JSON.stringify({ level: "info", message, ts: new Date().toISOString(), ...fields }));
}

export function logWarn(message: string, fields: LogFields = {}) {
  console.warn(JSON.stringify({ level: "warn", message, ts: new Date().toISOString(), ...fields }));
}

export function logError(message: string, fields: LogFields = {}) {
  console.error(JSON.stringify({ level: "error", message, ts: new Date().toISOString(), ...fields }));
}
