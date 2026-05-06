const translationCache = new Map();

export const translateText = async (text, targetLang) => {
  if (!text || targetLang === "en") return text;
  
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // The translation is in data[0], which is an array of sentence translations.
    // We join them in case the text was multiple sentences.
    const translatedText = data[0].map((item) => item[0]).join("");
    
    translationCache.set(cacheKey, translatedText);
    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text if translation fails
  }
};
