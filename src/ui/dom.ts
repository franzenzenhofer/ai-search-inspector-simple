export const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

export const setHtml = (element: HTMLElement | null, html: string): void => {
  if (element) element.innerHTML = html;
};

export const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const formatJson = (text: string): string => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

export const formatDate = (timestamp?: number | null): string =>
  (!timestamp ? "" : new Date(timestamp * 1000).toLocaleDateString());

export const flashText = (element: HTMLElement | null, next: string, fallback: string): void => {
  if (!element) return;
  element.textContent = next;
  setTimeout(() => { element.textContent = fallback; }, 1500);
};

const styleToast = (toast: HTMLElement): void => {
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "12px",
    right: "12px",
    background: "#0b57d0",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  });
};

const ensureToast = (): HTMLElement => {
  const existing = document.getElementById("toast-banner");
  if (existing) return existing;
  const toast = document.createElement("div");
  toast.id = "toast-banner";
  styleToast(toast);
  document.body.appendChild(toast);
  return toast;
};

export const showToast = (message: string): void => {
  const toast = ensureToast();
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(() => { toast.style.opacity = "0"; }, 1200);
};
