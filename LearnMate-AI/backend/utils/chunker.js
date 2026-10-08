const chunkText = (text, chunkSize = 1000, overlap = 100) => {
  if (!text || !text.trim()) {
    return [];
  }

  const chunks = [];

  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;

    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
};

module.exports = chunkText;