export const normalize = (str) =>
  str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim() || "";

export const getFlatFields = (sectionsObj) => {
  if (!sectionsObj) return [];
  if (Array.isArray(sectionsObj)) {
    return sectionsObj.reduce((acc, sec) => [...acc, ...(sec.fields || [])], []);
  }
  return [];
};

export const getCompletionStats = (fieldsArray, inspectorData) => {
  if (!fieldsArray || fieldsArray.length === 0)
    return { total: 0, filled: 0, percent: 100 };
  const total = fieldsArray.length;
  const filled = fieldsArray.filter((f) => {
    const val = inspectorData[f.id];
    if (val === undefined || val === null) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "object") {
      if (val.value !== undefined && val.value !== null) {
        if (Array.isArray(val.value)) return val.value.length > 0;
        return String(val.value).trim() !== "";
      }
      return val.observado !== undefined && val.observado !== false;
    }
    return String(val).trim() !== "";
  }).length;
  const percent = Math.round((filled / total) * 100);
  return { total, filled, percent };
};
