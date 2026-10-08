const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const extractPdfText = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
      data: fileBuffer,
    });

    const result = await parser.getText({
      itemJoiner: " ",
    });

    await parser.destroy();

    console.log("PDF extracted text length:", result.text.length);
    console.log("PDF extracted text preview:", result.text.substring(0, 500));

    return result.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw error;
  }
};

module.exports = extractPdfText;