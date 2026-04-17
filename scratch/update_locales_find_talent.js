const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');

const newTranslations = {
  findTalent: {
    badges: {
      top_rated_plus: "Yuqori baholangan+",
      top_rated: "Yuqori baholangan",
      rising_talent: "Yangi iste'dod"
    },
    filter: {
      title: "Filtrlar",
      clearAll: "Tozalash",
      clearAllCount: "Barcha filtrlarni tozalash ({{count}})",
      talentBadge: "Mutaxassis darajasi",
      talentBadgeInfo: "Natijalariga qarab berilgan yutuqlar",
      hourlyRate: "Soatlik ish haqi",
      under: "{{min}} dan kam",
      location: "Joylashuv",
      searchLocation: "Shahar, mamlakat yoki hudud",
      jobSuccess: "Muvaffaqiyat ko'rsatkichi",
      jobSuccessInfo: "Minimal ishdagi muvaffaqiyat foizi",
      successUp: "{{percent}}% va undan yuqori",
      englishLevel: "Ingliz tili darajasi"
    },
    results: {
      searchPlaceholder: "Malaka yoki ism bo'yicha qidiring",
      advancedSearch: "Kengaytirilgan qidiruv",
      freelancersFound: "{{count}} ta mutaxassis topildi",
      location: "Joylashuv",
      successCount: "{{percent}}%+ muvaffaqiyat",
      sort: {
        relevance: "Eng mos tushadigan",
        rate_asc: "Narx: Arzondan Qimmatga",
        rate_desc: "Narx: Qimmatdan Arzonga",
        success: "Ishdagi muvaffaqiyat",
        earned: "Eng ko'p ishlagan"
      },
      loading: "Mutaxassislar yuklanmoqda...",
      empty: "Hech qanday mutaxassis topilmadi",
      emptySub: "Filtrlarni yoki qidiruv so'zini o'zgartirib ko'ring",
      loadMore: "Yana yuklash",
      loadingMore: "Yana mutaxassislar yuklanmoqda..."
    },
    card: {
      save: "Mutaxassisni saqlash",
      invited: "Taklif qilingan",
      invite: "Ishga taklif qilish",
      success: "Muvaffaqiyat",
      earned: "topilgan",
      consults: "Konsultatsiya beradi",
      insights: "{{name}} haqida qisqacha ma'lumot",
      insightsInfo: "AI tomonidan yozilgan ma'lumotlar",
      feedback: "Fikr-mulohaza bering",
      associatedWith: "Bilan bog'liq",
      viewProfile: "Profilni ko'rish",
      sendMessage: "Xabar yozish",
      saveAction: "Saqlash",
      boosted: "Tavsiya etilgan"
    },
    nations: {
      uz: "O'zbekiston",
      tashkent: "Toshkent",
      samarkand: "Samarqand",
      bukhara: "Buxoro",
      kz: "Qozog'iston",
      kg: "Qirg'iziston",
      remote: "Masofadan (Istalgan joy)"
    },
    englishLevels: {
      any: "Istalgan daraja",
      basic: "Boshlang'ich",
      conversational: "So'zlashuvchi",
      fluent: "Erkin",
      native: "Ona tili"
    }
  }
};

const enTranslations = {
  findTalent: {
    badges: {
      top_rated_plus: "Top Rated Plus",
      top_rated: "Top Rated",
      rising_talent: "Rising Talent"
    },
    filter: {
      title: "Filters",
      clearAll: "Clear all",
      clearAllCount: "Clear all filters ({{count}})",
      talentBadge: "Talent badge",
      talentBadgeInfo: "Badges awarded based on performance",
      hourlyRate: "Hourly rate",
      under: "under ${{min}}",
      location: "Location",
      searchLocation: "City, country or region",
      jobSuccess: "Job success",
      jobSuccessInfo: "Minimum job success score",
      successUp: "{{percent}}% & up",
      englishLevel: "English level"
    },
    results: {
      searchPlaceholder: "Search for a skill or name",
      advancedSearch: "Advanced search",
      freelancersFound: "{{count}} freelancers found",
      location: "Location",
      successCount: "{{percent}}%+ success",
      sort: {
        relevance: "Best Match",
        rate_asc: "Rate: Low to High",
        rate_desc: "Rate: High to Low",
        success: "Job Success",
        earned: "Most Earned"
      },
      loading: "Loading freelancers...",
      empty: "No freelancers found",
      emptySub: "Try adjusting your filters or search query",
      loadMore: "Load more",
      loadingMore: "Loading more freelancers..."
    },
    card: {
      save: "Save freelancer",
      invited: "Invited",
      invite: "Invite to job",
      success: "Job Success",
      earned: "earned",
      consults: "Offers consultations",
      insights: "Insights about {{name}}",
      insightsInfo: "AI-generated insights",
      feedback: "Insight feedback",
      associatedWith: "Associated with",
      viewProfile: "View Profile",
      sendMessage: "Send Message",
      saveAction: "Save",
      boosted: "Boosted"
    },
    nations: {
      uz: "Uzbekistan",
      tashkent: "Tashkent",
      samarkand: "Samarkand",
      bukhara: "Bukhara",
      kz: "Kazakhstan",
      kg: "Kyrgyzstan",
      remote: "Remote (Any)"
    },
    englishLevels: {
      any: "Any level",
      basic: "Basic",
      conversational: "Conversational",
      fluent: "Fluent",
      native: "Native"
    }
  }
};

const ruTranslations = {
  findTalent: {
    badges: {
      top_rated_plus: "Высокий рейтинг+",
      top_rated: "Высокий рейтинг",
      rising_talent: "Восходящий талант"
    },
    filter: {
      title: "Фильтры",
      clearAll: "Очистить все",
      clearAllCount: "Очистить все фильтры ({{count}})",
      talentBadge: "Уровень таланта",
      talentBadgeInfo: "Значки присуждаются на основе результатов",
      hourlyRate: "Почасовая ставка",
      under: "менее ${{min}}",
      location: "Локация",
      searchLocation: "Город, страна или регион",
      jobSuccess: "Успех работы",
      jobSuccessInfo: "Минимальный процент успеха",
      successUp: "{{percent}}% и выше",
      englishLevel: "Уровень английского"
    },
    results: {
      searchPlaceholder: "Поиск по навыку или имени",
      advancedSearch: "Расширенный поиск",
      freelancersFound: "{{count}} специалистов найдено",
      location: "Локация",
      successCount: "{{percent}}%+ успех",
      sort: {
        relevance: "Наиболее подходящие",
        rate_asc: "Ставка: По возрастанию",
        rate_desc: "Ставка: По убыванию",
        success: "Успех работы",
        earned: "Наибольший заработок"
      },
      loading: "Загрузка специалистов...",
      empty: "Специалисты не найдены",
      emptySub: "Попробуйте изменить фильтры или поисковый запрос",
      loadMore: "Загрузить больше",
      loadingMore: "Загрузка остальных..."
    },
    card: {
      save: "Сохранить специалиста",
      invited: "Приглашен",
      invite: "Пригласить на работу",
      success: "Успех",
      earned: "заработано",
      consults: "Предлагает консультации",
      insights: "Информация о {{name}}",
      insightsInfo: "Сгенерировано ИИ",
      feedback: "Оценить",
      associatedWith: "Связан с",
      viewProfile: "Смотреть профиль",
      sendMessage: "Написать",
      saveAction: "Сохранить",
      boosted: "Продвигаемый"
    },
    nations: {
      uz: "Узбекистан",
      tashkent: "Ташкент",
      samarkand: "Самарканд",
      bukhara: "Бухара",
      kz: "Казахстан",
      kg: "Кыргызстан",
      remote: "Удаленно (Любой)"
    },
    englishLevels: {
      any: "Любой уровень",
      basic: "Начальный",
      conversational: "Разговорный",
      fluent: "Свободный",
      native: "Как родной"
    }
  }
};

const updateFile = (lang, newObj) => {
  const p = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.findTalent = newObj.findTalent;
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    console.log(lang + ' updated.');
  }
};

updateFile('uz', newTranslations);
updateFile('en', enTranslations);
updateFile('ru', ruTranslations);
