/**
 * Matnni tanlangan tilga tarjima qilish uchun Python servisiga (localhost:8080) murojaat qiladi.
 * (Yakka xabarlar uchun)
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

    if (data.translated_text) {
      return data.translated_text;
    }

    if (data.error) {
      console.error("Backend translation error:", data.error);
    }

    return null;
  } catch (error) {
    console.error("Translation fetch error:", error);
    return null;
  }
};

/**
 * KO'PLAB matnlarni bitta so'rovda tarjima qilish uchun (BATCH API)
 * (Avto-tarjima va skroll uchun)
 */
export const translateBatchToUzbek = async (messagesArray, targetLang = "uz") => {
  if (!messagesArray || messagesArray.length === 0) return {};

  try {
    const response = await fetch("http://localhost:8080/translate-batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messagesArray,
        target_lang: targetLang
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Agar backend { translations: { "1": "Salom", "2": "Qalay" } } qaytarsa
    if (data.translations) {
      return data.translations;
    }

    return {};
  } catch (error) {
    console.error("Batch translation fetch error:", error);
    return {};
  }
};