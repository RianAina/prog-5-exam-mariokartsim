const prompt = require("prompt-sync")({ sigint: true });

// STRATEGY
class MoveStrategy {
    constructor(speed, stability) {
        this.speed = speed;
        this.stability = stability;
    }

    move(currentPosition, diceRoll) {
        return currentPosition + this.speed * diceRoll;
    }
}

// FACTORY 
class PilotFactory {
    static createPilot(name, isBot = false) {
        switch (name.toLowerCase()) {
            case "mario":
                return new Player("Mario", new MoveStrategy(2, 2), isBot);
            case "luigi":
                return new Player("Luigi", new MoveStrategy(1, 3), isBot);
            case "peach":
                return new Player("Peach", new MoveStrategy(3, 1), isBot);
            default:
                throw new Error("Pilote inconnu.");
        }
    }
}

// STATE EFFECTS
const Effect = {
    NORMAL: "normal",
    GLISSADE: "glissade",
    TURBO: "turbo"
};

// PLAYER 
class Player {
    constructor(name, strategy, isBot = false) {
        this.name = name;
        this.strategy = strategy;
        this.position = 0;
        this.effect = Effect.NORMAL;
        this.isBot = isBot;
    }

    // 1 chance sur 5 d'avoir une glissade ou un turbo
    applyRandomEffect() {
        const chance = Math.floor(Math.random() * 5);
        if (chance === 0) {
            this.effect = Math.random() < 0.5 ? Effect.GLISSADE : Effect.TURBO;
        } else {
            this.effect = Effect.NORMAL;
        }
    }

    async playTurn(isHuman) {
        if (!this.isBot) {
            prompt(`\nAppuyez sur [Entrée] pour lancer le dé (${this.name})...`);
        }

        const dice = Math.floor(Math.random() * 6) + 1;
        console.log(`${this.name} lance le dé : ${dice}`);

        this.applyRandomEffect();

        if (this.effect === Effect.GLISSADE) {
            console.log(`${this.name} glisse ! Il reste à sa position.`);
            return;
        }

        if (dice === 6 && this.strategy.stability < 2) {
            console.log(`${this.name} glisse à cause d’un 6 et d’une faible stabilité.`);
            return;
        }

        let movePosition = this.strategy.move(this.position, dice);

        if (this.effect === Effect.TURBO) {
            console.log(`${this.name} obtient un TURBO ! Il avance d'une case supplémentaire.`);
            movePosition += 1;
        }

        console.log(`${this.name} avance de ${movePosition - this.position} cases.`);
        this.position = movePosition;
    }

    hasWon() {
        return this.position >= 20;
    }

    getTrackPosition() {
        const track = Array(21).fill("-");
        track[Math.min(this.position, 20)] = this.name.charAt(0);
        return track.join("");
    }
}

// GAME 
class Game {
    constructor() {
        this.players = [];
        this.humanPlayer = null;
    }

    setup() {
        console.log("=== Mario Kart Simulator ===");
        const botChoice = prompt("Voulez-vous ajouter des bots ? (oui/non) : ").toLowerCase();

        const playerName = prompt("Entrez votre nom : ");
        const playerPilot = this.choosePilot(playerName, false);
        this.humanPlayer = playerPilot;
        this.players.push(playerPilot);

        if (botChoice === "oui") {
            const availableBots = ["Luigi", "Peach"].filter(p => p.toLowerCase() !== playerPilot.name.toLowerCase());
            availableBots.forEach(botName => {
                const botPilot = PilotFactory.createPilot(botName, true);
                this.players.push(botPilot);
                console.log(`Bot ajouté : ${botName}`);
            });
        }
    }

    choosePilot(playerName, isBot) {
        console.log("\nChoisissez votre pilote :");
        console.log("1. Mario (vitesse: 2, stabilité: 2)");
        console.log("2. Luigi (vitesse: 1, stabilité: 3)");
        console.log("3. Peach (vitesse: 3, stabilité: 1)");

        while (true) {
            const choice = prompt(`${playerName}, entrez le nom du pilote : `).toLowerCase();
            try {
                return PilotFactory.createPilot(choice, isBot);
            } catch {
                console.log("Choix invalide. Réessayez.");
            }
        }
    }

    async start() {
        console.log("\n🏁 La course commence ! 🏁\n");
        let winner = null;

        while (!winner) {
            for (const player of this.players) {
                console.log(`\nTour de ${player.name} :`);
                await player.playTurn(!player.isBot);
                console.log(player.getTrackPosition());

                if (player.hasWon()) {
                    winner = player;
                    break;
                }
            }
        }

        console.log(`\n🏆 ${winner.name} remporte la course ! 🏆`);
    }
}

// LANCEMENT DU JEU
const game = new Game();
game.setup();
game.start();
