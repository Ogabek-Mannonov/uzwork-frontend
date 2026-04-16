/**
 * Matnni tanlangan tilga tarjima qilish uchun Python servisiga (localhost:8080) murojaat qiladi.
 */
export const translateToUzbek = async (text, targetLang = "uz") => {
  if (!text || typeof text !== "string") return null;
  
  try {
    const response = await fetch("http://localhost:8080/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        text,
        target_lang: targetLang
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Agar backend 'translated_text' qaytarsa
    if (data.translated_text) {
      return data.translated_text;
    }
    
    // Agar xatolik bo'lsa
    if (data.error) {
      console.error("Backend translation error:", data.error);
    }
    
    return null;
  } catch (error) {
    console.error("Translation fetch error:", error);
    return null;
  }
};
