(function () {
  "use strict";

  // ========================================
  // ТУТ ЗМІНЮЮТЬСЯ ТЕКСТИ ГРИ
  // ========================================
  window.NOVUS_GAME_DATA = {
    scenes: {
      start: { label: "Старт / NOVUS welcome", icon: "★" },
      manager: { label: "Зустріч із керівником", icon: "✓" },
      training: { label: "Портал «Супутник»", icon: "?" },
      uniform: { label: "Спецодяг NOVUS", icon: "◆" },
      staffRoom: { label: "Кімната персоналу", icon: "◌" },
      lunchBreak: { label: "Обідня перерва", icon: "◌" },
      tour: { label: "Екскурсія торговельною залою", icon: "→" },
      customer: { label: "Клієнт у торговельному залі", icon: "!" },
      roleChoice: { label: "Вибір ролі", icon: "3" },
      cashier: { label: "Каса", icon: "₴" },
      shelf: { label: "Викладка товарів", icon: "▦" },
      counter: { label: "Зона прилавків", icon: "◫" },
      final: { label: "Фінал", icon: "✦" },
      declineThanks: { label: "NOVUS чекає на тебе", icon: "N" }
    },

    screens: {
      start: {
        id: "start",
        type: "content",
        progress: "start",
        title: "Доброго дня, колего!",
        text: [
          "Вітаємо вас у великій та дружній команді NOVUS!",
          "Знаємо, що перший день зазвичай сповнений хвилювання. Та все буде добре - просто довіртесь!",
          "А ми зробимо все можливе, щоб ваш старт був максимально комфортним.",
          "Пірнаємо?"
        ],
        scene: "start",
        hero: "happy",
        showHeroOverlay: false,
        actions: [
          { label: "Почати перший день", next: "manager", primary: true, pulse: true }
        ]
      },
      manager: {
        id: "manager",
        type: "choice",
        progress: "start",
        title: "Ну ось і він - ваш керівник!",
        text: [
          "Він підтримуюче посміхається вам та представляє команді.",
          "Що ж буде далі?"
        ],
        scene: "manager",
        hero: "surprised",
        showHeroOverlay: true,
        actions: [
          { label: "Адаптаційне навчання", next: "trainingIntro", primary: true }
        ]
      },
      trainingIntro: {
        id: "trainingIntro",
        type: "choice",
        progress: "training",
        title: "Вітаємо вас на навчальній платформі Супутник!",
        text: [
          "Це відкритий навчально-інформаційний портал Компанії.",
          "Пропонуємо відповісти на декілька запитань, щоб ближче познайомитись з Компанією NOVUS?"
        ],
        scene: "training",
        hero: "happy",
        showHeroOverlay: true,
        actions: [
          { label: "Так, я готовий, які там питання?", next: "trainingQuestion1", primary: true },
          { label: "Піду краще знову до свого керівника", next: "manager" }
        ]
      },
      trainingQuestion1: {
        id: "trainingQuestion1",
        type: "question",
        progress: "training",
        title: "Адаптація",
        text: ["Головною причиною бізнесу NOVUS є:"],
        scene: "training",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "client", label: "Клієнт", correct: true },
          { id: "income", label: "Високий дохід" },
          { id: "stores", label: "Велика кількість магазинів" },
          { id: "assortment", label: "Широкий асортимент" }
        ],
        success: "Саме так! У центрі нашої роботи завжди Клієнт.",
        next: "trainingQuestion2"
      },
      trainingQuestion2: {
        id: "trainingQuestion2",
        type: "question",
        progress: "training",
        title: "Адаптація",
        text: [
          "Компанія NOVUS має 100% литовського інвестиційного капіталу, нараховує 11 власних марок та заснована у:"
        ],
        scene: "training",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "1999", label: "1999 році" },
          { id: "2019", label: "2019 році" },
          { id: "2009", label: "2009 році", correct: true }
        ],
        success: "Влучно! 2009 рік - важлива дата в історії NOVUS.",
        next: "trainingQuestion3"
      },
      trainingQuestion3: {
        id: "trainingQuestion3",
        type: "multi",
        progress: "training",
        title: "Адаптація",
        text: ["На яких цінностях базується корпоративна культура NOVUS?"],
        note: "Оберіть рівно 3 варіанти.",
        scene: "training",
        hero: "happy",
        showHeroOverlay: true,
        requiredCount: 3,
        answers: [
          { id: "care", label: "Турбота", correct: true },
          { id: "reliability", label: "Надійність", correct: true },
          { id: "rationality", label: "Раціональність", correct: true },
          { id: "emotion", label: "Емоційність" },
          { id: "speed", label: "Швидкість" }
        ],
        closeText: "Чудово! Ти був дуже близьким. Правильна відповідь: Турбота, Надійність, Раціональність.",
        success: "Чудово! Саме турбота, надійність та раціональність є основою нашої корпоративної культури.",
        next: "uniform"
      },
      uniform: {
        id: "uniform",
        type: "choice",
        progress: "uniform",
        title: "Ви отримуєте спеціальний одяг!",
        text: ["Ми впевнені, вам дуже пасуватимуть брендовані елементи зеленого кольору."],
        scene: "uniform",
        hero: "happy",
        showHeroOverlay: false,
        actions: [
          { label: "Шукаю очима дзеркало, щоб помилуватись собою", next: "staffRoom", primary: true },
          { label: "Покличу керівника", next: "tourQuestion1" }
        ]
      },
      staffRoom: {
        id: "staffRoom",
        type: "content",
        progress: "uniform",
        title: "Ось воно де - в кімнаті побуту персоналу.",
        text: [
          "А ще тут дуже комфортно: є обладнані душові, шафки для перевдягання та техніка.",
          "І спецодяг сів ідеально!",
          "Ой, а хто це позаду в дзеркалі дивиться на мене й усміхається?",
          "Та це ж мій керівник.",
          "Трохи незручна ситуація, але він мені подобається.",
          "Я готовий вирушати на екскурсію торговельним центром."
        ],
        scene: "staffRoom",
        hero: "surprised",
        showHeroOverlay: false,
        actions: [
          { label: "Розпочати екскурсію", next: "tourQuestion1", primary: true }
        ]
      },
      tourQuestion1: {
        id: "tourQuestion1",
        type: "question",
        progress: "tour",
        title: "Екскурсія по торговельному центру",
        text: [
          "Керівник проводить вас торговельною залою. Знайомить з обладнанням та процесами.",
          "Весь персонал такий привітний!",
          "Адже основна цінність Компанії NOVUS, на якій базується ставлення до клієнтів та персоналу - це?"
        ],
        scene: "tour",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "care", label: "Турбота", correct: true },
          { id: "leniency", label: "Поблажливість" },
          { id: "confidence", label: "Впевненість" }
        ],
        success: "Саме так! Турбота відчувається і в команді, і в роботі з клієнтами.",
        next: "tourQuestion2"
      },
      tourQuestion2: {
        id: "tourQuestion2",
        type: "question",
        progress: "tour",
        title: "Екскурсія по торговельному центру",
        text: [
          "Здається, хтось із клієнтів прийняв мене за повноцінного співробітника та питає, чи знаю я, де знайти зефір власної торгової марки NOVUS.",
          "Я поки погано орієнтуюсь на місці.",
          "Мої дії:"
        ],
        scene: "customer",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "infocenter", label: "Пораджу клієнту звернутись до інфоцентру / інфокаси", correct: true },
          { id: "dontKnow", label: "Відповім, що в мене перший робочий день і я нічого не знаю" },
          { id: "silence", label: "Нічого не відповім" }
        ],
        success: "Гарний вибір! Навіть у перший день можна допомогти клієнту знайти потрібне рішення.",
        next: "roleChoice"
      },
      roleChoice: {
        id: "roleChoice",
        type: "role",
        progress: "role",
        title: "Ви - молодець!",
        text: [
          "Підготовчі етапи пройдені, і тепер можна приступати до навчання на робочому місці.",
          "За вами закріплено наставника - він і є ваш путівник у світ професії в NOVUS.",
          "Оберіть свою роль:"
        ],
        scene: "roleChoice",
        hero: "surprised",
        showHeroOverlay: true,
        roles: [
          { label: "Касир", position: "Касир", next: "cashierQuestion1" },
          { label: "Продавець - викладка товарів", position: "Продавець - зона викладки товару", next: "shelfQuestion1" },
          { label: "Продавець - зона прилавків", position: "Продавець - зона прилавку", next: "counterQuestion1" }
        ]
      },
      cashierQuestion1: {
        id: "cashierQuestion1",
        type: "question",
        progress: "practice",
        title: "Робота в касовій зоні",
        text: [
          "А ось і перший клієнт.",
          "Але я почуваю себе впевнено, адже поряд зі мною наставник.",
          "Клієнт звернувся з проханням продати цигарки та лотерейний квиток.",
          "Мої дії:"
        ],
        scene: "cashier",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "lottery", label: "Просканую тільки лотерейний квиток" },
          { id: "age", label: "Упевнюсь, що клієнт повнолітній, та просканую обидві позиції", correct: true },
          { id: "everything", label: "Просканую все, що просить клієнт, адже його бажання - закон" }
        ],
        success: "Так тримати! Уважність касира - це і турбота, і відповідальність.",
        next: "cashierQuestion2"
      },
      cashierQuestion2: {
        id: "cashierQuestion2",
        type: "question",
        progress: "practice",
        title: "Робота в касовій зоні",
        text: ["Клієнт запитує про пакет.", "Що відповісти?"],
        scene: "cashier",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "noBags", label: "Відповім, що в нашій мережі немає пакетів" },
          { id: "giveBag", label: "Самостійно знайду і видам клієнту" },
          { id: "location", label: "Підкажу про його розміщення", correct: true }
        ],
        success: "Супер! Ти допомагаєш клієнту й водночас дієш за процесом.",
        next: "cashierLunchBreak"
      },
      cashierLunchBreak: {
        id: "cashierLunchBreak",
        type: "content",
        progress: "practice",
        title: "Обідня перерва",
        text: [
          "Мене запросили на обід до їдальні. Кажуть, що за рахунок Компанії.",
          "Чудово, що NOVUS такий турботливий та піклується про мене."
        ],
        scene: "lunchBreak",
        hero: "happy",
        showHeroOverlay: false,
        actions: [
          { label: "Повернутись до роботи", next: "cashierQuestion3", primary: true }
        ]
      },
      cashierQuestion3: {
        id: "cashierQuestion3",
        type: "question",
        progress: "practice",
        title: "Робота в касовій зоні",
        text: [
          "Здається, в мене непогано виходить!",
          "Вже новий клієнт на касі.",
          "Він просить мене розміняти готівку.",
          "Я:"
        ],
        scene: "cashier",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "exchange", label: "Здійсню розмін коштів" },
          { id: "bank", label: "Повідомлю клієнта, що ми не пропонуємо послугу обміну готівки, це повноваження банку", correct: true },
          { id: "senior", label: "Покличу старшого касира для розміну" }
        ],
        success: "Влучно! Ти коректно пояснив ситуацію і не вийшов за межі повноважень.",
        next: "cashierQuestion4"
      },
      cashierQuestion4: {
        id: "cashierQuestion4",
        type: "question",
        progress: "practice",
        title: "Робота в касовій зоні",
        text: [
          "Зараз пікова доба.",
          "На касі велика черга.",
          "Серед відвідувачів є вагітна жінка.",
          "До мене звертається клієнт із проханням обслужити його поза чергою, адже він має інвалідність I групи.",
          "Мої дії:"
        ],
        scene: "cashier",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "noExceptions", label: "Скажу клієнту, що в нас винятків немає" },
          { id: "pregnant", label: "Запропоную вагітній жінці пройти поза чергою" },
          { id: "disability", label: "Розрахую клієнта, що має інвалідність I групи першим", correct: true }
        ],
        success: "Чудово! Це уважне й коректне рішення в ситуації з пріоритетним обслуговуванням.",
        next: "final"
      },
      shelfQuestion1: {
        id: "shelfQuestion1",
        type: "question",
        progress: "practice",
        title: "Робота в стелажній зоні",
        text: [
          "Ось той самий стелаж, з якого я багато разів обирав товари у супермаркеті.",
          "А тепер я ніби по інший бік процесу.",
          "Бачу клієнта. Здається, він збирається звернутись до мене.",
          "Дійсно, клієнт питає про томатну пасту, яка відсутня на полицях, але є у ціннику.",
          "Мої дії:"
        ],
        scene: "shelf",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "alternative", label: "Запропоную замінити на іншу томатну пасту з аналогічними властивостями", correct: true },
          { id: "panic", label: "Впаду в паніку та викличу адміністратора" },
          { id: "later", label: "Запропоную підійти трішки пізніше в магазин" }
        ],
        success: "Гарна реакція! Ти не залишаєш клієнта без рішення.",
        next: "shelfQuestion2"
      },
      shelfQuestion2: {
        id: "shelfQuestion2",
        type: "question",
        progress: "practice",
        title: "Робота в стелажній зоні",
        text: [
          "Наступний клієнт побачив мене та звертається з проханням обміняти товар.",
          "Мої дії:"
        ],
        scene: "shelf",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "refund", label: "Максимально швидко заміню товар або заберу товар та поверну за нього кошти клієнту, взявши відповідну суму в будь-якій касі магазину" },
          { id: "admin", label: "Пораджу клієнту звернутись до адміністратора магазину" },
          { id: "infocenter", label: "Пораджу клієнту звернутись на інфоцентр, а за відсутності інфоцентру - на першу касу", correct: true }
        ],
        success: "Саме так! Ти скеровуєш клієнта до відповідного фахівця, який зможе якнайшвидше допомогти з його питанням.",
        next: "shelfLunchBreak"
      },
      shelfLunchBreak: {
        id: "shelfLunchBreak",
        type: "content",
        progress: "practice",
        title: "Обідня перерва",
        text: [
         "Мене запросили на обід до їдальні. Кажуть, що за рахунок Компанії.",
          "Чудово, що NOVUS такий турботливий та піклується про мене."
        ],
        scene: "lunchBreak",
        hero: "happy",
        showHeroOverlay: false,
        actions: [
          { label: "Повернутись до роботи", next: "shelfQuestion3", primary: true }
        ]
      },
      shelfQuestion3: {
        id: "shelfQuestion3",
        type: "question",
        progress: "practice",
        title: "Робота в стелажній зоні",
        text: [
          "Здається, цей клієнт розлючений.",
          "Він емоційно звертається до мене зі скаргою - йому просканували зайвий товар у чеку.",
          "Але я ж працюю на викладці!",
          "Мої дії:"
        ],
        scene: "shelf",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "alone", label: "Спробую самостійно вирішити питання, чого б мені це не коштувало" },
          { id: "representative", label: "Викличу представника адміністрації", correct: true },
          { id: "security", label: "Викличу охорону" }
        ],
        success: "Правильно! У складних ситуаціях важливо швидко залучити відповідального колегу.",
        next: "final"
      },
      counterQuestion1: {
        id: "counterQuestion1",
        type: "question",
        progress: "practice",
        title: "Робота в заприлавочній зоні",
        text: [
          "Ознайомився з асортиментом.",
          "Все таке смачне та свіже!",
          "Ось і перший клієнт.",
          "Він виявляється дуже допитливим.",
          "Питає склад того самого салату «Червона галявина».",
          "Мабуть, бачив наш відеоролик на сторінці Facebook “Робота в NOVUS”.",
          "Мої дії:"
        ],
        scene: "counter",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "sticker", label: "Зважу товар на вагах і роздрукую стікер із переліком інгредієнтів", correct: true },
          { id: "kitchen", label: "Уточню склад на кухні" },
          { id: "manual", label: "Подивлюсь у довіднику продавця за прилавком" }
        ],
        success: "Супер! Ти швидко знаходиш інформацію й допомагаєш клієнту зробити вибір.",
        next: "counterQuestion2"
      },
      counterQuestion2: {
        id: "counterQuestion2",
        type: "question",
        progress: "practice",
        title: "Робота в заприлавочній зоні",
        text: [
          "Зараз пікова доба, і біля прилавку велика черга з клієнтів.",
          "Оце так випробування!",
          "Але я почуваюся впевнено, адже в мене є наставник.",
          "Хочу спробувати вирішити ситуацію самостійно.",
          "Мої дії:"
        ],
        scene: "counter",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "upsell", label: "Буду діяти максимально швидко, приділяти кожному клієнту достатньо часу, а також пропонувати додаткові пропозиції" },
          { id: "queue", label: "Буду діяти максимально швидко, приділяти кожному клієнту достатньо часу. Додаткові пропозиції пропонувати не буду", correct: true },
          { id: "chaos", label: "Впаду в паніку та почну все робити хаотично" }
        ],
        success: "Влучно! У піковий час головне - якісно та швидко обслужити чергу.",
        next: "counterLunchBreak"
      },
      counterLunchBreak: {
        id: "counterLunchBreak",
        type: "content",
        progress: "practice",
        title: "Обідня перерва",
        text: [
          "Мене запросили на обід до їдальні. Кажуть, що за рахунок Компанії.",
          "Чудово, що NOVUS такий турботливий та піклується про мене."
        ],
        scene: "lunchBreak",
        hero: "happy",
        showHeroOverlay: false,
        actions: [
          { label: "Повернутись до роботи", next: "counterQuestion3", primary: true }
        ]
      },
      counterQuestion3: {
        id: "counterQuestion3",
        type: "question",
        progress: "practice",
        title: "Робота в заприлавочній зоні",
        text: [
          "Обслуговую клієнта.",
          "У процесі розмови до мене звертається інший клієнт.",
          "Мої дії:"
        ],
        scene: "counter",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "ignore", label: "Продовжу обслуговувати першого клієнта, нічого не відповідаючи другому" },
          { id: "busy", label: "Відповім другому клієнту, що зайнятий і не можу наразі приділити йому уваги" },
          { id: "soon", label: "Зазначу другому клієнту, що зможу приділити йому увагу трішки згодом", correct: true }
        ],
        success: "Гарний вибір! Ти не перериваєш обслуговування і водночас не ігноруєш іншого клієнта.",
        next: "counterQuestion4"
      },
      counterQuestion4: {
        id: "counterQuestion4",
        type: "question",
        progress: "practice",
        title: "Робота в заприлавочній зоні",
        text: [
          "Ця страва, мабуть, смачна, адже позиція вже майже скінчилась.",
          "Але клієнт питає саме її.",
          "Мої дії:"
        ],
        scene: "counter",
        hero: "happy",
        showHeroOverlay: true,
        answers: [
          { id: "substitute", label: "Запропоную замінити необхідну позицію на іншу з аналогічними властивостями", correct: true },
          { id: "later", label: "Запропоную підійти трішки пізніше в магазин" },
          { id: "admin", label: "Викличу адміністратора" }
        ],
        success: "Чудово! Ти допомагаєш клієнту знайти альтернативу й не залишаєш його без рішення.",
        next: "final"
      },
      final: {
        id: "final",
        type: "finalForm",
        progress: "form",
        title: "Ось і минув перший день в NOVUS",
        text: [
          "Було швидко та цікаво, правда?",
          "А поруч завжди була команда, що підтримує в будь-якій ситуації.",
          "А ще у нас в Компанії діє програма [[«Я рекомендую».]]",
          "Приходь сам/сама та рекомендуй друзів - і додатково отримуй від [[4000 грн]].",
          "Якщо вас зацікавила робота в NOVUS, просимо надати відповідь на декілька простих запитань, щоб наші фахівці могли підтримувати з вами контакт у майбутньому."
        ],
        scene: "final",
        hero: "celebrate",
        showHeroOverlay: false
      },
      thanks: {
        id: "thanks",
        type: "thanks",
        progress: "form",
        title: "Дякуємо! Чекаємо на тебе в NOVUS.",
        text: ["Наші фахівці зможуть зв’язатися з тобою щодо вакансій NOVUS."],
        scene: "final",
        hero: "happy",
        showHeroOverlay: false
      },
      declineThanks: {
        id: "declineThanks",
        type: "thanks",
        progress: "form",
        title: "Дуже шкода!",
        text: ["Але ви завжди можете змінити свою думку. Чекатимемо в NOVUS."],
        scene: "declineThanks",
        hero: "happy",
        showHeroOverlay: false
      }
    }
  };
})();
