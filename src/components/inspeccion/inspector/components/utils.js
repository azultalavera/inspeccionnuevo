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
  let filledScore = 0;

  fieldsArray.forEach((f) => {
    const rawVal = inspectorData[f.id];
    const val =
      rawVal && typeof rawVal === "object" && !Array.isArray(rawVal) && rawVal.value !== undefined
        ? rawVal.value
        : rawVal;

    // Regla especial: Calidad de Imagen alcanza el 100% al cargar 2 fotos (50% con 1 foto)
    if (f.id === "f-cal-img-fotos" || f.id?.includes("cal-img")) {
      let count = 0;
      if (Array.isArray(val)) {
        count = val.length;
      } else if (val && typeof val === "object") {
        if (Array.isArray(val.value)) count = val.value.length;
        else if (Array.isArray(val.photos)) count = val.photos.length;
      } else if (typeof val === "string" && val.startsWith("[")) {
        try {
          count = JSON.parse(val).length;
        } catch {
          count = 0;
        }
      }
      if (count >= 2) {
        filledScore += 1;
      } else if (count === 1) {
        filledScore += 0.5;
      }
      return;
    }

    if (val === undefined || val === null) return;

    if (Array.isArray(val)) {
      if (val.length > 0) filledScore += 1;
      return;
    }

    if (typeof rawVal === "object" && rawVal !== null && !Array.isArray(rawVal)) {
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          if (val.length > 0) filledScore += 1;
        } else if (String(val).trim() !== "") {
          filledScore += 1;
        }
        return;
      }
      if (rawVal.observado !== undefined && rawVal.observado !== false) {
        filledScore += 1;
        return;
      }
      return;
    }

    if (String(val).trim() !== "") {
      filledScore += 1;
    }
  });

  const percent = Math.min(100, Math.round((filledScore / total) * 100));
  const filled = Math.floor(filledScore);
  return { total, filled, percent };
};
