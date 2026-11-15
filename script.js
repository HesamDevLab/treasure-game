let players = [];

let currentPlayerIndex = 0;

let currentRound = 1;

const TOTAL_ROUNDS = 3;
const TOTAL_CHANCES = 3;

let score = 0;
let chances = TOTAL_CHANCES;
let coins = 0;
let attemptsUsed = 0;

let treasure = 0;

let gameOver = false;

let openedChests = [];
let removedChests = [];

let audio;

// ساخت ورودی بازیکنان

function createPlayerInputs() {

    const count = Number(
        document.getElementById("playerCount").value
    );

    const container = document.getElementById("playerInputs");

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {

        const input = document.createElement("input");

        input.type = "text";
        input.className = "player-input";
        input.placeholder = "نام بازیکن " + (i + 1);
        input.maxLength = 18;

        container.appendChild(input);
    }
}

document.getElementById("playerCount").addEventListener(
    "change",
    createPlayerInputs
);

createPlayerInputs();

// سیستم صدا

function playSound(type) {

    const AudioClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioClass) return;

    if (!audio) {
        audio = new AudioClass();
    }

    if (audio.state === "suspended") {
        audio.resume();
    }

    const oscillator = audio.createOscillator();

    const volume = audio.createGain();

    oscillator.connect(volume);
    volume.connect(audio.destination);

    if (type === "click") {
        oscillator.frequency.value = 500;
    }

    if (type === "win") {
        oscillator.frequency.value = 900;
    }

    if (type === "lose") {
        oscillator.frequency.value = 180;
    }

    oscillator.type = "sine";

    volume.gain.setValueAtTime(
        0.15,
        audio.currentTime
    );

    volume.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + 0.4
    );

    oscillator.start();

    oscillator.stop(audio.currentTime + 0.4);
}

// شروع مسابقه

function startTournament() {

    const inputs = document.querySelectorAll(".player-input");

    const names = Array.from(inputs).map(
        input => input.value.trim()
    );

    if (names.some(name => name === "")) {

        alert("لطفاً اسم تمام بازیکنان را وارد کن!");

        return;
    }

    const uniqueNames = names.map(
        name => name.toLowerCase()
    );

    if (new Set(uniqueNames).size !== names.length) {

        alert("اسم بازیکنان نباید تکراری باشد!");

        return;
    }

    players = names.map(name => ({

        name: name,

        score: 0,

        coins: 0,

        totalAttempts: 0,

        roundsPlayed: 0,

        wins: 0

    }));

    currentPlayerIndex = 0;

    currentRound = 1;

    document.getElementById("setupPanel").style.display = "none";

    document.getElementById("gameArea").style.display = "block";

    document.getElementById("resultArea").style.display = "none";

    startPlayerRound();
}

// شروع مرحله

function startPlayerRound() {

    score = 0;

    chances = TOTAL_CHANCES;

    attemptsUsed = 0;

    treasure = Math.floor(Math.random() * 5);

    gameOver = false;

    openedChests = [];

    removedChests = [];

    const player = players[currentPlayerIndex];

    coins = player.coins;

    document.getElementById("currentPlayer").innerText =
        "🎮 نوبت بازیکن: " + player.name;

    document.getElementById("turnInfo").innerText =
        "بازیکن " + (currentPlayerIndex + 1) +
        " از " + players.length;

    document.getElementById("roundInfo").innerText =
        "مرحله " + currentRound + " از " + TOTAL_ROUNDS;

    document.getElementById("message").innerText =
        "یکی از ۵ صندوق را انتخاب کن!";

    const nextButton = document.getElementById("nextButton");

    nextButton.innerText =
        currentRound < TOTAL_ROUNDS
            ? "مرحله بعدی ➡️"
            : "نفر بعدی ➡️";

    const chests = document.querySelectorAll(".chest");

    chests.forEach(chest => {

        chest.innerText = "🎁";

        chest.disabled = false;

        chest.style.display = "inline-block";

        chest.classList.remove(
            "shake",
            "win",
            "removing"
        );

    });

    updateStats();
}

// باز کردن صندوق

function openChest(number) {

    if (
        gameOver ||
        openedChests.includes(number) ||
        removedChests.includes(number)
    ) {
        return;
    }

    attemptsUsed++;

    playSound("click");

    openedChests.push(number);

    const chests = document.querySelectorAll(".chest");

    const selectedChest = chests[number];

    if (number === treasure) {

        if (attemptsUsed === 1) {
            score = 100;
        } else if (attemptsUsed === 2) {
            score = 70;
        } else {
            score = 40;
        }

        coins += 100;

        const player = players[currentPlayerIndex];

        player.score += score;

        player.coins = coins;

        player.totalAttempts += attemptsUsed;

        player.roundsPlayed++;

        player.wins++;

        playSound("win");

        selectedChest.innerText = "💎";

        selectedChest.classList.add("win");

        document.getElementById("message").innerText =
            "🎉 گنج پیدا شد! " +
            score + " امتیاز گرفتی!";

        finishTurn();

    } else {

        chances--;

        selectedChest.innerText = "❌";

        selectedChest.classList.add("shake");

        document.getElementById("message").innerText =
            "گنج اینجا نبود! " +
            chances + " فرصت باقی مانده.";

        setTimeout(() => {

            selectedChest.classList.remove("shake");

        }, 500);

        if (chances === 0) {

            playSound("lose");

            const player = players[currentPlayerIndex];

            player.totalAttempts += attemptsUsed;

            player.roundsPlayed++;

            player.coins = coins;

            score = 0;

            document.getElementById("message").innerText =
                "❌ سه تلاش تمام شد! این مرحله صفر امتیاز گرفتی.";

            chests[treasure].innerText = "💎";

            chests[treasure].classList.add("win");

            finishTurn();
        }
    }

    updateStats();
}

// پایان مرحله

function finishTurn() {

    gameOver = true;

    const chests = document.querySelectorAll(".chest");

    chests.forEach(chest => {

        chest.disabled = true;

    });

    const nextButton = document.getElementById("nextButton");

    if (currentRound < TOTAL_ROUNDS) {

        nextButton.innerText = "شروع مرحله بعدی ➡️";

    } else if (currentPlayerIndex < players.length - 1) {

        nextButton.innerText = "نفر بعدی ➡️";

    } else {

        nextButton.innerText = "مشاهده نتایج 🏆";

    }

    document.getElementById("message").innerText +=
        " | مرحله تمام شد!";
}

// فروشگاه

function removeChest() {

    if (gameOver) {

        return;
    }

    if (coins < 50) {

        document.getElementById("message").innerText =
            "❌ برای حذف صندوق ۵۰ سکه لازم داری!";

        playSound("lose");

        return;
    }

    const candidates = [];

    for (let i = 0; i < 5; i++) {

        if (
            i !== treasure &&
            !openedChests.includes(i) &&
            !removedChests.includes(i)
        ) {

            candidates.push(i);

        }
    }

    if (candidates.length === 0) {

        document.getElementById("message").innerText =
            "صندوق اشتباهی برای حذف باقی نمونده!";

        return;
    }

    const randomIndex = Math.floor(
        Math.random() * candidates.length
    );

    const chestNumber = candidates[randomIndex];

    coins -= 50;

    players[currentPlayerIndex].coins = coins;

    removedChests.push(chestNumber);

    const chests = document.querySelectorAll(".chest");

    const selectedChest = chests[chestNumber];

    selectedChest.classList.add("removing");

    playSound("win");

    document.getElementById("message").innerText =
        "🔍 یک صندوق اشتباه حذف شد!";

    updateStats();

    setTimeout(() => {

        selectedChest.style.display = "none";

    }, 500);
}

// بروزرسانی آمار

function updateStats() {

    document.getElementById("score").innerText = score;

    document.getElementById("totalScore").innerText =
        players[currentPlayerIndex].score;

    document.getElementById("chances").innerText = chances;

    document.getElementById("coins").innerText = coins;
}

// مرحله بعدی یا بازیکن بعدی

function nextPlayer() {

    if (!gameOver) {

        alert("اول باید این مرحله تمام شود!");

        return;
    }

    if (currentRound < TOTAL_ROUNDS) {

        currentRound++;

        startPlayerRound();

        return;
    }

    currentRound = 1;

    currentPlayerIndex++;

    if (currentPlayerIndex < players.length) {

        startPlayerRound();

    } else {

        showResults();

    }
}

// نمایش نتایج

function showResults() {

    document.getElementById("gameArea").style.display = "none";

    document.getElementById("resultArea").style.display = "block";

    const sortedPlayers = [...players].sort((a, b) => {

        if (b.score !== a.score) {

            return b.score - a.score;

        }

        return a.totalAttempts - b.totalAttempts;

    });

    const winner = sortedPlayers[0];

    const isTie = sortedPlayers.every(
        player =>
            player.score === winner.score &&
            player.totalAttempts === winner.totalAttempts
    );

    document.getElementById("winnerMessage").innerText =
        isTie
            ? "🤝 مسابقه مساوی شد!"
            : "🏆 قهرمان مسابقه: " + winner.name;

    const body = document.getElementById("resultBody");

    body.innerHTML = "";

    sortedPlayers.forEach((player, index) => {

        let medal;

        if (index === 0) {

            medal = "🥇";

        } else if (index === 1) {

            medal = "🥈";

        } else if (index === 2) {

            medal = "🥉";

        } else {

            medal = index + 1;

        }

        const row = document.createElement("tr");

        const values = [

            medal,

            player.name,

            player.score,

            player.totalAttempts,

            player.coins

        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        body.appendChild(row);

    });
}

// مسابقه جدید

function newTournament() {

    players = [];

    currentPlayerIndex = 0;

    currentRound = 1;

    document.getElementById("resultArea").style.display = "none";

    document.getElementById("setupPanel").style.display = "block";

    document.getElementById("playerCount").value = "3";

    createPlayerInputs();
}