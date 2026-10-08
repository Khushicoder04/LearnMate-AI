import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("learnmate-theme") === "dark";
  });

  // Update navbar when theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(localStorage.getItem("learnmate-theme") === "dark");
    };

    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";

    localStorage.setItem("learnmate-theme", newTheme);
    setDarkMode(!darkMode);

    // Notify other components in the same tab
    window.dispatchEvent(new Event("themeChange"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      className={`flex items-center justify-between border-b px-8 py-4 shadow-sm transition-colors duration-500 ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
          🧠
        </div>

        <div>
          <h1
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            LearnMate AI
          </h1>

          <p
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Personal Study Assistant
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">

        {/* Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className={`font-medium transition ${
            darkMode
              ? "text-indigo-400 hover:text-indigo-300"
              : "text-indigo-600 hover:text-indigo-700"
          }`}
        >
          Dashboard
        </button>

        {/* Profile */}
        <button
          className={`font-medium transition ${
            darkMode
              ? "text-gray-400 hover:text-indigo-400"
              : "text-gray-600 hover:text-indigo-600"
          }`}
        >
          Profile
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition ${
            darkMode
              ? "bg-slate-800 text-yellow-300 hover:bg-slate-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
            darkMode
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-900 hover:bg-gray-700"
          }`}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;