import type { Lang } from "./dictionaries";

type LandingText = {
  brandDesc: string;
  tryMvp: string;
  problemQuestion: string;
  p1Num: string; p1Text: string;
  p2Num: string; p2Text: string;
  p3Num: string; p3Text: string;
  solutionTitle: string;
  solutionLead: string;
  solutionForWhoTitle: string;
  solutionForWho: string;
  solutionGivesTitle: string;
  solutionGives: string;
  solutionDoctor: string;
  slogan: string;
  tryProduct: string;
};

export const landingText: Record<Lang, LandingText> = {
  en: {
    brandDesc:
      "Reads a lumbar spine MRI and a short clinical form, flags the emergencies, and estimates the chance of natural recovery. A clinician's assistant, not a diagnosis.",
    tryMvp: "Try the MVP",
    problemQuestion: "What is the problem?",
    p1Num: "619M",
    p1Text:
      "people live with low back pain, the number one cause of disability in the world.",
    p2Num: "About 66%",
    p2Text:
      "of herniations heal on their own, yet many are still operated on needlessly.",
    p3Num: "About 23%",
    p3Text:
      "of spinal surgery lawsuits involve a missed emergency. It is easy to overlook.",
    solutionTitle: "The solution",
    solutionLead:
      "Absorbi gives clinicians an instant, objective second read. From an MRI and a short clinical form it returns a triage signal that flags the emergencies, and an honest resorption estimate with a recovery timeline.",
    solutionForWhoTitle: "Who it is for",
    solutionForWho: "Neurologists, neurosurgeons, and radiologists.",
    solutionGivesTitle: "What it gives",
    solutionGives:
      "A red flag triage signal and an honest resorption estimate with a range and a timeline.",
    solutionDoctor:
      "The final word always belongs to the doctor. Absorbi decides nothing on its own, it only helps.",
    slogan: "Fewer needless surgeries. More confident decisions.",
    tryProduct: "Try the product",
  },
  ru: {
    brandDesc:
      "Читает МРТ поясницы и короткую клиническую форму, выявляет неотложные случаи и оценивает шанс естественного восстановления. Помощник врача, а не диагноз.",
    tryMvp: "Испытать MVP",
    problemQuestion: "В чём проблема?",
    p1Num: "619 млн",
    p1Text:
      "человек живут с болью в пояснице, это причина инвалидности номер один в мире.",
    p2Num: "около 66%",
    p2Text:
      "грыж рассасываются сами, но многих всё равно оперируют напрасно.",
    p3Num: "около 23%",
    p3Text:
      "судебных исков в спинальной хирургии связаны с пропущенной неотложностью. Её легко упустить.",
    solutionTitle: "Решение",
    solutionLead:
      "Absorbi даёт врачу мгновенный объективный второй взгляд. По МРТ и короткой клинической форме он возвращает сигнал триажа, который выделяет неотложные случаи, и честную оценку рассасывания со сроками восстановления.",
    solutionForWhoTitle: "Для кого",
    solutionForWho: "Неврологи, нейрохирурги и рентгенологи.",
    solutionGivesTitle: "Что даёт",
    solutionGives:
      "Сигнал триажа для тревожных признаков и честную оценку рассасывания с диапазоном и сроками.",
    solutionDoctor:
      "Последнее слово всегда за врачом. Absorbi ничего не решает сам, он только помогает.",
    slogan: "Меньше лишних операций. Больше уверенных решений.",
    tryProduct: "Испытать продукт",
  },
  kk: {
    brandDesc:
      "Бел омыртқасының МРТ-сын және қысқа клиникалық форманы оқып, шұғыл жағдайларды анықтайды және табиғи қалпына келу мүмкіндігін бағалайды. Диагноз емес, дәрігердің көмекшісі.",
    tryMvp: "MVP қолданып көру",
    problemQuestion: "Мәселе неде?",
    p1Num: "619 млн",
    p1Text:
      "адам бел ауруымен өмір сүреді, бұл әлемдегі мүгедектіктің бірінші себебі.",
    p2Num: "шамамен 66%",
    p2Text:
      "жарық өздігінен жазылады, бірақ көбіне қажетсіз операцияланады.",
    p3Num: "шамамен 23%",
    p3Text:
      "омыртқа хирургиясындағы сот істері өткізіп алынған шұғыл жағдайға байланысты. Оны байқамай қалу оңай.",
    solutionTitle: "Шешім",
    solutionLead:
      "Absorbi дәрігерге лезде объективті екінші көзқарас береді. МРТ мен қысқа клиникалық форма бойынша ол шұғыл жағдайларды бөліп көрсететін триаж сигналын және қалпына келу мерзімімен бірге адал резорбция бағасын қайтарады.",
    solutionForWhoTitle: "Кімге арналған",
    solutionForWho: "Неврологтар, нейрохирургтар және рентгенологтар.",
    solutionGivesTitle: "Не береді",
    solutionGives:
      "Қауіп белгілері үшін триаж сигналы және аралығы мен мерзімі бар адал резорбция бағасы.",
    solutionDoctor:
      "Соңғы сөз әрқашан дәрігерде. Absorbi өздігінен ешнәрсе шешпейді, тек көмектеседі.",
    slogan: "Артық операциялар азырақ. Сенімді шешімдер көбірек.",
    tryProduct: "Өнімді қолданып көру",
  },
};
