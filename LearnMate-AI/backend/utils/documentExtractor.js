const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const extractPdfText = require("./pdfExtractor");

const extractDocumentText = async (filePath, fileType) => {
  try {
    const extension = path.extname(filePath).toLowerCase();

    // PDF
    if (
      extension === ".pdf" ||
      fileType === "application/pdf"
    ) {
      return await extractPdfText(filePath);
    }

    // DOCX
    if (
      extension === ".docx" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      console.log(
        "DOCX extracted text length:",
        result.value.length
      );

      return result.value;
    }

    // TXT
    if (
      extension === ".txt" ||
      fileType === "text/plain"
    ) {
      const text = fs.readFileSync(filePath, "utf8");

      console.log(
        "TXT extracted text length:",
        text.length
      );

      return text;
    }

    throw new Error("Unsupported file type.");
  } catch (error) {
    console.error("Document extraction error:", error);
    throw error;
  }
};

module.exports = extractDocumentText;