let firstCard, secondCard;
let userName;
let timerInterval;
let isWinner;
let cardsNumber,
  time,
  minutes,
  hours,
  correctCards,
  countAttempts,
  failNumber,
  strikesToShow;

function init() {
  initGloballetiables();
  $("#back-png").css({
    "background-image": "url('../src/images/fully-bck/main-back.png')",
    "background-size": "cover",
  });
  $("#submit-form").on("click", startGame);
}

function initGloballetiables() {
  time = 0;
  minutes = 0;
  hours = 0;
  correctCards = 0;
  countAttempts = 0;
  strikesToShow = 0;
  isWinner = true;
  failNumber = 0;
  clearInterval(timerInterval);
  $("#timer").text("00:00:00");
  $("#strikes-to-show").text("0 strikes");
  $("#user-name-input").val("");
  $("#cards-number").val("");
  $("#fails-number").val("");
}

jQuery(function () {
  $("#restart-btn").on("click", function () {
    initGloballetiables();
    $("#back-png").css({
      "background-image": "url('../src/images/fully-bck/main-back.png')",
      "background-size": "cover",
    });
    $("#game-settings").show();
    $("#board").hide();
  });
});

function startGame() {
  userName = $("#user-name-input").val();
  cardsNumber = $("#cards-number").val();
  failNumber = $("#fails-number").val();
  if (!validateUserName() || !validateCorrectInput()) {
    return;
  }
  $("#game-settings").hide();
  $("#back-png").css({
    "background-image": "",
    "background-size": "",
    "background-color": "#deebff",
  });
  $("#board").show();
  $("#user-name").text(`Hi ${userName}`);
  $(".error").empty();
  timerInterval = setInterval(() => {
    timer();
  }, 1000);
  drawCards();
}

function timer() {
  time++;
  $("#timer").text(formatTime()).addClass(".bold-time");
}

function validateUserName() {
  if (userName.length === 0) {
    $(".error").text("Please enter your name!");
    return false;
  }
  return true;
}

function validateCorrectInput() {
  if (cardsNumber > 50) {
    $(".error").text("Cards number shouldn't be more than 50!");
    return false;
  }
  if (cardsNumber % 2 !== 0 || !(cardsNumber > 0)) {
    $(".error").text("Cards number must be an even positive number!");
    return false;
  }
  if (!(failNumber > 0)) {
    $(".error").text("Fails number should be a positive number!");
    return false;
  }

  return true;
}

function drawCards() {
  $("#cards-container").empty();
  $.get("./components/card.html", (template) => {
    const cardsNumber = $("#cards-number").val();
    for (let i = 0; i < cardsNumber / 2; i++) {
      const cardOne = $(template);
      const cardTwo = $(template);

      cardOne.data("name", i);
      cardTwo.data("name", i);

      $(cardOne.find("img.front-image")).attr(
        "src",
        `/memory-cards-game/src/images/cards/${i}.png`
      );
      $(cardTwo.find("img.front-image")).attr(
        "src",
        `/memory-cards-game/src/images/cards/${i}.png`
      );

      cardOne.on("mousedown", handleCardClick);
      cardTwo.on("mousedown", handleCardClick);

      $("#cards-container").append(cardOne);
      $("#cards-container").append(cardTwo);
    }
    shuffle();
  });
}

function handleCardClick(e) {
  if (e.button !== 0) {
    return;
  }
  const card = $(e.currentTarget);

  if (!(firstCard && secondCard)) {
    if (!firstCard) {
      firstCard = card;
      flipCard(firstCard);
      ++countAttempts;
    } else if (!firstCard.is(card)) {
      secondCard = card;
      flipCard(secondCard);
      ++countAttempts;
    }
  }
  if (firstCard && secondCard) {
    validateCardSelection();
  }
}

function flipCard(card) {
  card.toggleClass("flip");
}

async function validateCardSelection() {
  if (firstCard.data("name") === secondCard.data("name")) {
    firstCard.addClass("disabled");
    secondCard.addClass("disabled");
    $("#win")[0].pause();
    $("#win")[0].currentTime = 0;
    $("#win")[0].play();
    correctCards += 2;
    setTimeout(() => {
      if (correctCards == cardsNumber) {
        showFinishModal();
      }
    }, 1000);
  } else {
    ++strikesToShow;
    $("#strikes-to-show").text(`${strikesToShow} strikes`);
    $("#fail")[0].pause();
    $("#fail")[0].currentTime = 0;

    setTimeout(() => {
      $("#fail")[0].play();
      $("#board").addClass("pe-none");
    }, 250);

    await new Promise((res, rej) => {
      setTimeout(() => {
        flipCard(firstCard);
        flipCard(secondCard);
        $("#board").removeClass("pe-none");
        res();
      }, 1000);
    });

    if (strikesToShow == failNumber) {
      isWinner = false;
      showFinishModal();
    }
  }

  firstCard = null;
  secondCard = null;
}

function shuffle() {
  const cards = $("[data-role=card]");
  for (let card of cards) {
    $(card).css({ order: Math.floor(Math.random() * cards.length) });
  }
}

function showFinishModal() {
  const endGameModal = $("#end-game-modal");
  isWinner ? endWonGame() : stopLostGame();

  clearInterval(timerInterval);
  time = 0;
  correctCards = 0;
  countAttempts = 0;
  strikesToShow = 0;

  $("#close-game").on("click", function () {
    endGameModal.hide();
    const cards = $("[data-role=card]");
    for (let card of cards) {
      $(card).css("pointer-events", "none");
    }
  });

  $("#restart-game").on("click", () => {
    endGameModal.hide();
    initGloballetiables();
    $("#board").hide();
    $("#back-png").css({
      "background-image": "url('../src/images/fully-bck/main-back.png')",
      "background-size": "cover",
    });
    $("#game-settings").show();
  });
}

function stopLostGame() {
  const endGameModal = $("#end-game-modal");
  $(endGameModal)
    .find("#modal-message")
    .html(
      '<div class="modal-header"><h5 class="modal-title">Game Over <b id="user-name-modal"></b></h5></div><div class="modal-body"><p>OH NO!</p><p id="num-of-fails"></p><p>Would you like to play again?</p></div>'
    );
  $(endGameModal.find("#num-of-fails")).text(
    `Looks like you reached ${failNumber} strikes and lost`
  );
  endGameModal.show();
}

function endWonGame() {
  const endGameModal = $("#end-game-modal");
  const timeToModal = formatTime();
  $(endGameModal)
    .find("#modal-message")
    .html(
      '<div class="modal-header"><h5 class="modal-title">Congratulations <b id="user-name-modal"></b></h5></div><div class="modal-body"><p>It took you <b id="time-to-finish"></b> to finish the game.</p><p>With <b id="num-of-attempts"></b> selection attempts</p><p>Would you like to play again?</p></div>'
    );
  $(endGameModal.find("#time-to-finish")).text(timeToModal);
  $(endGameModal.find("#user-name-modal")).text(userName);
  $(endGameModal.find("#num-of-attempts")).text(Math.floor(countAttempts / 2));
  endGameModal.show();
}

function formatTime() {
  let seconds = time;
  let isSecond2digits = false;
  let isMinutes2digits = false;

  if (seconds >= 60) {
    minutes++;
    seconds = 0;
    time = 0;
  }
  if (minutes >= 60) {
    hours++;
    minutes = 0;
  }

  seconds > 9 && (isSecond2digits = true);
  minutes > 9 && (isMinutes2digits = true);

  if (isSecond2digits && isMinutes2digits)
    return `0${hours}:${minutes}:${seconds}`;
  else if (isSecond2digits && !isMinutes2digits)
    return `0${hours}:0${minutes}:${seconds}`;
  else if (!isSecond2digits && isMinutes2digits)
    return `0${hours}:${minutes}:0${seconds}`;
  else return `0${hours}:0${minutes}:0${seconds}`;
}

init();
