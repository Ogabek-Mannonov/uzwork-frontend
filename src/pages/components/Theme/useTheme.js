import { useEffect, useState } from "react";

const STORAGE_KEY = "theme"; // "light" | "dark"

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
    document.body.classList.add("dark-mode");
  } else {
    root.removeAttribute("data-theme");
    document.body.classList.remove("dark-mode");
  }
}

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, setTheme, toggle, isDark: theme === "dark" };
}