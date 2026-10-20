const dns = require("dns");
dns.setServers(["8.8.8.8"]);
const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const User = require("./models/User");
const authMiddleware = require("./middleware/authMiddleware");
const Document = require("./models/Document");
const QuizResult = require("./models/QuizResult");
const extractDocumentText = require("./utils/documentExtractor");
const chunkText = require("./utils/chunker");
const generateEmbedding = require("./utils/embedding");
const cosineSimilarity = require("./utils/similarity");
const getRelevantChunks = require("./utils/relevantChunks");


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uploadDir = path.join(__dirname, "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});


const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed!"));
    }
  },
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Home route
app.get("/", (req, res) => {
  res.send("LearnMate AI Backend is running!");
});

// Register user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    const savedUser = await user.save();

    res.status(201).json({
      message: "User created successfully!",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("User creation error:", error);

    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

   if (!user.password) {
  return res.status(401).json({
    message: "Please sign in using Google.",
  });
}

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});


/* Google Sign-In */
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      return res.status(401).json({
        message: "Google account could not be verified",
      });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];

    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      user = new User({
        name,
        email,
      });

      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Google login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      message: "Google sign-in failed. Please try again.",
    });
  }
});


// Test API
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected successfully!",
  });
});

// Protected profile route
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Protected data accessed successfully!",
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Failed to get profile",
    });
  }
});

// Get logged-in user's documents
// Get logged-in user's documents
app.get("/api/documents", authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      message: "Failed to get documents",
    });
  }
});

// Get logged-in user's documents
app.get("/api/documents", authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    console.log("Documents found:", documents.length);

    res.status(200).json({
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      message: "Failed to get documents",
    });
  }
});

// Get one specific document
app.get("/api/documents/:id", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.status(200).json({
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    res.status(500).json({
      message: "Failed to get document",
    });
  }
});

// Delete a document
// Delete a document
app.delete("/api/documents/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    // Delete the actual uploaded file
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document from MongoDB
    await Document.deleteOne({
      _id: id,
      userId: req.user.userId,
    });

    res.status(200).json({
      message: "Document deleted successfully!",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    res.status(500).json({
      message: "Failed to delete document.",
    });
  }
});

app.post(
  "/api/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      res.status(200);
res.setHeader("Content-Type", "application/x-ndjson");
res.setHeader("Cache-Control", "no-cache, no-transform");
res.setHeader("X-Accel-Buffering", "no");
res.flushHeaders();

const sendProgress = (stage, progress, message) => {
  res.write(
    JSON.stringify({ type: "progress", stage, progress, message }) + "\n"
  );
};

let extractedText = "";
let chunks = [];

sendProgress("extracting", 10, "Extracting document text");

extractedText = await extractDocumentText(
  req.file.path,
  req.file.mimetype
);

chunks = chunkText(extractedText);

if (!extractedText.trim() || chunks.length === 0) {
  res.write(
    JSON.stringify({
      type: "error",
      message: "No readable text found in this document.",
    }) + "\n"
  );
  return res.end();
}


console.log("Extracted text length:", extractedText.length);
console.log("Chunks created:", chunks.length);

sendProgress("chunking", 30, "Text chunks created");

const embeddedChunks = [];

for (const chunk of chunks) {
  console.log("Generating embedding for chunk...");

  const embedding = await generateEmbedding(chunk);

  embeddedChunks.push({
    text: chunk,
    embedding: embedding,
  });

  const progress =
  30 +
  Math.round(
    (embeddedChunks.length / chunks.length) * 60
  );

  sendProgress(
    "embedding",
    progress,
    `Generated ${embeddedChunks.length} of ${chunks.length} embeddings`
  );
}

chunks = embeddedChunks;

console.log("Embeddings generated:", chunks.length);

  const document = new Document({
  userId: req.user.userId,
  originalName: req.file.originalname,
  filename: req.file.filename,
  filePath: req.file.path,
  fileType: req.file.mimetype,
  fileSize: req.file.size,
  extractedText: extractedText,
  chunks: chunks,
});

sendProgress("saving", 95, "Saving document to database");

await document.save();

sendProgress("completed", 100, "Document processing completed");

console.log("Document saved successfully!");
console.log("Extracted text length:", extractedText.length);
console.log("Text preview:", extractedText.substring(0, 500));

     res.write(
  JSON.stringify({
    type: "complete",
    progress: 100,
    message: "File uploaded and processed successfully!",
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
    },
    textLength: extractedText.length,
    chunkCount: chunks.length,
    textPreview: extractedText.substring(0, 500),
  }) + "\n"
);

res.end();

   } catch (error) {
  console.error("Upload/extraction error:", error);

  if (!res.headersSent) {
    return res.status(500).json({
      type: "error",
      message: "File upload or text extraction failed",
    });
  }

  res.write(
    JSON.stringify({
      type: "error",
      message: "File upload or text extraction failed",
    }) + "\n"
  );

  res.end();
}
  }
);

app.get("/api/test-gemini", async (req, res) => {
  try {
   const response = await ai.models.generateContent({
  model: "gemini-3.6-flash",
  contents: "Say hello to LearnMate AI in one short sentence.",
});

    res.status(200).json({
      message: response.text,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      message: "Gemini API test failed",
    });
  }
});

app.post("/api/chat", authMiddleware, async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        message: "Document ID and question are required.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    if (!document.extractedText) {
      return res.status(400).json({
        message: "No extracted text available for this document.",
      });
    }

// Generate embedding for the user's question
const questionEmbedding = await generateEmbedding(question);

// Calculate similarity between question and every document chunk
const scoredChunks = document.chunks
  .filter(
    (chunk) =>
      chunk &&
      chunk.text &&
      chunk.embedding &&
      chunk.embedding.length > 0
  )
  .map((chunk) => {
    const score = cosineSimilarity(
      questionEmbedding,
      chunk.embedding
    );

    return {
      text: chunk.text,
      score,
    };
  });

// Sort by highest similarity
scoredChunks.sort((a, b) => b.score - a.score);

// Take top 3 most relevant chunks
const relevantChunks = scoredChunks
  .slice(0, 3)
  .map((item) => item.text);

const context = relevantChunks.join("\n\n");

console.log("Semantic search results:");
console.log(scoredChunks.slice(0, 3));
console.log("Retrieved context:");
console.log(context);

    console.log("Retrieved chunks:");
console.log(context);

const prompt = `
You are LearnMate AI, a helpful personal study assistant.

The uploaded document contains study material or questions related to the user's studies.

Use the uploaded document to understand the topic and identify relevant questions or concepts.

If the document contains the answer or explanation, use that information.

If the document contains only a question and does not contain its answer, use your general academic knowledge to provide a correct and clear answer.

Always stay relevant to the topic in the uploaded document.

Study Material:
${context}

User Question:
${question}

Give a clear, student-friendly explanation.
If the user asks a definition, explain the definition first and then give a simple example if useful.
If the user asks a numerical or technical question, explain the solution step by step.
`;

  let response;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    break;
  } catch (error) {
    if (error.status === 503 && attempt < 3) {
      console.log(`Gemini busy. Retrying... Attempt ${attempt + 1}/3`);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      throw error;
    }
  }
}
   console.log("Gemini response received:", response);

res.status(200).json({
  answer: response.text,
});
  } catch (error) {
  console.error("Chat error:", error);

  if (error.status === 503) {
    return res.status(503).json({
      message:
        "Gemini is temporarily busy. Please wait a moment and try again.",
    });
  }

  return res.status(500).json({
    message: "Failed to generate AI response.",
  });
}
});



app.post("/api/generate-quiz", authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    if (!document.extractedText) {
      return res.status(400).json({
        message: "No extracted text available for this document.",
      });
    }

    const relevantChunks = await getRelevantChunks(
  document.chunks,
  "Generate quiz questions covering the important concepts, definitions, facts, and topics from this study material.",
  5
);

const quizContext = relevantChunks
  .map((chunk) => chunk.text)
  .join("\n\n");

console.log("Quiz relevant chunks:", relevantChunks.length);
console.log(
  "Quiz similarity scores:",
  relevantChunks.map((chunk) => chunk.score)
);

const prompt = `
You are LearnMate AI, an educational quiz generator.

Based ONLY on the study material below, generate 5 multiple-choice questions.

Study Material:
${quizContext}

Return the quiz in this exact JSON format:

[
  {
    "question": "Question here",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Correct option here"
  }
]

Do not add any explanation or markdown.
Return only valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const quizText = response.text.trim();

    const quiz = JSON.parse(quizText);

    res.status(200).json({
      message: "Quiz generated successfully!",
      quiz,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);

    res.status(500).json({
      message: "Failed to generate quiz.",
    });
  }
});

console.log("Quiz route registered");

app.post("/api/generate-flashcards", authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.userId,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    if (!document.extractedText) {
      return res.status(400).json({
        message: "No extracted text available for this document.",
      });
    }

    const prompt = `
You are LearnMate AI, an educational flashcard generator.

Based ONLY on the study material below, generate 5 useful flashcards.

Study Material:
${document.chunks
  .filter(
    (chunk) =>
      chunk &&
      chunk.text &&
      chunk.text.trim().length > 0
  )
  .slice(0, 5)
  .map((chunk) => chunk.text)
  .join("\n\n")}

Return the flashcards in this exact JSON format:

[
  {
    "question": "Question here",
    "answer": "Answer here"
  }
]

Do not add any explanation or markdown.
Return only valid JSON.
`;

    let response;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        break;
      } catch (error) {
        if (error.status === 503 && attempt < 3) {
          console.log(
            `Gemini busy. Retrying flashcard generation... Attempt ${
              attempt + 1
            }/3`
          );

          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          throw error;
        }
      }
    }

    const flashcardsText = response.text.trim();

    const flashcards = JSON.parse(flashcardsText);

    res.status(200).json({
      message: "Flashcards generated successfully!",
      flashcards,
    });
  } catch (error) {
    console.error("Flashcard generation error:", error);

    if (error.status === 503) {
      return res.status(503).json({
        message:
          "Gemini is temporarily busy. Please wait a moment and try again.",
      });
    }

    return res.status(500).json({
      message: "Failed to generate flashcards.",
    });
  }
});

app.post("/api/quiz-results", authMiddleware, async (req, res) => {
  try {
    console.log("========== QUIZ RESULT REQUEST ==========");
    console.log("User ID:", req.user.userId);
    console.log("Request body:", req.body);

    const { documentId, score, totalQuestions } = req.body;

    if (!documentId || score === undefined || !totalQuestions) {
      console.log("Missing quiz result data.");

      return res.status(400).json({
        message: "Document ID, score, and total questions are required.",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.userId,
    });

    if (!document) {
      console.log("Document not found.");

      return res.status(404).json({
        message: "Document not found.",
      });
    }

    const quizResult = await QuizResult.create({
      userId: req.user.userId,
      documentId,
      score,
      totalQuestions,
    });

    console.log("QUIZ RESULT SAVED SUCCESSFULLY!");
    console.log("Saved result:", quizResult);

    res.status(201).json({
      message: "Quiz result saved successfully!",
      result: quizResult,
    });
  } catch (error) {
    console.error("SAVE QUIZ RESULT ERROR:", error);

    res.status(500).json({
      message: "Failed to save quiz result.",
    });
  }
});

app.get("/api/progress", authMiddleware, async (req, res) => {
  try {
    console.log("========== PROGRESS API CALLED ==========");
    console.log("Progress User ID:", req.user.userId);

    const results = await QuizResult.find({
      userId: req.user.userId,
    });

    console.log("Quiz results found:", results.length);
    console.log("Quiz results:", results);

    const quizzesCompleted = results.length;

    let learningProgress = 0;

    if (results.length > 0) {
      const totalPercentage = results.reduce((sum, result) => {
        return (
          sum +
          (result.score / result.totalQuestions) * 100
        );
      }, 0);

      learningProgress = Math.round(
        totalPercentage / results.length
      );
    }

    console.log("Quizzes completed:", quizzesCompleted);
    console.log("Learning progress:", learningProgress);

    return res.status(200).json({
      quizzesCompleted,
      learningProgress,
    });
  } catch (error) {
    console.error("PROGRESS API ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch progress.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});