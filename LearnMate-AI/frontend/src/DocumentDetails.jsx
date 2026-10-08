import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";

function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);

  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("learnmate-theme") === "dark";
  });

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setDarkMode(localStorage.getItem("learnmate-theme") === "dark");
    };

    window.addEventListener("storage", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const handleGenerateQuiz = async () => {
    try {
      setQuizLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://learnmate-ai-52yg.onrender.com/api/generate-quiz",
        {
          documentId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Generated Quiz:", response.data.quiz);
    } catch (error) {
      console.error("Quiz generation error:", error);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `https://learnmate-ai-52yg.onrender.com/api/documents/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDocument(response.data.document);
      } catch (error) {
        console.error("Failed to fetch document:", error);
        setError("Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div
        className={`min-h-screen transition-colors duration-500 ${
          darkMode ? "bg-slate-950" : "bg-slate-50"
        }`}
      >
        <Navbar />

        <main className="mx-auto max-w-5xl px-6 py-10">
          <p
            className={
              darkMode ? "text-gray-400" : "text-gray-500"
            }
          >
            Loading document...
          </p>
        </main>
      </div>
    );
  }

  // Error
  if (error || !document) {
    return (
      <div
        className={`min-h-screen transition-colors duration-500 ${
          darkMode ? "bg-slate-950" : "bg-slate-50"
        }`}
      >
        <Navbar />

        <main className="mx-auto max-w-5xl px-6 py-10">
          <div
            className={`rounded-2xl border p-6 ${
              darkMode
                ? "border-red-900 bg-red-950/40"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p
              className={`font-medium ${
                darkMode ? "text-red-400" : "text-red-700"
              }`}
            >
              {error || "Document not found."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-500">
            STUDY MATERIAL
          </p>

          <h1
            className={`mt-2 text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {document.originalName}
          </h1>

          <p
            className={`mt-2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Your uploaded study material
          </p>
        </div>

        {/* Document Information */}
        <div
          className={`rounded-2xl border p-8 shadow-sm transition-colors duration-500 ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
              📄
            </div>

            <div>
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {document.originalName}
              </h2>

              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                PDF Document
              </p>
            </div>
          </div>

          {/* File information */}
          <div
            className={`mt-6 grid gap-4 border-t pt-6 md:grid-cols-3 ${
              darkMode ? "border-slate-800" : "border-gray-100"
            }`}
          >
            <div
              className={`rounded-xl p-4 ${
                darkMode ? "bg-slate-800" : "bg-gray-50"
              }`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                File Size
              </p>

              <p
                className={`mt-1 font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {(document.fileSize / 1024).toFixed(2)} KB
              </p>
            </div>

            <div
              className={`rounded-xl p-4 ${
                darkMode ? "bg-slate-800" : "bg-gray-50"
              }`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                File Type
              </p>

              <p
                className={`mt-1 font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                PDF
              </p>
            </div>

            <div
              className={`rounded-xl p-4 ${
                darkMode ? "bg-slate-800" : "bg-gray-50"
              }`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Uploaded
              </p>

              <p
                className={`mt-1 font-semibold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Extracted Content */}
          <div
            className={`mt-8 border-t pt-6 ${
              darkMode ? "border-slate-800" : "border-gray-100"
            }`}
          >
            <h2
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Extracted Content
            </h2>

            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Text extracted from your uploaded document.
            </p>

            <div
              className={`mt-4 max-h-96 overflow-y-auto rounded-xl p-5 ${
                darkMode ? "bg-slate-800" : "bg-gray-50"
              }`}
            >
              <pre
                className={`whitespace-pre-wrap font-sans text-sm leading-6 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {document.extractedText || "No text extracted."}
              </pre>
            </div>
          </div>
        </div>

        {/* AI Study Tools */}
        <section className="mt-8">
          <div className="mb-5">
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              AI Study Tools
            </h2>

            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Use AI to study this specific document.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* Ask AI */}
            <button
              onClick={() => navigate(`/document/${id}/chat`)}
              className={`rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 ${
                darkMode
                  ? "border-slate-800 bg-slate-900 hover:border-indigo-500 hover:shadow-indigo-900/20"
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                💬
              </div>

              <h3
                className={`mt-5 text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Ask AI
              </h3>

              <p
                className={`mt-2 text-sm leading-6 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Ask questions about this document.
              </p>
            </button>

            {/* Generate Quiz */}
            <button
              onClick={() => navigate(`/quiz/${id}`)}
              className={`rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 ${
                darkMode
                  ? "border-slate-800 bg-slate-900 hover:border-purple-500 hover:shadow-purple-900/20"
                  : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📝
              </div>

              <h3
                className={`mt-5 text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {quizLoading ? "Generating..." : "Generate Quiz"}
              </h3>

              <p
                className={`mt-2 text-sm leading-6 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Create questions from this document.
              </p>
            </button>

            {/* Flashcards */}
            <button
              onClick={() => navigate(`/flashcards/${id}`)}
              className={`rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 ${
                darkMode
                  ? "border-slate-800 bg-slate-900 hover:border-green-500 hover:shadow-green-900/20"
                  : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                🃏
              </div>

              <h3
                className={`mt-5 text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Flashcards
              </h3>

              <p
                className={`mt-2 text-sm leading-6 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Create flashcards for quick revision.
              </p>
            </button>

          </div>
        </section>

      </main>
    </div>
  );
}

export default DocumentDetails;