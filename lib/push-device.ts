export function isPushDeviceId(value: unknown): value is string {
  return typeof value === "string" && value.length <= 191 && value.trim().length > 0;
}
