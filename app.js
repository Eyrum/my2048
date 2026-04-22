const TILE_COLORS = {
    2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
    32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
    512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
    4096: '#3c3a32', 8192: '#3c3a32'
};

const TILE_TEXT_COLORS = {
    2: '#776e65', 4: '#776e65'
};

class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.best = parseInt(localStorage.getItem('best2048')) || 0;
        this.hasConflicted = [];
        this.gridContainer = document.getElementById('grid-container');
        this.scoreEl = document.getElementById('score');
        this.bestEl = document.getElementById('best');
        this.gameOverModal = document.getElementById('game-over');
        this.youWinModal = document.getElementById('you-win');
        this.finalScoreEl = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.newGameBtn = document.getElementById('newgamebutton');
        this.keepPlaying = false;

        this.cellCount = 4;
        this.setupDimensions();
        this.bindEvents();
        this.updateBestDisplay();
        this.newGame();
    }

    setupDimensions() {
        const w = Math.min(window.innerWidth, 520);
        if (w > 520) {
            this.gridSize = 460;
            this.cellSize = 100;
            this.gap = 15;
        } else {
            this.gridSize = w * 0.92;
            this.cellSize = this.gridSize * 0.2;
            this.gap = this.gridSize * 0.04;
        }

        this.gridContainer.style.width = this.gridSize + 'px';
        this.gridContainer.style.height = this.gridSize + 'px';
        this.gridContainer.style.padding = this.gap + 'px';

        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const parts = cell.id.split('-');
            const i = parseInt(parts[2]);
            const j = parseInt(parts[3]);
            cell.style.width = this.cellSize + 'px';
            cell.style.height = this.cellSize + 'px';
            cell.style.top = this.getPosTop(i, j) + 'px';
            cell.style.left = this.getPosLeft(i, j) + 'px';
        });

        const nums = document.querySelectorAll('.number-cell');
        nums.forEach(n => {
            n.style.lineHeight = this.cellSize + 'px';
        });
    }

    getPos(i, j) {
        return this.gap + j * (this.cellSize + this.gap);
    }

    getPosTop(i, j) {
        return this.gap + i * (this.cellSize + this.gap);
    }

    getPosLeft(i, j) {
        return this.gap + j * (this.cellSize + this.gap);
    }

    newGame() {
        this.init();
        this.updateScore(0);
        this.generateOneNumber();
        this.generateOneNumber();
        this.hideModal(this.gameOverModal);
        this.hideModal(this.youWinModal);
        this.keepPlaying = false;
    }

    init() {
        for (let i = 0; i < this.cellCount; i++) {
            this.board[i] = [];
            this.hasConflicted[i] = [];
            for (let j = 0; j < this.cellCount; j++) {
                this.board[i][j] = 0;
                this.hasConflicted[i][j] = false;
            }
        }
        this.score = 0;
        this.clearNumberCells();
    }

    clearNumberCells() {
        const nums = document.querySelectorAll('.number-cell');
        nums.forEach(n => n.remove());
    }

    updateBoardView() {
        this.clearNumberCells();

        for (let i = 0; i < this.cellCount; i++) {
            for (let j = 0; j < this.cellCount; j++) {
                if (this.board[i][j] !== 0) {
                    this.createNumberCell(i, j, this.board[i][j]);
                }
                this.hasConflicted[i][j] = false;
            }
        }
    }

    createNumberCell(i, j, value, isNew = false) {
        const cell = document.createElement('div');
        cell.className = 'number-cell';
        cell.id = `number-cell-${i}-${j}`;
        cell.textContent = value;
        cell.style.width = this.cellSize + 'px';
        cell.style.height = this.cellSize + 'px';
        cell.style.top = this.getPosTop(i, j) + 'px';
        cell.style.left = this.getPosLeft(i, j) + 'px';
        cell.style.background = TILE_COLORS[value] || '#3c3a32';
        cell.style.color = TILE_TEXT_COLORS[value] || '#f9f6f2';
        cell.style.lineHeight = this.cellSize + 'px';
        cell.style.fontSize = this.getFontSize(value);
        if (isNew) cell.classList.add('new');
        this.gridContainer.appendChild(cell);
    }

    getFontSize(value) {
        if (value >= 1024) return this.cellSize * 0.35 + 'px';
        if (value > 64) return this.cellSize * 0.45 + 'px';
        return this.cellSize * 0.55 + 'px';
    }

    generateOneNumber() {
        if (this.noSpace()) return false;

        const empties = [];
        for (let i = 0; i < this.cellCount; i++) {
            for (let j = 0; j < this.cellCount; j++) {
                if (this.board[i][j] === 0) empties.push({ i, j });
            }
        }

        const pos = empties[Math.floor(Math.random() * empties.length)];
        const value = Math.random() < 0.6667 ? 2 : 4;
        this.board[pos.i][pos.j] = value;
        this.createNumberCell(pos.i, pos.j, value, true);
        return true;
    }

    noSpace() {
        for (let i = 0; i < this.cellCount; i++)
            for (let j = 0; j < this.cellCount; j++)
                if (this.board[i][j] === 0) return false;
        return true;
    }

    canMove() {
        return this.canMoveLeft() || this.canMoveRight() || this.canMoveUp() || this.canMoveDown();
    }

    canMoveLeft() {
        for (let i = 0; i < this.cellCount; i++)
            for (let j = 1; j < this.cellCount; j++)
                if (this.board[i][j] !== 0)
                    if (this.board[i][j - 1] === 0 || this.board[i][j - 1] === this.board[i][j])
                        return true;
        return false;
    }

    canMoveRight() {
        for (let i = 0; i < this.cellCount; i++)
            for (let j = this.cellCount - 2; j >= 0; j--)
                if (this.board[i][j] !== 0)
                    if (this.board[i][j + 1] === 0 || this.board[i][j + 1] === this.board[i][j])
                        return true;
        return false;
    }

    canMoveUp() {
        for (let j = 0; j < this.cellCount; j++)
            for (let i = 1; i < this.cellCount; i++)
                if (this.board[i][j] !== 0)
                    if (this.board[i - 1][j] === 0 || this.board[i - 1][j] === this.board[i][j])
                        return true;
        return false;
    }

    canMoveDown() {
        for (let j = 0; j < this.cellCount; j++)
            for (let i = this.cellCount - 2; i >= 0; i--)
                if (this.board[i][j] !== 0)
                    if (this.board[i + 1][j] === 0 || this.board[i + 1][j] === this.board[i][j])
                        return true;
        return false;
    }

    noBlockHorizontal(row, col1, col2) {
        for (let k = col1 + 1; k < col2; k++)
            if (this.board[row][k] !== 0) return false;
        return true;
    }

    noBlockVertical(col, row1, row2) {
        for (let k = row1 + 1; k < row2; k++)
            if (this.board[k][col] !== 0) return false;
        return true;
    }

    moveLeft() {
        if (!this.canMoveLeft()) return false;
        let moved = false;

        for (let i = 0; i < this.cellCount; i++) {
            for (let j = 1; j < this.cellCount; j++) {
                if (this.board[i][j] !== 0) {
                    for (let k = 0; k < j; k++) {
                        if (this.board[i][k] === 0 && this.noBlockHorizontal(i, k, j)) {
                            this.animateMove(i, j, i, k);
                            this.board[i][k] = this.board[i][j];
                            this.board[i][j] = 0;
                            moved = true;
                            break;
                        } else if (this.board[i][k] === this.board[i][j] && this.noBlockHorizontal(i, k, j) && !this.hasConflicted[i][k]) {
                            this.animateMove(i, j, i, k);
                            this.board[i][k] += this.board[i][j];
                            this.board[i][j] = 0;
                            this.score += this.board[i][k];
                            this.hasConflicted[i][k] = true;
                            moved = true;
                            break;
                        }
                    }
                }
            }
        }

        if (moved) {
            this.updateScore(this.score);
            setTimeout(() => this.updateBoardView(), 150);
        }
        return moved;
    }

    moveRight() {
        if (!this.canMoveRight()) return false;
        let moved = false;

        for (let i = 0; i < this.cellCount; i++) {
            for (let j = this.cellCount - 2; j >= 0; j--) {
                if (this.board[i][j] !== 0) {
                    for (let k = this.cellCount - 1; k > j; k--) {
                        if (this.board[i][k] === 0 && this.noBlockHorizontal(i, j, k)) {
                            this.animateMove(i, j, i, k);
                            this.board[i][k] = this.board[i][j];
                            this.board[i][j] = 0;
                            moved = true;
                            break;
                        } else if (this.board[i][k] === this.board[i][j] && this.noBlockHorizontal(i, j, k) && !this.hasConflicted[i][k]) {
                            this.animateMove(i, j, i, k);
                            this.board[i][k] += this.board[i][j];
                            this.board[i][j] = 0;
                            this.score += this.board[i][k];
                            this.hasConflicted[i][k] = true;
                            moved = true;
                            break;
                        }
                    }
                }
            }
        }

        if (moved) {
            this.updateScore(this.score);
            setTimeout(() => this.updateBoardView(), 150);
        }
        return moved;
    }

    moveUp() {
        if (!this.canMoveUp()) return false;
        let moved = false;

        for (let j = 0; j < this.cellCount; j++) {
            for (let i = 1; i < this.cellCount; i++) {
                if (this.board[i][j] !== 0) {
                    for (let k = 0; k < i; k++) {
                        if (this.board[k][j] === 0 && this.noBlockVertical(j, k, i)) {
                            this.animateMove(i, j, k, j);
                            this.board[k][j] = this.board[i][j];
                            this.board[i][j] = 0;
                            moved = true;
                            break;
                        } else if (this.board[k][j] === this.board[i][j] && this.noBlockVertical(j, k, i) && !this.hasConflicted[k][j]) {
                            this.animateMove(i, j, k, j);
                            this.board[k][j] += this.board[i][j];
                            this.board[i][j] = 0;
                            this.score += this.board[k][j];
                            this.hasConflicted[k][j] = true;
                            moved = true;
                            break;
                        }
                    }
                }
            }
        }

        if (moved) {
            this.updateScore(this.score);
            setTimeout(() => this.updateBoardView(), 150);
        }
        return moved;
    }

    moveDown() {
        if (!this.canMoveDown()) return false;
        let moved = false;

        for (let j = 0; j < this.cellCount; j++) {
            for (let i = this.cellCount - 2; i >= 0; i--) {
                if (this.board[i][j] !== 0) {
                    for (let k = this.cellCount - 1; k > i; k--) {
                        if (this.board[k][j] === 0 && this.noBlockVertical(j, i, k)) {
                            this.animateMove(i, j, k, j);
                            this.board[k][j] = this.board[i][j];
                            this.board[i][j] = 0;
                            moved = true;
                            break;
                        } else if (this.board[k][j] === this.board[i][j] && this.noBlockVertical(j, i, k) && !this.hasConflicted[k][j]) {
                            this.animateMove(i, j, k, j);
                            this.board[k][j] += this.board[i][j];
                            this.board[i][j] = 0;
                            this.score += this.board[k][j];
                            this.hasConflicted[k][j] = true;
                            moved = true;
                            break;
                        }
                    }
                }
            }
        }

        if (moved) {
            this.updateScore(this.score);
            setTimeout(() => this.updateBoardView(), 150);
        }
        return moved;
    }

    animateMove(fromI, fromJ, toI, toJ) {
        const cell = document.getElementById(`number-cell-${fromI}-${fromJ}`);
        if (!cell) return;
        cell.style.top = this.getPosTop(toI, toJ) + 'px';
        cell.style.left = this.getPosLeft(toI, toJ) + 'px';
    }

    updateScore(score) {
        this.score = score;
        this.scoreEl.textContent = score;
        if (score > this.best) {
            this.best = score;
            this.bestEl.textContent = this.best;
            localStorage.setItem('best2048', this.best);
        }
    }

    updateBestDisplay() {
        this.bestEl.textContent = this.best;
    }

    isGameOver() {
        if (this.noSpace() && !this.canMove()) {
            this.finalScoreEl.textContent = this.score;
            this.showModal(this.gameOverModal);
        }
    }

    checkWin() {
        if (this.keepPlaying) return;
        for (let i = 0; i < this.cellCount; i++) {
            for (let j = 0; j < this.cellCount; j++) {
                if (this.board[i][j] === 2048) {
                    this.showModal(this.youWinModal);
                    return;
                }
            }
        }
    }

    showModal(modal) {
        modal.classList.remove('hidden');
    }

    hideModal(modal) {
        modal.classList.add('hidden');
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.newGame();
        });

        this.restartBtn.addEventListener('click', () => this.newGame());
        this.continueBtn.addEventListener('click', () => {
            this.hideModal(this.youWinModal);
            this.keepPlaying = true;
        });

        document.addEventListener('keydown', (e) => {
            let moved = false;
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    e.preventDefault();
                    moved = this.moveLeft();
                    break;
                case 'ArrowRight':
                case 'd':
                    e.preventDefault();
                    moved = this.moveRight();
                    break;
                case 'ArrowUp':
                case 'w':
                    e.preventDefault();
                    moved = this.moveUp();
                    break;
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    moved = this.moveDown();
                    break;
            }
            if (moved) {
                setTimeout(() => this.generateOneNumber(), 160);
                setTimeout(() => {
                    this.checkWin();
                    this.isGameOver();
                }, 300);
            }
        });

        let startX = 0, startY = 0;
        this.gridContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return;
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;
        }, { passive: true });

        this.gridContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.gridContainer.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].pageX;
            const endY = e.changedTouches[0].pageY;
            const dx = endX - startX;
            const dy = endY - startY;
            const threshold = this.gridSize * 0.1;

            if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

            let moved = false;
            if (Math.abs(dx) > Math.abs(dy)) {
                moved = dx > 0 ? this.moveRight() : this.moveLeft();
            } else {
                moved = dy > 0 ? this.moveDown() : this.moveUp();
            }

            if (moved) {
                setTimeout(() => this.generateOneNumber(), 160);
                setTimeout(() => {
                    this.checkWin();
                    this.isGameOver();
                }, 300);
            }
        });

        window.addEventListener('resize', () => {
            this.setupDimensions();
            this.updateBoardView();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
