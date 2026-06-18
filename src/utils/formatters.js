export function formatCurrency(amount) {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatRelativeDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    return `in ${diffDays} days`;
  }

  if (diffDays === 1) {
    return "in 1 day";
  }

  if (diffDays === 0) {
    return "today";
  }

  if (diffDays === -1) {
    return "1 day ago";
  }

  return `${Math.abs(diffDays)} days ago`;
}
