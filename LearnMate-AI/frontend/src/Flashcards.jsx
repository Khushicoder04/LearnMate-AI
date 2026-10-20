import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";

function Flashcards() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const generateFlashcards = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://learnmate-ai-52yg.onrender.com/api/generate-flashcards",
        {
          documentId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFlashcards(response.data.flashcards);
      setCurrentCard(0);
      setShowAnswer(false);
    } catch (error) {
      console.error("Flashcard generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setShowAnswer(false);

    if (currentCard < flashcards.length - 1) {
      setCurrentCard((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setShowAnswer(false);

    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1);
    }
  };

  const card = flashcards[currentCard];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-10">

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
            Flashcards
          </h1>

          <p
            className={`mt-2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Review important concepts from your study material.
          </p>
        </div>

        {/* Generate Button */}
        {flashcards.length === 0 && (
          <div
            className={`rounded-2xl border p-8 text-center shadow-sm ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-5xl">🃏</div>

            <h2
              className={`mt-5 text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Generate AI Flashcards
            </h2>

            <p
              className={`mt-2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Create flashcards based on your uploaded study material.
            </p>

            <button
              onClick={generateFlashcards}
              disabled={loading}
              className="mt-5 w-full cursor-pointer rounded-xl border border-blue-200 bg-blue-600 px-6 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              {loading
                ? "Generating Flashcards..."
                : "Generate Flashcards"}
            </button>
          </div>
        )}

        {/* Flashcards */}
        {flashcards.length > 0 && (
          <>
            {/* Progress */}
            <div
              className={`mb-4 flex justify-between text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <span>
                Card {currentCard + 1} of {flashcards.length}
              </span>

              <span>🧠 Study Mode</span>
            </div>

            {/* Flashcard */}
            <div
              onClick={() => setShowAnswer(!showAnswer)}
              className={`flex min-h-[350px] cursor-pointer items-center justify-center rounded-3xl border p-10 text-center shadow-sm transition hover:shadow-md ${
                darkMode
                  ? "border-slate-800 bg-slate-900 hover:shadow-indigo-950/20"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div>
                <p
                  className={`mb-5 text-sm font-medium ${
                    darkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  {showAnswer ? "ANSWER" : "QUESTION"}
                </p>

                <h2
                  className={`text-2xl font-bold leading-9 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {showAnswer ? card.answer : card.question}
                </h2>

                <p
                  className={`mt-8 text-sm ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Click the card to{" "}
                  {showAnswer
                    ? "see the question"
                    : "reveal the answer"}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentCard === 0}
                className={`mt-5 w-full cursor-pointer rounded-xl border px-6 py-3 font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 ${
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-gray-300 hover:bg-slate-800"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentCard === flashcards.length - 1}
                className="mt-5 w-full cursor-pointer rounded-xl border px-6 py-3 font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
              >
                Next Card
              </button>
            </div>
          </>
        )}

        {/* Back */}
        <button
          onClick={() => navigate(`/document/${id}`)}
          className={`mt-5 w-full cursor-pointer rounded-xl border px-6 py-3 font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 ${
            darkMode
              ? "border-slate-700 bg-slate-900 text-gray-300 hover:bg-slate-800"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Back to Document
        </button>
      </main>
    </div>
  );
}

export default Flashcards;