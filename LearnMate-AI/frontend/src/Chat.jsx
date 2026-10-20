import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";

function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("learnmate-theme") === "dark";
  });

  // Listen for theme changes from Navbar
  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(localStorage.getItem("learnmate-theme") === "dark");
    };

    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://learnmate-ai-52yg.onrender.com/api/chat",
        {
          documentId: id,
          question: question,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          question: question,
          answer: response.data.answer,
        },
      ]);

      setQuestion("");
    } catch (error) {
      console.error("AI Chat Error:", error);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-500">
            AI STUDY ASSISTANT
          </p>

          <h1
            className={`mt-2 text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Ask AI
          </h1>

          <p
            className={`mt-2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Ask questions about your study material.
          </p>
        </div>

        {/* Chat Container */}
        <div
          className={`min-h-[500px] rounded-2xl border p-6 shadow-sm transition-colors duration-500 ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="min-h-[400px] space-y-5">

            {messages.length === 0 ? (
              <div className="flex h-[400px] items-center justify-center">
                <p
                  className={
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }
                >
                  Your AI conversation will appear here.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="space-y-3">

                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 px-5 py-3 text-white">
                      {message.question}
                    </div>
                  </div>

                  {/* AI Answer */}
                  <div className="flex justify-start">
                    <div
                      className={`max-w-[85%] rounded-2xl rounded-bl-md p-5 ${
                        darkMode
                          ? "bg-indigo-950/60"
                          : "bg-indigo-50"
                      }`}
                    >
                      <p
                        className={`mb-2 font-semibold ${
                          darkMode
                            ? "text-indigo-400"
                            : "text-indigo-700"
                        }`}
                      >
                        🤖 LearnMate AI
                      </p>

                      <p
                        className={`whitespace-pre-wrap leading-7 ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {message.answer}
                      </p>
                    </div>
                  </div>

                </div>
              ))
            )}

          </div>

          {/* Input */}
          <div
            className={`border-t pt-5 ${
              darkMode ? "border-slate-800" : "border-gray-100"
            }`}
          >
            <div className="flex gap-3">

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about this document..."
                className={`flex-1 rounded-xl border px-4 py-3 outline-none transition ${
                  darkMode
                    ? "border-slate-700 bg-slate-800 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />

              <button
                onClick={handleAsk}
                className="mt-5 w-fit cursor-pointer rounded-xl border border-blue-200 bg-blue-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-95"
              >
                Ask AI
              </button>

              <button
          onClick={() => navigate(`/document/${id}`)}
          className={`mt-5 w-fit cursor-pointer rounded-xl border border-blue-200 bg-blue-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-95 ${
            darkMode
              ? "border-slate-700 bg-slate-900 text-gray-300 hover:bg-slate-800"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Back to Document
        </button>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Chat;