import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
const [learningProgress, setLearningProgress] = useState(0);
const API_BASE = "https://learnmate-ai-52yg.onrender.com";

const fetchProgress = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE}/api/progress`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setQuizzesCompleted(response.data.quizzesCompleted);
    setLearningProgress(response.data.learningProgress);
  } catch (error) {
    console.error("Progress fetch error:", error);
  }
};

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

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
         `${API_BASE}/api/documents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDocuments(response.data.documents);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };

    fetchDocuments();
    fetchProgress();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
      setMessage("");
    }
  };

 


const handleUpload = async () => {
  if (!selectedFile) {
    setMessage("Please select a file first.");
    return;
  }

  try {
    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = localStorage.getItem("token");

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${API_BASE}/api/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("Accept", "application/x-ndjson");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round(
            (event.loaded / event.total) * 100
          );

          // File transfer progress: maximum 99%
          setUploadProgress(Math.min(percent, 99));
          setMessage("Uploading document...");
        }
      };

      xhr.onprogress = (event) => {
        const responseText = xhr.responseText || "";
        const lines = responseText.split("\n");

        // Process complete NDJSON lines only
        for (const line of lines.slice(0, -1)) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);

            if (data.type === "progress") {
              setUploadProgress(data.progress);
              setMessage(data.message || "Processing document...");
            }

            if (data.type === "error") {
              reject(new Error(data.message));
              return;
            }

            if (data.type === "complete") {
              setUploadProgress(100);
              setMessage(data.message || "Document processed successfully!");
            }
          } catch (parseError) {
            console.error("Progress parsing error:", parseError);
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const lines = (xhr.responseText || "").trim().split("\n");
          let result = null;

          try {
            result = JSON.parse(lines[lines.length - 1]);
          } catch {
            // The response may end with an empty line.
            try {
              result = JSON.parse(lines[lines.length - 2]);
            } catch {
              reject(new Error("Invalid response from server."));
              return;
            }
          }

          if (result.type === "error") {
            reject(new Error(result.message));
            return;
          }

          resolve(result);
        } else {
          reject(new Error("File upload failed. Please try again."));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error while uploading the file."));
      };

      xhr.onabort = () => {
        reject(new Error("File upload was cancelled."));
      };

      xhr.send(formData);
    });

    const documentsResponse = await axios.get(
      `${API_BASE}/api/documents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setDocuments(
      Array.isArray(documentsResponse.data.documents)
        ? documentsResponse.data.documents
        : []
    );

    setSelectedFile(null);
    setMessage("File uploaded and processed successfully!");
  } catch (error) {
    console.error("Upload error:", error);
    setMessage(error.message || "File upload failed.");
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};

  const handleDelete = async (documentId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this document?"
  );

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    await axios.delete(
      `${API_BASE}/api/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Remove document from the UI immediately
    setDocuments((prevDocuments) =>
      prevDocuments.filter((document) => document._id !== documentId)
    );
  } catch (error) {
    console.error("Delete error:", error);

    if (error.response) {
      setMessage(error.response.data.message);
    } else {
      setMessage("Failed to delete document.");
    }
  }
};

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-gray-900"
      }`}
    >
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome Section */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-indigo-500">
            STUDY SMARTER WITH AI
          </p>

          <h1
            className={`text-4xl font-bold tracking-tight ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome to LearnMate AI 👋
          </h1>

          <p
            className={`mt-3 max-w-2xl text-lg ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Upload your study material and let AI help you understand,
            revise and learn faster.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-5 md:grid-cols-3">

          <div
            className={`rounded-2xl border p-6 shadow-sm transition-colors ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
              📚
            </div>

            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Study Materials
            </p>

            <h2
              className={`mt-1 text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {documents.length}
            </h2>
          </div>

          <div
            className={`rounded-2xl border p-6 shadow-sm transition-colors ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
              📝
            </div>

            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Quizzes Completed
            </p>

            <h2
              className={`mt-1 text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {quizzesCompleted}
            </h2>
          </div>

          <div
            className={`rounded-2xl border p-6 shadow-sm transition-colors ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
              📈
            </div>

            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Learning Progress
            </p>

            <h2
              className={`mt-1 text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {learningProgress}%
            </h2>
          </div>

        </section>

        {/* Upload Section */}
        <section
          className={`mb-8 rounded-2xl border p-8 shadow-sm transition-colors ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="mb-6">
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Upload Study Material
            </h2>

            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Upload your notes, textbooks or study documents.
            </p>
          </div>

          <label
            className={`block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
              darkMode
                ? "border-slate-700 bg-slate-800/50 hover:border-indigo-500 hover:bg-indigo-950/30"
                : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50"
            }`}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
              📄
            </div>

            <h3
              className={`text-lg font-semibold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Choose your study material
            </h3>

            <p
              className={`mt-2 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              PDF, DOCX or TXT files
            </p>

            <span className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
              Choose File
            </span>

            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Selected File */}
          {selectedFile && (
            <div
              className={`mt-5 flex items-center justify-between rounded-xl p-4 ${
                darkMode ? "bg-indigo-950/50" : "bg-indigo-50"
              }`}
            >
              <div>
                <p
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  📄 {selectedFile.name}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>

                
{uploading && (
  <div className="mt-4 w-full">
    <div className="mb-2 flex items-center justify-between text-sm">
      <span
        className={
          darkMode ? "text-indigo-300" : "text-indigo-600"
        }
      >
        Uploading your document...
      </span>

      <span
        className={`font-semibold ${
          darkMode ? "text-indigo-300" : "text-indigo-600"
        }`}
      >
        {uploadProgress}%
      </span>
    </div>

    <div
      className={`h-2 w-full overflow-hidden rounded-full ${
        darkMode ? "bg-slate-700" : "bg-indigo-100"
      }`}
    >
      <div
        className="h-full rounded-full bg-indigo-500 transition-all duration-200"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
  </div>
)}

              </div>

             
<button
  onClick={handleUpload}
  disabled={uploading}
  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {uploading && (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )}

  {uploading ? `Uploading ${uploadProgress}%` : "Upload"}
</button>

            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mt-4 rounded-lg p-3 text-sm font-medium ${
                darkMode
                  ? "bg-green-950/40 text-green-400"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}
        </section>

        {/* Recent Documents */}
        <section
          className={`mb-8 rounded-2xl border p-8 shadow-sm transition-colors ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="mb-6">
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Recent Documents
            </h2>

            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Your uploaded study materials.
            </p>
          </div>

          {documents.length === 0 ? (
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No documents uploaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document._id}
                  onClick={() => navigate(`/document/${document._id}`)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    darkMode
                      ? "border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/30"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
                      📄
                    </div>

                    <div>
                      <h3
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {document.originalName}
                      </h3>

                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {(document.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>

                 <div className="flex items-center gap-3">
  <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
    PDF
  </span>

  <button
    onClick={(event) => {
      event.stopPropagation();
      handleDelete(document._id);
    }}
    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
      darkMode
        ? "bg-red-950/40 text-red-400 hover:bg-red-950/70"
        : "bg-red-50 text-red-600 hover:bg-red-100"
    }`}
  >
    Delete
  </button>
</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Tools */}
        <section>
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
              Turn your study material into interactive learning.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* AI Chat */}
            <button
              className={`group rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 ${
                darkMode
                  ? "border-slate-800 bg-slate-900 hover:border-indigo-500"
                  : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md"
              }`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                💬
              </div>

              <h3
                className={`text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                AI Chat
              </h3>

              <p
                className={`mt-2 text-sm leading-6 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Ask questions about your uploaded study material.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-indigo-500">
                Start Chat →
              </span>
            </button>

            {/* Quiz */}
            <button
              className={`group rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 ${
                darkMode
                  ? "border-slate-800 bg-slate-900 hover:border-purple-500"
                  : "border-gray-200 bg-white hover:border-purple-200 hover:shadow-md"
              }`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📝
              </div>

              <h3
                className={`text-lg font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Generate Quiz
              </h3>

              <p
                className={`mt-2 text-sm leading-6 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Test yourself with AI-generated questions.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-purple-500">
                Create Quiz →
              </span>
            </button>

            {/* Flashcards */}
            <button
              className={`group rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-1 ${
                darkMode
                  ? "border-slate-800 bg-slate-900 hover:border-green-500"
                  : "border-gray-200 bg-white hover:border-green-200 hover:shadow-md"
              }`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                🃏
              </div>

              <h3
                className={`text-lg font-bold ${
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
                Quickly revise important concepts with flashcards.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-green-500">
                Study Cards →
              </span>
            </button>

          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;