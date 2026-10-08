import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";

function Quiz() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

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

  const sampleQuestions = [
    {
      question: "What is Machine Learning?",
      options: [
        "A type of database",
        "A subset of Artificial Intelligence",
        "A programming language",
        "An operating system",
      ],
      answer: "A subset of Artificial Intelligence",
    },
    {
      question: "Which type of learning uses labeled data?",
      options: [
        "Unsupervised Learning",
        "Reinforcement Learning",
        "Supervised Learning",
        "Random Learning",
      ],
      answer: "Supervised Learning",
    },
    {
      question: "Which of these is commonly used for classification?",
      options: [
        "Decision Tree",
        "HTML",
        "CSS",
        "MongoDB",
      ],
      answer: "Decision Tree",
    },
  ];

  const [questions, setQuestions] = useState(sampleQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Fetch document
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
        console.error("Failed to fetch quiz document:", error);
      }
    };

    fetchDocument();
  }, [id]);

  // Generate quiz from backend
  const generateQuiz = async () => {
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

      setQuestions(response.data.quiz);
      setCurrentQuestion(0);
      setSelectedAnswer("");
      setScore(0);
      setFinished(false);
    } catch (error) {
      console.error("Quiz generation error:", error);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleNext = async () => {
  if (!selectedAnswer) return;

  const isCorrect =
    selectedAnswer === questions[currentQuestion].answer;

  const newScore = isCorrect ? score + 1 : score;

  if (currentQuestion === questions.length - 1) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://learnmate-ai-52yg.onrender.com/api/quiz-results",
        {
          documentId: id,
          score: newScore,
          totalQuestions: questions.length,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Quiz result saved successfully!");
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }

    setScore(newScore);
    setFinished(true);
    return;
  }

  setScore(newScore);
  setCurrentQuestion((prev) => prev + 1);
  setSelectedAnswer("");
};

  // Quiz completed
  if (finished) {
    return (
      <div
        className={`min-h-screen transition-colors duration-500 ${
          darkMode ? "bg-slate-950" : "bg-slate-50"
        }`}
      >
        <Navbar />

        <main className="mx-auto max-w-3xl px-6 py-16">
          <div
            className={`rounded-2xl border p-10 text-center shadow-sm ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-5xl">🎉</div>

            <h1
              className={`mt-5 text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Quiz Completed!
            </h1>

            <p
              className={`mt-3 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Your score
            </p>

            <p className="mt-2 text-5xl font-bold text-indigo-500">
              {score} / {questions.length}
            </p>

            <button
              onClick={() => navigate(-1)}
              className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
            >
              Back to Document
            </button>
          </div>
        </main>
      </div>
    );
  }

  const question = questions[currentQuestion];

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
            Practice Quiz
          </h1>

          <p
            className={`mt-2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {document
              ? `Quiz based on ${document.originalName}`
              : "Test your understanding of the study material."}
          </p>
        </div>

        {/* Quiz Card */}
        <div
          className={`rounded-2xl border p-8 shadow-sm transition-colors duration-500 ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Question Info */}
          <div className="mb-6 flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                darkMode
                  ? "bg-indigo-950 text-indigo-400"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              Score: {score}
            </span>
          </div>

          {/* Question */}
          <h2
            className={`text-xl font-bold leading-8 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {question.question}
          </h2>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selectedAnswer === option
                    ? darkMode
                      ? "border-indigo-500 bg-indigo-950 text-indigo-300"
                      : "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : darkMode
                    ? "border-slate-700 bg-slate-800 text-gray-300 hover:border-indigo-500 hover:bg-slate-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {currentQuestion === questions.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </div>

        {/* AI Button */}
        <button
          onClick={generateQuiz}
          disabled={quizLoading}
          className={`mt-5 w-full rounded-xl border px-6 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            darkMode
              ? "border-indigo-800 bg-slate-900 text-indigo-400 hover:bg-indigo-950"
              : "border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          {quizLoading ? "Generating AI Quiz..." : "Generate AI Quiz"}
        </button>
      </main>
    </div>
  );
}

export default Quiz;