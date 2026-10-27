import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  
  const googleButtonRef = useRef(null);

  const handleGoogleCredential = async (response) => {
    try {
      setError("");
      setLoading(true);

      const result = await axios.post(
        "https://learnmate-ai-52yg.onrender.com/api/auth/google",
        { credential: response.credential }
      );

      localStorage.setItem("token", result.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      setError(
        error.response?.data?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("learnmate-theme") === "dark";
  });

  
useEffect(() => {
  let cancelled = false;

  const initializeGoogleLogin = () => {
    console.log(
  "Google Client ID available:",
  Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
);

    if (
      cancelled ||
      !window.google?.accounts?.id ||
      !googleButtonRef.current
    ) {
      return;
    }

    googleButtonRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });

    window.google.accounts.id.renderButton(
      googleButtonRef.current,
      {
        theme: darkMode ? "filled_black" : "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 320,
      }
    );
  };

  if (window.google?.accounts?.id) {
    initializeGoogleLogin();
  } else {
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleLogin;
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", initializeGoogleLogin);
    }
  }

  return () => {
    cancelled = true;
  };
}, [darkMode]);


  useEffect(() => {
    localStorage.setItem(
      "learnmate-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://learnmate-ai-52yg.onrender.com/api/login",
        formData
      );

      localStorage.setItem("token", response.data.token);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative isolate min-h-screen overflow-hidden transition-colors duration-500 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-gray-900"
      }`}
    >
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className={`absolute -left-32 -top-32 h-80 w-80 rounded-full blur-3xl transition-all duration-700 ${
            darkMode ? "bg-indigo-600/20" : "bg-indigo-300/30"
          } animate-pulse`}
        />

        <div
          className={`absolute -bottom-40 -right-32 h-96 w-96 rounded-full blur-3xl transition-all duration-700 ${
            darkMode ? "bg-purple-600/20" : "bg-purple-300/30"
          } animate-pulse`}
        />

        <div
          className={`absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl ${
            darkMode ? "bg-blue-600/10" : "bg-blue-300/20"
          }`}
        />
      </div>

              {/* Floating learning bubbles */}
        <div className="absolute left-[5%] top-[18%] hidden animate-[floatBook_6s_ease-in-out_infinite] rounded-2xl border border-indigo-300/30 bg-white/60 p-4 text-3xl shadow-lg backdrop-blur-md sm:block">
          📚
        </div>

        <div className="absolute right-[7%] top-[22%] hidden animate-bounce rounded-2xl border border-purple-300/30 bg-white/60 p-4 text-3xl shadow-lg backdrop-blur-md sm:block">
          🎓
        </div>

        <div className="absolute bottom-[16%] left-[7%] hidden animate-[floatBook_7s_ease-in-out_infinite] rounded-2xl border border-blue-300/30 bg-white/60 p-4 text-3xl shadow-lg backdrop-blur-md sm:block">
          🧠
        </div>

        <div className="absolute bottom-[12%] right-[8%] hidden animate-[floatBook_5s_ease-in-out_infinite] rounded-2xl border border-indigo-300/30 bg-white/60 p-4 text-3xl shadow-lg backdrop-blur-md sm:block">
          💡
        </div>

        <div className="absolute left-[48%] top-[15%] hidden animate-pulse text-3xl text-indigo-400/70 lg:block">
          ✦
        </div>

      {/* Main */}
      <div className="relative z-10 min-h-screen lg:grid lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div
          className={`relative hidden overflow-hidden transition-all duration-700 lg:flex ${
            darkMode
              ? "bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950"
              : "bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700"
          }`}
        >
          {/* Decorative circles */}
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" />

          {/* <div className="absolute right-20 top-24 h-20 w-20 rounded-full border border-white/10 animate-bounce" /> */}

          
{/* Floating learning elements */}
<div className="pointer-events-none absolute inset-0 overflow-hidden">
  <div className="learning-float learning-float-book">📚</div>
  <div className="learning-float learning-float-brain">🧠</div>
  <div className="learning-float learning-float-bulb">💡</div>
  <div className="learning-float learning-float-rocket">🚀</div>
  <div className="learning-float learning-float-notes">📝</div>
  <div className="learning-float learning-float-star">✨</div>
</div>


          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <div className="flex animate-[fadeIn_0.7s_ease-out] items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg transition duration-300 hover:scale-110 hover:rotate-6">
                🧠
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  LearnMate AI
                </h1>

                <p className="text-sm text-indigo-200">
                  Personal Study Assistant
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-lg">

              <p className="mb-4 animate-[fadeInUp_0.7s_ease-out] text-sm font-semibold uppercase tracking-widest text-indigo-200">
                AI-Powered Learning
              </p>

              <h2 className="animate-[fadeInUp_0.9s_ease-out] text-4xl font-bold leading-tight text-white xl:text-5xl">
                Study smarter.
                <br />
                <span className="text-indigo-200">
                  Learn faster.
                </span>
              </h2>

              <p className="mt-6 animate-[fadeInUp_1.1s_ease-out] max-w-md text-lg leading-8 text-indigo-100">
                Turn your study material into an interactive
                learning experience with AI-powered chat,
                quizzes and flashcards.
              </p>

              {/* Features */}
              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3 text-indigo-100 transition-all duration-300 hover:translate-x-2 hover:scale-[1.02]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>
                  <span>Chat with your study documents</span>
                </div>

                <div className="flex items-center gap-3 text-indigo-100 transition-all duration-300 hover:translate-x-2 hover:scale-[1.02]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>
                  <span>Generate AI-powered quizzes</span>
                </div>

                <div className="flex items-center gap-3 text-indigo-100 transition-all duration-300 hover:translate-x-2 hover:scale-[1.02]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>
                  <span>Create smart flashcards</span>
                </div>

              </div>
            </div>

            <p className="text-sm text-indigo-200">
              © 2026 LearnMate AI
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">

          <div className="w-full max-w-md">

            {/* Theme toggle */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-yellow-300 hover:bg-slate-800"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg transition-transform duration-300 group-hover:rotate-180">
                  {darkMode ? "☀️" : "🌙"}
                </span>

                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </div>

            {/* Mobile Logo */}
            <div className="mb-8 text-center lg:hidden">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl text-white shadow-lg transition duration-300 hover:scale-110 hover:rotate-3">
                🧠
              </div>

              <h1
                className={`mt-4 text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                LearnMate AI
              </h1>

              <p
                className={`mt-1 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Personal Study Assistant
              </p>
            </div>

            {/* Heading */}
            <div className="mb-8 animate-[fadeInUp_0.6s_ease-out]">

              <p className="animate-[fadeInUp_0.6s_ease-out] text-sm font-bold uppercase tracking-[0.25em] text-indigo-500">
  ✨ Welcome back
</p>

              <h2
                className={`mt-2 animate-[fadeInUp_0.8s_ease-out] text-3xl font-extrabold tracking-tight sm:text-4xl ${
  darkMode ? "text-white" : "text-gray-900"
}`}
              >
                Sign in to LearnMate
              </h2>
{/* Decorative circles */}
              <p
                className={`mt-2 animate-[fadeInUp_1s_ease-out] leading-7 ${
  darkMode ? "text-gray-400" : "text-gray-500"
}`}
              >
                Continue your learning journey.
              </p>
            </div>

            {/* Login Card */}
            <div
              className={`relative z-20 animate-[fadeInUp_0.8s_ease-out] rounded-3xl border p-7 shadow-2xl transition-all duration-500 sm:p-8 ${
                darkMode
                  ? "border-slate-800 bg-slate-900/90 shadow-black/30"
                  : "border-gray-200 bg-white shadow-gray-200/60"
              }`}
            >

              {/* Error */}
              {error && (
                <div className="mb-5 animate-[shake_0.3s_ease-in-out] rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">

                {/* Email */}
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border px-4 py-3.5 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-4 ${
                      darkMode
                        ? "border-slate-700 bg-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20"
                        : "border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">

                    <label
                      className={`block text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-sm font-medium text-indigo-500 transition hover:text-indigo-400"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative">

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`w-full rounded-xl border px-4 py-3.5 pr-14 outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-4 ${
                        darkMode
                          ? "border-slate-700 bg-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20"
                          : "border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium transition ${
                        darkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>
                </div>

                {/* Remember */}
                <div className="flex items-center">

                  <label
                    className={`flex cursor-pointer items-center gap-2 text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />

                    Remember me
                  </label>

                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <span className="relative z-10">
                    {loading ? "Signing in..." : "Sign In"}
                  </span>

                  {!loading && (
                    <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />
                  )}

                </button>

              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">

                <div
                  className={`h-px flex-1 ${
                    darkMode ? "bg-slate-700" : "bg-gray-200"
                  }`}
                />

                <span
                  className={`text-xs font-medium uppercase ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  or
                </span>

                <div
                  className={`h-px flex-1 ${
                    darkMode ? "bg-slate-700" : "bg-gray-200"
                  }`}
                />

              </div>

              {/* Google */}
              <div className="flex w-full justify-center">
  <div ref={googleButtonRef} />
</div>
              <p
                className={`mt-7 text-center text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="font-semibold text-indigo-500 transition hover:text-indigo-400"
                >
                  Create account
                </Link>
              </p>

            </div>

            <p
              className={`mt-6 text-center text-xs ${
                darkMode ? "text-gray-600" : "text-gray-400"
              }`}
            >
              © 2026 LearnMate AI · Personal Study Assistant
            </p>

          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes floatBook {
  0%, 100% {
    transform: translateY(0) rotate(-4deg);
  }

  50% {
    transform: translateY(-18px) rotate(4deg);
  }
}


.learning-float {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.13);
  box-shadow: 0 8px 25px rgba(20, 10, 70, 0.15);
  backdrop-filter: blur(10px);
  font-size: 25px;
  animation: learningFloat 6s ease-in-out infinite;
}

.learning-float-book {
  top: 28%;
  right: 13%;
}

.learning-float-brain {
  top: 52%;
  right: 25%;
  animation-delay: -2s;
}

.learning-float-bulb {
  bottom: 18%;
  right: 15%;
  animation-delay: -3s;
}

.learning-float-rocket {
  top: 42%;
  right: 5%;
  animation-delay: -1s;
}

.learning-float-notes {
  bottom: 32%;
  right: 40%;
  animation-delay: -4s;
}

.learning-float-star {
  top: 18%;
  right: 34%;
  border: none;
  background: transparent;
  box-shadow: none;
  animation-delay: -2s;
}

@keyframes learningFloat {
  0%, 100% {
    transform: translateY(0) rotate(-4deg);
  }
  50% {
    transform: translateY(-14px) rotate(4deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .learning-float {
    animation: none;
  }
}


          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Login;