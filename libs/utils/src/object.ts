type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export function removeEmptyStrings<T>(obj: T) {
  const result: RecursivePartial<T> = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      if (value === "") continue;
      result[key] = value;
    } else if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const nested = removeEmptyStrings(value);
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}
