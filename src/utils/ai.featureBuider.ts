
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
}: any) {

  const oldNum = Number(oldval?.value ?? 0);
  const newNum = Number(newval?.value ?? 0);

  const delta = Math.abs(newNum - oldNum)/100;

  let percent_change =
    oldNum === 0 ? 0 : (delta / oldNum) * 100;
    percent_change = Math.min(percent_change, 500);

  const hour = new Date(createdAt).getHours();

  const roleMap: any = {
    ADMIN: 0,
    MANAGER: 1
  };

  const recordTypeMap: any = {
    INVENTORY: 0,
    PRICES: 1,
    CONFIG: 2,
    LIMIT: 3
  };

  return {
    delta,
    percent_change,
    hour,
    role: roleMap[role],
    record_type: recordTypeMap[recordType]
  };
}

