export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short", // gives "Jul"
    year: "numeric",
  });
}
