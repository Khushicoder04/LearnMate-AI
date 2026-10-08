import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import DocumentDetails from "./DocumentDetails";
import Chat from "./Chat";
import Quiz from "./Quiz";
import Flashcards from "./Flashcards";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
<Route
  path="/document/:id"
  element={
    <ProtectedRoute>
      <DocumentDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/document/:id/chat"
  element={
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  }
/>

<Route
  path="/quiz/:id"
  element={
    <ProtectedRoute>
      <Quiz />
    </ProtectedRoute>
  }
/>

<Route
  path="/flashcards/:id"
  element={
    <ProtectedRoute>
      <Flashcards />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;