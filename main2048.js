var board = [];
var score = 0;

var startx = 0;
var starty = 0;
var endx = 0;
var endy = 0;

$(function() {
    prepareForMobile();
    newGame();
});

$('#newgamebutton').on('click', function(event) {
    event.preventDefault();
    prepareForMobile();
    newGame();
});

function prepareForMobile () {

    if (documentWidth > 500) {
        gridContainerWidth = 500;
        cellSideLength = 100;
        cellSpace = 20;
    }

    $('#grid-container').css('width', gridContainerWidth - 2 * cellSpace);
    $('#grid-container').css('height', gridContainerWidth - 2 * cellSpace);
    $('#grid-container').css('padding', cellSpace);
    $('#grid-container').css('borderRadius', 0.02 * gridContainerWidth);

    $('.grid-cell').css('width', cellSideLength);
    $('.grid-cell').css('height', cellSideLength);
} 

function newGame() {
    init();
    updataScore(score);
    generateOneNumber();
    generateOneNumber();
}

function init() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var gridCell = $('#grid-cell-' + i + '-' + j);
            gridCell.css('top', getPosTop(i, j));
            gridCell.css('left', getPosLeft(i, j));
        }
    }

    for (var i = 0; i < 4; i++) {
        board[i] = [];
        for (var j = 0; j < 4; j++) {
            board[i][j] = 0;
        }
    }
    score = 0;
    updateBoardView();
}

function updateBoardView() {
    $('.number-cell').remove();

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var numberCellItems = $('<div class="number-cell"/>');
            numberCellItems.attr('id', 'number-cell-' + i + '-' + j);
            $('#grid-container').append(numberCellItems);
            var theNumberCell = $('#number-cell-' + i + '-' + j);

            if (board[i][j] === 0) {
                theNumberCell.css('width', '0px');
                theNumberCell.css('height', '0px');
                theNumberCell.css('top', getPosTop(i, j) + cellSideLength / 2);
                theNumberCell.css('left', getPosLeft(i, j) + cellSideLength / 2);
            } else {
                theNumberCell.css('width', cellSideLength);
                theNumberCell.css('height', cellSideLength);
                theNumberCell.css('top', getPosTop(i, j));
                theNumberCell.css('left', getPosLeft(i, j));
                theNumberCell.css('background', getNumberBackgroundColor(board[i][j]));
                theNumberCell.css('color', getNumberColor(board[i][j]));
                theNumberCell.text(board[i][j]);
                if (parseInt(theNumberCell.text()) >= 64 && parseInt(theNumberCell.text()) < 1024) {
                    theNumberCell.css('fontSize', 30);
                } else if (parseInt(theNumberCell.text()) >= 1024)　{
                    theNumberCell.css('fontSize', 20);
                }
            }
        }
    }
    $('.number-cell').css('line-height', cellSideLength+ 'px');
}

function generateOneNumber() {
    if (nospace(board)) {
        return false;
    }

    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));
    // 定义循环５０次　若没找到，则手动设置随机的位置
    var times = 0;
    while (times < 50) {
        if (board[randx][randy] === 0) {
            break;
        }
        randx = parseInt(Math.floor(Math.random() * 4));
        randy = parseInt(Math.floor(Math.random() * 4));
        times++;
    }
    if (times === 50) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (board[i][j] === 0) {
                    randx = i;
                    randy = j;
                }
            }
        }
    }

    var randNumber = Math.random() < 0.6667 ? 2 : 4;

    board[randx][randy] = randNumber;

    showNumberWithAnimation(randx, randy, randNumber);

    return true;
}


$(document).keydown(function(event) {
    
    switch (event.keyCode) {
        case 37: // left
            event.preventDefault();
            setTimeout("generateOneNumber()", 210);
            if (moveLeft()) {
                setTimeout("isgameover()", 300);
            }
            break;
        case 38: // up
            event.preventDefault();
            setTimeout("generateOneNumber()", 210);
            if (moveUp()) {
                setTimeout("isgameover()", 300);
            }
            break;
        case 39: // right
            event.preventDefault();
            setTimeout("generateOneNumber()", 210);
            if (moveRight()) {
                setTimeout("isgameover()", 300);
            }
            break;
        case 40: // down
            event.preventDefault();
            setTimeout("generateOneNumber()", 210);
            if (moveDown()) {
                setTimeout("isgameover()", 300);
            }
            break;
        default:
            break;
    }
});

document.addEventListener('touchstart', function (event) {
    startx = event.touches[0].pageX;
    starty = event.touches[0].pageY;
});

document.addEventListener('touchmove', function (event) {
    event.preventDefault();
});

document.addEventListener('touchend', function (event) {

    endx = event.changedTouches[0].pageX;
    endy = event.changedTouches[0].pageY;


    var deltax = endx - startx;
    var deltay = endy - starty;

    if (Math.abs(deltax) < 0.1 * documentWidth && Math.abs(deltay) < 0.1 * documentWidth) {
        return;
    }

    if (Math.abs(deltax) > Math.abs(deltay)) {
        // x
        if (deltax > 0)　{
            // right
            setTimeout("generateOneNumber()", 210);
            if (moveRight()) {
                setTimeout("isgameover()", 300);
            }
        } else {
            // left
            setTimeout("generateOneNumber()", 210);
            if (moveLeft()) {
                setTimeout("isgameover()", 300);
            }
        }
    } else {
        // y
        if (deltay < 0) {
            // up
            setTimeout("generateOneNumber()", 210);
            if (moveUp()) {
                setTimeout("isgameover()", 300);
            }
        } else {
            // down
            setTimeout("generateOneNumber()", 210);
            if (moveDown()) {
                setTimeout("isgameover()", 300);
            }
        }
    }

});


function isgameover() {
    if (nospace(board) && nomove(board)) {
        gameover();
    }
}

function gameover() {
    if (confirm('Game Over! \n Again?')) {
        newGame();
    }
}

function moveLeft() {
    if (!canMoveLeft(board)) {
        return false;
    }

    for (var i = 0; i < 4; i++) {
        for (var j = 1; j < 4; j++) {
            if (board[i][j] !== 0) {
                for (var k = 0; k < j; k++) {
                    if (board[i][k] === 0 && noBlockHorizontal(i, k, j, board)) {
                        // move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[i][k] === board[i][j] && noBlockHorizontal(i, k, j, board)) {
                        // move
                        showMoveAnimation(i, j, i, k);
                        // add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        score += board[i][k];
                        updataScore(score);
                        continue;
                    }
                }
            }
        }
    }
    setTimeout('updateBoardView()', 300);
    return true;
}

function moveUp() {
    if (!canMoveUp(board)) {
        return false;
    }

    for (var i = 1; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j] !== 0) {
                for (var k = 0; k < i; k++) {
                    if (board[k][j] === 0 && noBlockHorizontalY(j, k, i, board)) {
                        // move 
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[k][j] === board[i][j] && noBlockHorizontalY(j, k, i, board)) {
                        // move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        score += board[i][k];
                        updataScore(score);
                        continue;
                    }
                }
            }
        }
    }

    setTimeout('updateBoardView()', 300);
    return true;
}

function moveRight() {
    if (!canMoveRight(board)) {
        return false;
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 2; j >= 0; j--) {
            if (board[i][j] !== 0) {
                for (var k = 3; k > j; k--) {
                    if (board[i][k] === 0 && noBlockHorizontal(i, j, k, board)) {
                        // move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[i][k] === board[i][j] && noBlockHorizontal(i, j, k, board)) {
                        // move
                        showMoveAnimation(i, j, i, k);
                        // add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        score += board[i][k];
                        updataScore(score);
                        continue;
                    }
                }
            }
        }
    }
    setTimeout('updateBoardView()', 300);
    return true;
}


function moveDown() {
    if (!canMoveDown(board)) {
        return false;
    }
    for (var i = 2; i >= 0; i--) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j] !== 0) {
                for (var k = 3; k > i; k--) {
                    if (board[k][j] === 0 && noBlockHorizontalY(j, i, k, board)) {
                        // move 
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    } else if (board[k][j] === board[i][j] && noBlockHorizontalY(j, i, k, board)) {
                        // move 
                        showMoveAnimation(i, j, k, j);
                        // add 
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        score += board[i][k];
                        updataScore(score);
                        continue;
                    }
                }
            }
        }
    }
    setTimeout('updateBoardView()', 300);
    return true;
}