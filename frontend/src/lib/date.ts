export const formatDisplayDate = (
  value: string | Date,
  locale: string = "en-US"
): string => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(locale, {
    timeZone: "UTC"
  });
};