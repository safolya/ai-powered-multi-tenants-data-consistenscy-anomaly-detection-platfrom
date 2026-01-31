
export function extractNumericValue(
  value: any,
  recordType: string
): number {
  switch (recordType) {
    case "INVENTORY":
      return Number(value.quantity);

    case "PRICES":
      return Number(value.price);

    case "LIMIT":
      return Number(value.maxRequests);

    case "CONFIG":
      if (typeof value === "boolean") {
        return value ? 1 : 0;
      }
      if (typeof value === "number") {
        return value;
      }
      return 0;

    default:
      return 0;
  }
}



export function buildAIFeatures({
  oldval,
  newval,
  recordType,
  role,
  createdAt
}: {
  oldval: any;
  newval: any;
  recordType: string;
  role: string;
  createdAt: Date;
}) {
  const oldNum = extractNumericValue(oldval, recordType);
  const newNum = extractNumericValue(newval, recordType);

  const delta = Math.abs(oldNum - newNum);
  const percentChange =
    oldNum === 0 ? 0 : (delta / oldNum) * 100;

  const hour = new Date(createdAt).getHours();

  const roleMap: Record<string, number> = {
    ADMIN: 0,
    MANAGER: 1
  };

  const recordTypeMap: Record<string, number> = {
    INVENTORY: 0,
    PRICES: 1,
    CONFIG: 2,
    LIMIT: 3
  };

  return {
    delta,
    percent_change: percentChange,
    hour,
    role: roleMap[role],
    record_type: recordTypeMap[recordType]
  };
}
