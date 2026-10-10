/* =========================
   BUTTERFLY CURSOR
========================= */

const butterflyCursor = document.querySelector(".butterfly");

if (butterflyCursor) {
    document.addEventListener("mousemove", (event) => {
        butterflyCursor.style.left = event.clientX + "px";
        butterflyCursor.style.top = event.clientY + "px";
    });
}

/* =========================
   FLUTTERBYTE GAME
   Uses the canvas butterfly only.
========================= */

const canvas = document.getElementById("butterflyCanvas");
const gameArea = document.getElementById("gameArea");
const flapButton = document.getElementById("flapButton");
const startButton = document.getElementById("startButton");
const gameScore = document.getElementById("gameScore");

if (canvas && gameArea && flapButton && startButton && gameScore) {
    const ctx = canvas.getContext("2d");

    let butterfly = { x: 120, y: 180, velocity: 0 };
    let pipes = [];
    let score = 0;
    let running = false;
    let animationId = null;
    let lastPipeTime = 0;
    let wingFrame = 0;

    const gravity = 0.32;
    const jumpPower = -6.5;
    const butterflyRadius = 17;
    const pipeWidth = 65;
    const pipeGap = 155;
    const pipeSpeed = 2.5;
    const pipeInterval = 1700;

    function drawButterfly(x, y) {
        ctx.save();
        ctx.translate(x, y);

        const wing = Math.sin(wingFrame * 0.3) * 0.3;

        ctx.fillStyle = "#c084fc";
        ctx.beginPath();
        ctx.ellipse(-12, -7, 15, 10, -wing, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e9d5ff";
        ctx.beginPath();
        ctx.ellipse(-11, 7, 12, 8, wing, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.ellipse(12, -7, 15, 10, wing, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#d8b4fe";
        ctx.beginPath();
        ctx.ellipse(11, 7, 12, 8, -wing, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#4c1d95";
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 17, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#6b21a8";
        ctx.beginPath();
        ctx.arc(0, -15, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#4c1d95";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-2, -19);
        ctx.quadraticCurveTo(-10, -31, -13, -26);
        ctx.moveTo(2, -19);
        ctx.quadraticCurveTo(10, -31, 13, -26);
        ctx.stroke();

        ctx.restore();
    }

    function drawPipes() {
        pipes.forEach((pipe) => {
            const bottomY = pipe.gapY + pipeGap;
            const capHeight = 18;
            const capOverhang = 6;

            const gradient = ctx.createLinearGradient(
                pipe.x, 0, pipe.x + pipeWidth, 0
            );

            gradient.addColorStop(0, "#7e22ce");
            gradient.addColorStop(0.45, "#c084fc");
            gradient.addColorStop(1, "#6b21a8");

            ctx.fillStyle = gradient;
            ctx.strokeStyle = "#4c1d95";
            ctx.lineWidth = 3;

            // Top pipe body
            ctx.fillRect(
                pipe.x,
                0,
                pipeWidth,
                pipe.gapY
            );
            ctx.strokeRect(
                pipe.x,
                0,
                pipeWidth,
                pipe.gapY
            );

            // Top pipe cap
            ctx.fillStyle = "#a855f7";
            ctx.fillRect(
                pipe.x - capOverhang,
                pipe.gapY - capHeight,
                pipeWidth + capOverhang * 2,
                capHeight
            );
            ctx.strokeRect(
                pipe.x - capOverhang,
                pipe.gapY - capHeight,
                pipeWidth + capOverhang * 2,
                capHeight
            );

            // Bottom pipe body
            ctx.fillStyle = gradient;
            ctx.fillRect(
                pipe.x,
                bottomY,
                pipeWidth,
                canvas.height - bottomY
            );
            ctx.strokeRect(
                pipe.x,
                bottomY,
                pipeWidth,
                canvas.height - bottomY
            );

            // Bottom pipe cap
            ctx.fillStyle = "#a855f7";
            ctx.fillRect(
                pipe.x - capOverhang,
                bottomY,
                pipeWidth + capOverhang * 2,
                capHeight
            );
            ctx.strokeRect(
                pipe.x - capOverhang,
                bottomY,
                pipeWidth + capOverhang * 2,
                capHeight
            );
        });
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPipes();
        drawButterfly(butterfly.x, butterfly.y);
        wingFrame++;
    }

    function createPipe() {
        const minGapY = 45;
        const maxGapY = canvas.height - pipeGap - 45;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

        pipes.push({
            x: canvas.width,
            gapY,
            scored: false
        });
    }

    function startGame() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
        }

        pipes = [];
        score = 0;
        butterfly.y = canvas.height / 2;
        butterfly.velocity = 0;
        lastPipeTime = 0;
        running = true;

        gameScore.textContent = "0";
        startButton.textContent = "Restart Game";

        createPipe();
        drawScene();
        animationId = requestAnimationFrame(updateGame);
    }

    function flap() {
        if (!running) {
            startGame();
        }
        butterfly.velocity = jumpPower;
    }

    function endGame() {
        running = false;
        animationId = null;
        drawScene();

        ctx.fillStyle = "rgba(36, 19, 65, 0.78)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 30px Segoe UI, sans-serif";
        ctx.fillText(
            "Game Over!",
            canvas.width / 2,
            canvas.height / 2 - 12
        );

        ctx.font = "20px Segoe UI, sans-serif";
        ctx.fillText(
            "Score: " + score,
            canvas.width / 2,
            canvas.height / 2 + 24
        );

        ctx.textAlign = "start";
        startButton.textContent = "Play Again";
    }

    function updateGame(timestamp) {
        if (!running) return;

        butterfly.velocity += gravity;
        butterfly.y += butterfly.velocity;

        if (timestamp - lastPipeTime >= pipeInterval) {
            createPipe();
            lastPipeTime = timestamp;
        }

        pipes.forEach((pipe) => {
            pipe.x -= pipeSpeed;

            if (!pipe.scored && pipe.x + pipeWidth < butterfly.x) {
                pipe.scored = true;
                score++;
                gameScore.textContent = String(score);
            }
        });

        pipes = pipes.filter((pipe) => pipe.x + pipeWidth > 0);

        if (
            butterfly.y - butterflyRadius <= 0 ||
            butterfly.y + butterflyRadius >= canvas.height
        ) {
            endGame();
            return;
        }

        for (const pipe of pipes) {
            const horizontalHit =
                butterfly.x + butterflyRadius > pipe.x &&
                butterfly.x - butterflyRadius < pipe.x + pipeWidth;

            const outsideGap =
                butterfly.y - butterflyRadius < pipe.gapY ||
                butterfly.y + butterflyRadius > pipe.gapY + pipeGap;

            if (horizontalHit && outsideGap) {
                endGame();
                return;
            }
        }

        drawScene();
        animationId = requestAnimationFrame(updateGame);
    }

    flapButton.addEventListener("click", flap);
    startButton.addEventListener("click", startGame);
    canvas.addEventListener("click", flap);

    
document.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;

    const activeElement = document.activeElement;

    // Don't interfere with typing or other form controls
    if (
        activeElement &&
        (
            activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.isContentEditable
        )
    ) {
        return;
    }

    // Only use Space when the Games section is visible
    const gamesSection = document.getElementById("games");
    if (!gamesSection) return;

    const rect = gamesSection.getBoundingClientRect();
    const gamesVisible =
        rect.top < window.innerHeight && rect.bottom > 0;

    if (gamesVisible) {
        event.preventDefault();
        flap();
    }
});

    drawScene();
}

/* =========================
   TYPING ROLE ANIMATION
========================= */

const typingRole = document.getElementById("typingRole");

if (typingRole) {
    const roles = [
        "an IT Student",
        "a Developer",
        "a Designer",
        "a Web Developer",
        "a Tech Girly",
        "a Coder",
        "a Programmer",
    ];

    let roleIndex = 0;
    let letterIndex = 0;
    let deleting = false;

    function typeRole() {
        const currentRole = roles[roleIndex];

        if (!deleting) {
            letterIndex++;
            typingRole.textContent = currentRole.substring(0, letterIndex);

            if (letterIndex >= currentRole.length) {
                deleting = true;
                setTimeout(typeRole, 1500);
                return;
            }
        } else {
            letterIndex--;
            typingRole.textContent = currentRole.substring(0, letterIndex);

            if (letterIndex <= 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }
        }

        setTimeout(typeRole, deleting ? 60 : 100);
    }

    typeRole();
}


/* =========================
   TYPING TEST
========================= */

const typingInput = document.getElementById("typingInput");
const typingText = document.getElementById("typingText");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timeDisplay = document.getElementById("time");
const typingMessage = document.getElementById("typingMessage");
const restartTyping = document.getElementById("restartTyping");
const tryAgainTyping = document.getElementById("tryAgainTyping");
const typingResults = document.getElementById("typingResults");
const modeButtons = document.querySelectorAll(".mode-btn");

const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalCorrect = document.getElementById("finalCorrect");

if (
    typingInput &&
    typingText &&
    wpmDisplay &&
    accuracyDisplay &&
    timeDisplay
) {
    const wordBank = [
        "creative", "technology", "knowledge", "ideas",
        "function", "butterfly", "motivate", "website",
        "strategy", "computer", "design", "future",
        "beautiful", "variable", "internet", "efficient",
        "keyboard", "improve", "build", "programming",
        "digital", "student", "progress", "imagine",
        "success", "coding", "javascript", "developer",
        "learning", "project", "algorithm", "solution",
        "innovation", "performance", "optimization", "interface",
        "experience", "application", "framework", "database",
        "functionality", "responsiveness", "accessibility", "security",
        "scalability", "integration", "collaboration", "automation",
        "analytics", "visualization", "deployment", "maintenance",
        "customization", "personalization", "interaction",
    ];

    let selectedTime = 15;
    let timeLeft = selectedTime;
    let timer = null;
    let timerStarted = false;
    let testFinished = false;

    function generateWords() {
        const words = [];

        for (let i = 0; i < 50; i++) {
            words.push(
                wordBank[Math.floor(Math.random() * wordBank.length)]
            );
        }

        typingText.innerHTML = "";

        words.join(" ").split("").forEach((character, index) => {
            const span = document.createElement("span");
            span.classList.add("letter");
            span.textContent = character;

            if (index === 0) {
                span.classList.add("current");
            }

            typingText.appendChild(span);
        });
    }

    function resetTest() {
        clearInterval(timer);

        timer = null;
        timerStarted = false;
        testFinished = false;
        timeLeft = selectedTime;

        typingInput.value = "";
        typingInput.disabled = false;

        timeDisplay.textContent = timeLeft;
        wpmDisplay.textContent = "0";
        accuracyDisplay.textContent = "100%";

        if (typingMessage) {
            typingMessage.textContent = "Start typing to begin";
        }

        if (typingResults) {
            typingResults.hidden = true;
        }

        generateWords();
    }

    function updateStats() {
        const typed = typingInput.value;
        const letters = typingText.querySelectorAll(".letter");

        let correct = 0;

        letters.forEach((letter, index) => {
            letter.classList.remove("correct", "incorrect", "current");

            if (index < typed.length) {
                if (typed[index] === letter.textContent) {
                    letter.classList.add("correct");
                    correct++;
                } else {
                    letter.classList.add("incorrect");
                }
            }

            if (index === typed.length) {
                letter.classList.add("current");
            }
        });

        const accuracy = typed.length
            ? Math.round((correct / typed.length) * 100)
            : 100;

        const elapsed = selectedTime - timeLeft;
        const minutes = elapsed / 60;

        const wpm = minutes > 0
            ? Math.round((correct / 5) / minutes)
            : 0;

        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy + "%";
    }

    function finishTest() {
        clearInterval(timer);

        timer = null;
        testFinished = true;
        typingInput.disabled = true;

        const typed = typingInput.value;
        const letters = typingText.querySelectorAll(".letter");

        let correct = 0;

        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === letters[i]?.textContent) {
                correct++;
            }
        }

        const accuracy = typed.length
            ? Math.round((correct / typed.length) * 100)
            : 0;

        const elapsed = selectedTime - timeLeft;
        const minutes = elapsed / 60;

        const wpm = minutes > 0
            ? Math.round((correct / 5) / minutes)
            : 0;

        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy + "%";

        if (typingMessage) {
            typingMessage.textContent =
                "Test completed! See your results below.";
        }

        if (typingResults) {
            typingResults.hidden = false;
        }

        if (finalWpm) finalWpm.textContent = wpm;
        if (finalAccuracy) finalAccuracy.textContent = accuracy + "%";
        if (finalCorrect) finalCorrect.textContent = correct;
    }

    typingInput.addEventListener("input", () => {
        if (testFinished) return;

        if (!timerStarted) {
            timerStarted = true;

            if (typingMessage) {
                typingMessage.textContent = "Keep going!";
            }

            timer = setInterval(() => {
                timeLeft--;

                if (timeLeft < 0) timeLeft = 0;

                timeDisplay.textContent = timeLeft;
                updateStats();

                if (timeLeft <= 0) {
                    finishTest();
                }
            }, 1000);
        }

        updateStats();

        if (
            typingInput.value.length >=
            typingText.textContent.length
        ) {
            finishTest();
        }
    });

    typingText.addEventListener("click", () => {
        if (!testFinished) {
            typingInput.focus();
        }
    });

    modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectedTime = Number(button.dataset.time);

            modeButtons.forEach((mode) => {
                mode.classList.remove("active");
            });

            button.classList.add("active");
            resetTest();
        });
    });

    if (restartTyping) {
        restartTyping.addEventListener("click", resetTest);
    }

    if (tryAgainTyping) {
        tryAgainTyping.addEventListener("click", resetTest);
    }

    resetTest();
}