document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcomeScreen");
  const app = document.getElementById("app");

  // === Система сохранения ===
  function loadProgress() {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) notes = JSON.parse(savedNotes);
    const savedFacts = localStorage.getItem("facts");
    if (savedFacts) facts = new Set(JSON.parse(savedFacts));
    const savedUnlocked = localStorage.getItem("unlockedLocations");
    if (savedUnlocked) {
      const unlockedIds = JSON.parse(savedUnlocked);
      locations.forEach(loc => {
        loc.unlocked = unlockedIds.includes(loc.id);
      });
    }
  }

  function saveProgress() {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("facts", JSON.stringify(Array.from(facts)));
    localStorage.setItem("unlockedLocations", JSON.stringify(locations.filter(l => l.unlocked).map(l => l.id)));
  }

  // === Персонажи ===
  const characters = {
    "maid_anna": {
      name: "Горничная Анна",
      description: "Молодая и застенчивая, но внимательная к деталям.",
      motive: "Лорд Винтер бросил её мать, когда она была маленькой. Мать умерла от нищеты.",
      dialogueTree: {
        start: {
          text: "Здравствуйте, детектив.",
          options: [
            { text: "Где вы были в ночь убийства?", next: "where" },
            { text: "Что вы думаете о хозяине?", next: "lord" },
            { text: "Почему вы устроились сюда работать?", next: "reason" }
          ]
        },
        where: {
          text: "Я убиралась в сарае... ничего не видела.",
          options: [
            { text: "Правда?", next: "doubt" }
          ]
        },
        doubt: {
          text: "Ну... возможно, я что-то слышала...",
          options: [
            { text: "Продолжайте", next: "continue" }
          ]
        },
        continue: {
          text: "Кто-то двигал ящики... но я не стала подходить.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        lord: {
          text: "Он всегда был строг... но он хороший человек.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        reason: {
          text: "Я просто искала работу. Мне нужно было выжить.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если будут ещё вопросы — спрашивайте.",
          options: []
        }
      }
    },
    "cook_mary": {
      name: "Повар Мария",
      description: "Добродушная женщина с крепкими связями в округе.",
      motive: "Могла иметь секретные связи с местным контрабандистом.",
      dialogueTree: {
        start: {
          text: "Добрый день, детектив.",
          options: [
            { text: "Вы заметили что-нибудь странное?", next: "strange" },
            { text: "Кто убил Лорда?", next: "killer" },
            { text: "Как вы себя чувствуете?", next: "feelings" }
          ]
        },
        strange: {
          text: "Ночью кто-то заглядывал в кладовку.",
          options: [
            { text: "Кто?", next: "who" }
          ]
        },
        who: {
          text: "Не знаю... но слышала шаги.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        killer: {
          text: "Не могу знать этого. Я просто повар.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        feelings: {
          text: "Страшно... но я должна работать.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если будет нужно — я помогу.",
          options: []
        }
      }
    },
    "butler_james": {
      name: "Дворецкий Джеймс",
      description: "Верный слуга с таинственным прошлым.",
      motive: "Хотел защитить семью от посторонних.",
      dialogueTree: {
        start: {
          text: "Вы хотели со мной поговорить?",
          options: [
            { text: "Что вы делали в ночь убийства?", next: "night" },
            { text: "Вы знаете что-нибудь важное?", next: "important" },
            { text: "Как вы относитесь к Лорду?", next: "relation" }
          ]
        },
        night: {
          text: "Я осматривал окрестности. Ничего необычного не видел.",
          options: [
            { text: "А кто-нибудь входил?", next: "entered" }
          ]
        },
        entered: {
          text: "Не уверен... но кто-то был.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        important: {
          text: "Да, но не уверен, стоит ли говорить об этом сейчас.",
          options: [
            { text: "Прошу вас", next: "please" }
          ]
        },
        please: {
          text: "Я нашёл старую записку в библиотеке... она может вам помочь.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        relation: {
          text: "Я служу этой семье много лет.",
          options: [
            { text: "Спасибо", next: "end" }
          ]
        },
        end: {
          text: "Если нужно — я здесь.",
          options: []
        }
      }
    },
    "gardener_tom": {
      name: "Садовник Том",
      description: "Тихий и незаметный, но всё знает о поместье.",
      motive: "Знал о тайном хранении документов в саду.",
      dialogueTree: {
        start: {
          text: "Вы ко мне?",
          options: [
            { text: "Что вы делали в ночь убийства?", next: "night" },
            { text: "Что вы можете рассказать о саду?", next: "garden" }
          ]
        },
        night: {
          text: "Я работал в теплице. Видел свет в библиотеке.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        garden: {
          text: "Там есть тайник... раньше там хранили документы.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если нужно — я помогу.",
          options: []
        }
      }
    },
    "librarian_emily": {
      name: "Библиотекарь Эмили",
      description: "Интроверт, живущий среди книг. Замкнутый, но умный.",
      motive: "Узнала о тайной переписке Лорда.",
      dialogueTree: {
        start: {
          text: "Зачем вы пришли в библиотеку?",
          options: [
            { text: "Что вы знаете о Лорде?", next: "know_lord" },
            { text: "Можно взглянуть на книги?", next: "books" }
          ]
        },
        know_lord: {
          text: "Он часто прятал документы между страницами.",
          options: [
            { text: "Интересно", next: "end" }
          ]
        },
        books: {
          text: "Только аккуратно. Книги — мой мир.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если понадобится помощь — я рядом.",
          options: []
        }
      }
    },
    "nurse_claire": {
      name: "Медсестра Клэр",
      description: "Женщина средних лет, работает в поместье много лет.",
      motive: "Знает о болезни Лорда Винтера.",
      dialogueTree: {
        start: {
          text: "Здравствуйте, детектив.",
          options: [
            { text: "Вы лечили Лорда?", next: "treated" },
            { text: "Как вы относились к нему?", next: "relationship" }
          ]
        },
        treated: {
          text: "Да, но он не слушал меня.",
          options: [
            { text: "Почему?", next: "why" }
          ]
        },
        why: {
          text: "Он считал себя выше медицины.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        relationship: {
          text: "Он платил хорошо, но не ценил людей.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если понадоблюсь — зовите.",
          options: []
        }
      }
    },
    "guest_henry": {
      name: "Гость Генри",
      description: "Друг семьи Винтера, приехал за день до убийства.",
      motive: "Хотел получить наследство.",
      dialogueTree: {
        start: {
          text: "Вы уже кого-то допросили?",
          options: [
            { text: "Что вы делали в ночь убийства?", next: "where" },
            { text: "Зачем вы приехали сюда?", next: "reason" }
          ]
        },
        where: {
          text: "Спокойно спал. Проверьте комнату.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        reason: {
          text: "Лорд просил совета. Но я не ожидал такого поворота.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если нужна помощь — обращайтесь.",
          options: []
        }
      }
    },
    "servant_george": {
      name: "Слуга Джордж",
      description: "Работает в поместье с юности.",
      motive: "Знал о планах Лорда Винтера.",
      dialogueTree: {
        start: {
          text: "Вы ищете убийцу?",
          options: [
            { text: "Вы видели что-нибудь?", next: "saw" },
            { text: "Кто был недоволен Лордом?", next: "angry" }
          ]
        },
        saw: {
          text: "Кто-то выходил из сарая около полуночи.",
          options: [
            { text: "Кто?", next: "who" }
          ]
        },
        who: {
          text: "Похоже, это была Анна. Но я не уверен.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        angry: {
          text: "Многие. Особенно те, кто знал правду.",
          options: [
            { text: "Правду о чём?", next: "truth" }
          ]
        },
        truth: {
          text: "О финансовых махинациях и о прошлом... некоторых людях он бросил без помощи.",
          options: [
            { text: "Хорошо", next: "end" }
          ]
        },
        end: {
          text: "Если нужно — я рядом.",
          options: []
        }
      }
    }
  };

  // === Локации ===
  const locations = [
    {
      id: "hall",
      title: "Главный зал",
      description: "Огромный зал с высоким потолком и роскошной люстрой. Здесь царит величие поместья. В зале находится дворецкий Джеймс. Тело Лорда Винтера было найдено здесь.",
      sublocations: [
        { id: "portrait", title: "Портрет", description: "На портрете Лорд Винтер смотрит на вас с ухмылкой." },
        { id: "fireplace", title: "Камин", description: "В камине догорают угли. На полу следы крови." },
        { id: "mirror", title: "Зеркало", description: "На раме зеркала видны царапины, будто кто-то пытался что-то стереть." },
        { id: "table", title: "Столик", description: "На столике валяется старый конверт." },
        { id: "rug", title: "Ковёр", description: "Ковёр частично задран, под ним виднеется деревянный люк." }
      ],
      characters: ["butler_james"],
      unlocked: true
    },
    {
      id: "library",
      title: "Библиотека",
      description: "Просторная библиотека, заполненная старинными томами. Здесь пахнет кожей и древесиной. В библиотеке находится библиотекарь Эмили.",
      sublocations: [
        { id: "desk", title: "Письменный стол", description: "На столе лежит исписанный лист бумаги: 'Я знаю правду'." },
        { id: "shelves", title: "Книжные полки", description: "На одной из полок спрятана записка: 'Он знал слишком много...' — возможно, это часть какой-то переписки." },
        { id: "filing_cabinet", title: "Картотека", description: "В ящике найдены документы о продаже земель поместья. Возможно, Лорд готовил крупную сделку." },
        { id: "cabinet", title: "Шкаф", description: "В шкафу лежит красивое платье — не относится к делу." },
        { id: "sofa", title: "За диваном", description: "Под диваном валяется платок с вышитыми инициалами 'А'." },
        { id: "window", title: "Окно", description: "На подоконнике следы грязи, будто кто-то недавно пролез внутрь." }
      ],
      characters: ["librarian_emily"],
      unlocked: true
    },
    {
      id: "kitchen",
      title: "Кухня",
      description: "Тёплая и уютная кухня, наполненная ароматами выпечки. Здесь всегда можно найти что-то вкусное, но сегодня она кажется особенно пустой. На кухне находятся повар Мария и горничная Анна.",
      sublocations: [
        { id: "stove", title: "Плита", description: "Плита ещё горячая — кто-то недавно готовил." },
        { id: "pantry", title: "Кладовая", description: "Закрыта на ключ. Возможно, там что-то скрывается." },
        { id: "table_kitchen", title: "Стол", description: "На столе разбросаны ножи, один из них выглядит странным." },
        { id: "sink", title: "Раковина", description: "В воде плавает странный комочек бумаги." },
        { id: "oven", title: "Духовка", description: "Что-то завёрнуто в тряпку — возможно, это важно." },
        { id: "cupboard", title: "Шкафчики", description: "В одном из шкафчиков стоит банка с надписью 'Не есть!'." }
      ],
      characters: ["maid_anna", "cook_mary"],
      unlocked: true
    },
    {
      id: "garden",
      title: "Сад",
      description: "Тенистый сад с аккуратно подстриженными кустами и цветниками. Здесь легко забыть обо всём плохом. В саду находится садовник Том.",
      sublocations: [
        { id: "bench", title: "Скамья", description: "На скамье валяется перчатка." },
        { id: "shed", title: "Сарай", description: "Сарай заперт, но ключ может быть где-то рядом. Внутри — банка с химикатами." },
        { id: "flowerbeds", title: "Цветники", description: "Некоторые цветы вырваны с корнем." },
        { id: "statue", title: "Статуя", description: "Статуя покрыта пятнами, похожими на кровь." },
        { id: "gate", title: "Ворота", description: "Ворота были взломаны. Следы ведут внутрь." }
      ],
      characters: ["gardener_tom"],
      unlocked: true
    },
    {
      id: "maid_room",
      title: "Комната горничной",
      description: "Маленькая, уютная комната с кроватью и шкафом. В воздухе стоит запах старых вещей.",
      sublocations: [
        { id: "bed", title: "Под кроватью", description: "Под подушкой лежит письмо от матери Анны: 'Он тебя не признал... но ты его дочь'." },
        { id: "wardrobe", title: "Шкаф", description: "В шкафу лежит красивое платье. Ничего подозрительного." }
      ],
      characters: ["maid_anna"],
      unlocked: true
    },
    {
      id: "secret_room",
      title: "Тайная комната",
      description: "Спрятанная за книжной полкой комната с документами. Здесь можно узнать много нового.",
      sublocations: [
        { id: "documents", title: "Документы", description: "На столе лежит старый документ: 'Ребёнок вне брака, рождённый в 1895 году'." }
      ],
      characters: ["butler_james"],
      unlocked: false,
      unlockCondition: "dialogue_with_butler"
    }
  ];

  let currentLocationIndex = 0;
  let currentDialogNode = null;
  let currentDialogCharacter = null;
  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let facts = new Set(JSON.parse(localStorage.getItem("facts")) || []);

  // === Открытие локаций по условию ===
  function checkUnlockConditions() {
    const hasVisitedLibraryAndKitchen = facts.has("старинные книги") && facts.has("горячая плита");
    if (hasVisitedLibraryAndKitchen && !locations.find(l => l.id === "attic").unlocked) {
      locations.find(l => l.id === "attic").unlocked = true;
      alert("Открыт новый уровень: Чёрдак");
    }
  }

  // === Рендер текущей локации ===
  function renderLocation() {
    checkUnlockConditions();
    const loc = locations[currentLocationIndex];
    document.getElementById("locationTitle").textContent = loc.title;
    document.getElementById("locationDescription").textContent = loc.description;

    const ul = document.getElementById("sublocationList");
    ul.innerHTML = "";
    loc.sublocations.forEach(sub => {
      const li = document.createElement("li");
      li.className = "flex-1 basis-[45%] cursor-pointer bg-gray-700 p-2 rounded hover:bg-gray-600";
      li.textContent = sub.title;
      li.onclick = () => showSublocationDetails(sub);
      ul.appendChild(li);
    });

    const charDiv = document.getElementById("characterInfo");
    charDiv.innerHTML = "";
    loc.characters.forEach(charId => {
      const c = characters[charId];
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2";
      btn.textContent = c.name;
      btn.onclick = () => startDialog(charId);
      charDiv.appendChild(btn);
    });
  }

  // === Открытие модального окна с подлокацией ===
  function showSublocationDetails(sub) {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");

    modal.classList.remove("hidden");
    modalTitle.textContent = sub.title;
    modalContent.innerHTML = `
      <p>${sub.description}</p>
      <button class="mt-4 bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full">Закрыть</button>
    `;

    modalContent.querySelector("button").onclick = () => {
      facts.add(sub.description);
      saveProgress();
      closeModal();
    };
  }

  // === Диалоги ===
  function startDialog(charId) {
    currentDialogCharacter = charId;
    currentDialogNode = characters[charId].dialogueTree.start;
    showDialog();
  }

  function showDialog() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const contentDiv = document.getElementById("modalContent");

    modal.classList.remove("hidden");
    modalTitle.textContent = characters[currentDialogCharacter].name;
    contentDiv.innerHTML = "";

    const p = document.createElement("p");
    p.className = "mb-4";
    p.textContent = currentDialogNode.text;
    contentDiv.appendChild(p);

    currentDialogNode.options?.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2";
      btn.textContent = opt.text;
      btn.onclick = () => {
        if (opt.next === "end") {
          closeModal();
        } else {
          currentDialogNode = characters[currentDialogCharacter].dialogueTree[opt.next];
          showDialog();
        }
      };
      contentDiv.appendChild(btn);
    });

    const closeBtn = document.createElement("button");
    closeBtn.className = "mt-2 bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full";
    closeBtn.textContent = "Закрыть";
    closeBtn.onclick = closeModal;
    contentDiv.appendChild(closeBtn);
  }

  // === Открытие локации после диалога ===
  function unlockLocationById(id) {
    const location = locations.find(l => l.id === id);
    if (location && !location.unlocked) {
      location.unlocked = true;
      saveProgress();
      alert(`Открыта новая локация: ${location.title}`);
    }
  }

  // === Закрытие модального окна ===
  function closeModal() {
    document.getElementById("modal").classList.add("hidden");
  }

  // === Функции для кнопок ===
  function openNotes() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");

    modal.classList.remove("hidden");
    modalTitle.textContent = "Заметки";
    modalContent.innerHTML = "";
    if (notes.length === 0) {
      modalContent.innerHTML = "<p>Заметок пока нет.</p>";
    } else {
      const ul = document.createElement("ul");
      notes.forEach((note, i) => {
        const li = document.createElement("li");
        li.className = "mb-2 flex items-center justify-between";
        li.textContent = note;
        const delBtn = document.createElement("button");
        delBtn.className = "bg-red-600 text-white px-2 py-1 rounded ml-2 text-sm";
        delBtn.textContent = "Удалить";
        delBtn.onclick = () => {
          notes.splice(i, 1);
          saveProgress();
          openNotes();
        };
        li.appendChild(delBtn);
        ul.appendChild(li);
      });
      modalContent.appendChild(ul);
    }

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Новая заметка";
    input.className = "w-full bg-gray-700 text-white px-3 py-2 rounded mt-4";
    modalContent.appendChild(input);

    const addBtn = document.createElement("button");
    addBtn.className = "mt-2 bg-green-600 text-white px-4 py-2 rounded w-full";
    addBtn.textContent = "Добавить заметку";
    addBtn.onclick = () => {
      const val = input.value.trim();
      if (val) {
        notes.push(val);
        saveProgress();
        openNotes();
      }
    };
    modalContent.appendChild(addBtn);
  }

  function openInfo() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");

    modal.classList.remove("hidden");
    modalTitle.textContent = "Информация";
    modalContent.innerHTML = "";
    if (facts.size === 0) {
      modalContent.innerHTML = "<p>Информации пока нет.</p>";
    } else {
      const ul = document.createElement("ul");
      Array.from(facts).forEach(f => {
        const li = document.createElement("li");
        li.textContent = f;
        ul.appendChild(li);
      });
      modalContent.appendChild(ul);
    }
  }

  function openLocationSelector() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");

    modal.classList.remove("hidden");
    modalTitle.textContent = "Выбор локации";
    modalContent.innerHTML = "";
    locations.filter(l => l.unlocked).forEach(loc => {
      const btn = document.createElement("button");
      btn.className = "bg-gray-700 gold-text border-2 gold-border px-4 py-2 rounded w-full mb-2";
      btn.textContent = loc.title;
      btn.onclick = () => {
        currentLocationIndex = locations.indexOf(loc);
        renderLocation();
        closeModal();
      };
      modalContent.appendChild(btn);
    });
  }

  function showVerdictForm() {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");

    modal.classList.remove("hidden");
    modalTitle.textContent = "Вынести вердикт";
    modalContent.innerHTML = `
      <form class="verdict-form">
        <label for="verdict-suspect">Преступление совершил:</label>
        <select id="verdict-suspect" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4">
          ${Object.values(characters).map(c => `<option value="${c.motive}">${c.name}</option>`).join("")}
        </select>

        <label for="verdict-time">Преступление было совершено:</label>
        <select id="verdict-time" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4">
          <option value="ночь">ночь</option>
          <option value="утро">утро</option>
          <option value="день">день</option>
        </select>

        <label for="verdict-weapon">Орудием послужило:</label>
        <select id="verdict-weapon" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4">
          <option value="нож">нож</option>
          <option value="отрава">отрава</option>
          <option value="пистолет">пистолет</option>
        </select>

        <label for="verdict-motive">Преступление было совершено из-за:</label>
        <select id="verdict-motive" class="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4">
          <option value="финансовые махинации">финансовые махинации</option>
          <option value="ревность">ревность</option>
          <option value="тайны прошлого">тайны прошлого</option>
        </select>

        <button type="button" id="confirm-verdict" class="mt-2 bg-green-600 text-white px-4 py-2 rounded w-full">Подтвердить</button>
      </form>
    `;

    document.getElementById("confirm-verdict").onclick = () => {
      const suspect = document.getElementById("verdict-suspect").value;
      const time = document.getElementById("verdict-time").value;
      const weapon = document.getElementById("verdict-weapon").value;
      const motive = document.getElementById("verdict-motive").value;

      if (
        suspect.includes("Анна") &&
        time === "ночь" &&
        weapon === "отрава" &&
        motive === "ревность"
      ) {
        alert("Вы нашли убийцу! Поздравляем!");
      } else {
        alert("Ваше предположение неверно. Продолжите расследование.");
      }
      closeModal();
    };
  }

  // === Приветствие при запуске ===
  if (welcomeScreen && app) {
    welcomeScreen.classList.remove("hidden");
    app.classList.add("hidden");

    const startButton = document.getElementById("startGameButton");
    if (startButton) {
      startButton.addEventListener("click", () => {
        welcomeScreen.classList.add("hidden");
        app.classList.remove("hidden");
        loadProgress();
        currentLocationIndex = 0; // Устанавливаем первую локацию как "Главный зал"
        renderLocation();
      });
    }
  }

  // === Обработчики событий для кнопок ===
  document.getElementById("notesButton")?.addEventListener("click", openNotes);
  document.getElementById("infoButton")?.addEventListener("click", openInfo);
  document.getElementById("locationButton")?.addEventListener("click", openLocationSelector);
  document.getElementById("verdictButton")?.addEventListener("click", showVerdictForm);
  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  window.addEventListener("click", e => {
    const modal = document.getElementById("modal");
    if (e.target === modal) closeModal();
  });
});
