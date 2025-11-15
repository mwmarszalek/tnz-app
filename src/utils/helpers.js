export function formatDepartureLabel(label) {
  const open = label.indexOf("(");
  if (open === -1) return label;

  const time = label.substring(0, open).trim();
  const subtitle = label.substring(open).replace(/[()]/g, "").trim();

  return { time, subtitle };
}

export const getScheduleKey = (
  scheduleType,
  time,
  busNumber = "904",
  direction = "1"
) => {
  if (busNumber === "908") {
    return `${busNumber}_${direction}_${scheduleType}_${time}`;
  }
  return `${busNumber}_${scheduleType}_${time}`;
};

export function copyToClipboardFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
