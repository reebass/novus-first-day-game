(function () {
  "use strict";

  window.NOVUS_CONFIG = {
    // ========================================
    // ТУТ ВКАЗУЄТЬСЯ GOOGLE APPS SCRIPT URL
    // ========================================
    // Вставте сюди URL Google Apps Script Web App для відправки анкети в Google Sheets.
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwO0YExM-6eu8JMBvSSAl3VyqyfUY2lEP8hn96ZMZgSYluyBEd1HxrEP26lr5Jemun9/exec",

    // ========================================
    // ТУТ ЗМІНЮЮТЬСЯ СПИСКИ ПОСАД І РАЙОНІВ
    // ========================================
    positions: [
      "Касир",
      "Продавець - зона прилавку",
      "Продавець - зона викладки товару",
      "Кухар",
      "Обвалювальник",
      "Кондитер",
      "Пекар",
      "Вантажник"
    ],
    districts: [
      "Голосіївський",
      "Дарницький",
      "Деснянський",
      "Дніпровський",
      "Оболонський",
      "Печерський",
      "Подільський",
      "Святошинський",
      "Солом’янський",
      "Шевченківський"
    ],

    // ========================================
    // ТУТ ЗМІНЮЮТЬСЯ ШЛЯХИ ДО КАРТИНОК
    // ========================================
    heroImages: {
      happy: "assets/hero/Brand_Hero_Novus_normal_2_right.png",
      support: "assets/hero/Brand_Hero_Novus_thinking_right.png",
      surprised: "assets/hero/Brand_Hero_Novus_Attention_2_right.png",
      celebrate: "assets/hero/Brand_Hero_Novus_normal_2_right.png"
    },
    sceneImages: {
      start: "assets/scenes/start.png",
      manager: "assets/scenes/manager.png",
      training: "assets/scenes/training.png",
      uniform: "assets/scenes/uniform.png",
      staffRoom: "assets/scenes/staff-room.png",
      lunchBreak: "assets/scenes/lunch-break.png",
      tour: "assets/scenes/store-tour.png",
      customer: "assets/scenes/customer-help.png",
      roleChoice: "assets/scenes/role-choice.png",
      cashier: "assets/scenes/cashier.png",
      shelf: "assets/scenes/shelf-seller.png",
      counter: "assets/scenes/counter-seller.png",
      final: "assets/scenes/final.mp4",
      declineThanks: "assets/scenes/decline-thanks.mp4"
    },

    progress: [
      { key: "start", label: "Старт" },
      { key: "training", label: "Навчання" },
      { key: "uniform", label: "Спецодяг" },
      { key: "tour", label: "Екскурсія" },
      { key: "role", label: "Роль" },
      { key: "practice", label: "Практика" },
      { key: "form", label: "Анкета" }
    ],

    game: {
      firstScreen: "start",
      wrongText: "УПС, спробуй ще раз!",
      supportHint: "Не хвилюйся, я розумію, що ти новачок. Обирай ось ці варіанти та рухаємось далі.",
      finalThanks: "Дякуємо! Чекаємо на тебе в NOVUS.",
      answerDelay: 1400
    }
  };
})();
