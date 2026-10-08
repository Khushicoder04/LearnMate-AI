const generateEmbedding = require("./embedding");
const cosineSimilarity = require("./similarity");

const getRelevantChunks = async (
  documentChunks,
  query,
  topK = 5
) => {
  if (!documentChunks || documentChunks.length === 0) {
    return [];
  }

  const validChunks = documentChunks.filter(
    (chunk) =>
      chunk &&
      chunk.text &&
      chunk.text.trim().length > 0 &&
      chunk.embedding &&
      chunk.embedding.length > 0
  );

  if (validChunks.length === 0) {
    return [];
  }

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Calculate similarity with every chunk
  const scoredChunks = validChunks.map((chunk) => {
    const score = cosineSimilarity(
      queryEmbedding,
      chunk.embedding
    );

    return {
      text: chunk.text,
      score,
    };
  });

  // Highest similarity first
  scoredChunks.sort((a, b) => b.score - a.score);

  // Return the most relevant chunks
  return scoredChunks.slice(0, topK);
};

module.exports = getRelevantChunks;