import { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  Users,
  Settings,
  FileText
} from "lucide-react";
import "../../../assets/Freelancer/FindW/FindWork.css";
import Projects from "../../components/projectsCards";
import "../../../assets/style/theme.css"

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

export default function FindWork() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const toggleBtnRef = useRef(null);

  const menuItems = useMemo(
    () => [
      { icon: Home, label: "Bosh sahifa", path: "/" },
      { icon: Users, label: "Foydalanuvchilar", path: "/users" },
      { icon: FileText, label: "Hujjatlar", path: "/documents" },
      { icon: Settings, label: "Sozlamalar", path: "/settings" },
    ],
    [],
  );

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  // ESC bilan yopish
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Mobile overlay ochilganda scroll lock
  useEffect(() => {
    document.body.classList.toggle("no-scroll", sidebarOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [sidebarOpen]);

  const onMenuClick = (path) => {
    console.log("Navigate to:", path);
    // router bo'lsa navigate(path)
    closeSidebar();
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-is-open" : ""}`}>
      {/* Main */}
      <main
        id="main"
        className={`h-main ${sidebarOpen ? "h-main-open" : "h-main-closed"}`}
      >
        <section className="hed-section">
          <div className="hed-content">
            <h1 className="hed-title">UzWork</h1>
            <h2 className="hed-subtitle">
              O&apos;zbekistonning eng arzon freelance platformasi !
            </h2>
            <p className="hed-text">
              Biz bilan o&apos;z ishingizni boshlang — tez, xavfsiz va davomli
              tekin. 5 % komissiya • So&apos;mda to&apos;lov • Payme/Click bilan
              10 soniyada • Mahaliy mijoz va freelancerlar • Pul escrowda 100 %
              himoyalangan • Birinchi loyihangizga 0 % komissiya!
            </p>
          </div>
        </section>

        <section className="content">
          <Projects />
        </section>
      </main>
    </div>
  );
}







