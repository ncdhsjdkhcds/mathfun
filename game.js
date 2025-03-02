const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const colors = ["red", "green", "blue", "yellow", "orange"];
let score = 0;
let question = "";
let answer = 0;
let userAnswer = "";
let history = [];
let fireworks = [];

// Set canvas size based on window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.95;

// Game Variables
let correctAnswerTimeout;
let wrongAnswerTimeout;
let nextQuestionTimeout;

// Fireworks Classes
class Projectile {
    constructor(x, y, xVel, yVel, color) {
        this.x = x;
        this.y = y;
        this.xVel = xVel;
        this.yVel = yVel;
        this.color = color;
        this.alpha = 255;
    }

    move() {
        this.x += this.xVel;
        this.y += this.yVel;
        this.alpha = Math.max(0, this.alpha - 3);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha / 255;
        ctx.fillRect(this.x, this.y, 5, 10);
        ctx.globalAlpha = 1.0;
    }
}

class Firework {
    constructor(x, y, yVel, explodeHeight, color) {
        this.x = x;
        this.y = y;
        this.yVel = yVel;
        this.explodeHeight = explodeHeight;
        this.color = color;
        this.projectiles = [];
        this.exploded = false;
    }

    explode() {
        this.exploded = true;
        let numProjectiles = Math.floor(Math.random() * 25) + 25;
        this.createProjectiles(numProjectiles);
    }

    createProjectiles(numProjectiles) {
        let angleDiff = Math.PI * 2 / numProjectiles;
        let currentAngle = 0;
        let vel = Math.random() * (4 - 3) + 3;
        for (let i = 0; i < numProjectiles; i++) {
            let xVel = Math.sin(currentAngle) * vel;
            let yVel = Math.cos(currentAngle) * vel;
            let color = colors[Math.floor(Math.random() * colors.length)];
            this.projectiles.push(new Projectile(this.x, this.y, xVel, yVel, color));
            currentAngle += angleDiff;
        }
    }

    move() {
        if (!this.exploded) {
            this.y += this.yVel;
            if (this.y <= this.explodeHeight) {
                this.explode();
            }
        }

        this.projectiles.forEach(projectile => {
            projectile.move();
            if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
                this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
            }
        });
    }

    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        this.projectiles.forEach(projectile => projectile.draw());
    }
}

// Game Functions
function generateQuestion() {
    const num1 = Math.floor(Math.random() * 50);
    const num2 = Math.floor(Math.random() * 50);
    question = `${num1} + ${num2} = ?`;
    answer = num1 + num2;
    userAnswer = "";
    document.getElementById("feedback").textContent = "";
    document.getElementById("wrongFeedback").textContent = "";
    document.getElementById("wrongSymbol").style.display = "none";
    updateHistory();
}

function checkAnswer() {
    const userInt = parseInt(userAnswer);
    if (userInt === answer) {
        score++;
        fireworks.push(new Firework(Math.random() * canvas.width, canvas.height / 2, -3, Math.random() * 100 + 200, colors[Math.floor(Math.random() * colors.length)]));
        document.getElementById("feedback").textContent = "Correct!";
        document.getElementById("feedback").style.color = "green";
        history.push(`${question} Your Answer: ${userAnswer} (Correct)`);
        resetAnswerAfterDelay();
    } else {
        score -= 2;
        document.getElementById("wrongFeedback").textContent = "Wrong!";
        document.getElementById("wrongSymbol").style.display = "block";
        history.push(`${question} Your Answer: ${userAnswer} (Wrong)`);
        resetAnswerAfterDelay();
    }
    updateScore();
}

function resetAnswerAfterDelay() {
    setTimeout(() => {
        generateQuestion();
    }, 2500);
}

function updateHistory() {
    let historyHtml = "";
    history.forEach(entry => {
        historyHtml += `<div>${entry}</div>`;
    });
    document.getElementById("history").innerHTML = historyHtml;
}

function updateScore() {
    document.getElementById("score").textContent = `Score: ${score}`;
}

// Main Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach(firework => {
        firework.move();
        firework.draw();
    });

    requestAnimationFrame(gameLoop);
}

// Keyboard Input
window.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkAnswer();
    } else if (event.key === "Backspace") {
        userAnswer = userAnswer.slice(0, -1);
    } else {
        userAnswer += event.key;
    }
});

// Start Game
generateQuestion();
gameLoop();
