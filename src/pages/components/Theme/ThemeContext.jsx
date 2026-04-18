import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "theme"; 

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  });

  const applyTheme = (t) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.setAttribute("data-theme", "dark");
      document.body.classList.add("dark-mode", "dark");
      document.body.classList.remove("light-mode", "light");
    } else {
      root.setAttribute("data-theme", "light");
      document.body.classList.remove("dark-mode", "dark");
      document.body.classList.add("light-mode", "light");
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
