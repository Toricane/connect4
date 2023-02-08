// AI functions
function shuffle(array) {
    var random = array.map(Math.random);
    array.sort(function(a, b) {
        return random[a] - random[b];
    });
}
const deepcopy = (items) => items.map(item => Array.isArray(item) ? deepcopy(item) : item);

function move_is_valid(board, move) {
    if (move < 1 || move > board.length) {
        return false;
    }
    if (board[move - 1][0] != " ") {
        return false;
    }
    return true;
}

function select_space(board, column, player) {
    if (!move_is_valid(board, column)) {
        return false;
    }
    if (player != "X" && player != "O") {
        return false;
    }
    for (let y = board.length - 1; y > -1; y--) {
        if (board[column - 1][y] === " ") {
            board[column - 1][y] = player;
            return true;
        }
    }
    return false;
}

function board_is_full(board) {
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[1].length; y++) {
            if (board[x][y] === " ") {
                return false;
            }
        }
    }
    return true;
}

function available_moves(board) {
    moves = [];
    for (let i = 1; i < board.length + 1; i++) {
        if (move_is_valid(board, i)) {
            moves.push(i);
        }
    }
    return moves;
}

function has_won(board, symbol) {
    // check - spaces
    for (let y = 0; y < board[0].length; y++) {
        for (let x = 0; x < board.length - 3; x++) {
            if (board[x][y] === symbol && board[x + 1][y] === symbol && board[x + 2][y] === symbol && board[x + 3][y] === symbol) {
                return true;
            }
        }
    }
    // check | spaces
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[0].length - 3; y++) {
            if (board[x][y] === symbol && board[x][y + 1] === symbol && board[x][y + 2] === symbol && board[x][y + 3] === symbol) {
                return true;
            }
        }
    }
    // check / spaces
    for (let x = 0; x < board.length - 3; x++) {
        for (let y = 3; y < board[0].length; y++) {
            if (board[x][y] === symbol && board[x + 1][y - 1] === symbol && board[x + 2][y - 2] === symbol && board[x + 3][y - 3] === symbol) {
                return true;
            }
        }
    }
    // check \ spaces
    for (let x = 0; x < board.length - 3; x++) {
        for (let y = 0; y < board[0].length - 3; y++) {
            if (board[x][y] === symbol && board[x + 1][y + 1] === symbol && board[x + 2][y + 2] === symbol && board[x + 3][y + 3] === symbol) {
                return true;
            }
        }
    }
    return false;
}

function game_is_over(board) {
    return (has_won(board, "X") || has_won(board, "O") || available_moves(board).length === 0);
}

function evaluate_board(board) {
    if (has_won(board, "X")) {
        return Number.MAX_SAFE_INTEGER;
    } else if (has_won(board, "O")) {
        return Number.MIN_SAFE_INTEGER;
    } else {
        const num_all_x = count_streaks(board, "X");
        const num_all_o = count_streaks(board, "O");
        return num_all_x - num_all_o;
    }
}

function minimax(input_board, is_maximizing, depth, alpha, beta) {
    if (game_is_over(input_board) || depth === 0) {
        return [evaluate_board(input_board), ""]
    }
    let _alpha = deepcopy([alpha]);
    let _beta = deepcopy([beta]);
    let moves = available_moves(input_board);
    shuffle(moves);
    let best_move = moves[0]
    if (is_maximizing) {
        let best_value = Number.MIN_SAFE_INTEGER;
        for (const move of moves) {
            let new_board = deepcopy(input_board);
            select_space(new_board, move, "X");
            const hypothetical_value = minimax(new_board, false, depth - 1, _alpha, _beta)[0];
            if (hypothetical_value > best_value) {
                best_value = hypothetical_value;
                best_move = move;
            }
            let alpha = Math.max(_alpha, best_value);
            if (alpha >= _beta) {
                break;
            }
        }
        return [best_value, best_move];
    } else {
        let best_value = Number.MAX_SAFE_INTEGER;
        for (const move of moves) {
            let new_board = deepcopy(input_board);
            select_space(new_board, move, "O");
            const hypothetical_value = minimax(new_board, true, depth - 1, _alpha, _beta)[0];
            if (hypothetical_value < best_value) {
                best_value = hypothetical_value;
                best_move = move;
            }
            let beta = Math.min(_beta, best_value);
            if (_alpha >= beta) {
                break;
            }
        }
        return [best_value, best_move];
    }
}

function count_streaks(board, symbol) {
    let count = 0;
    let num_in_streak;
    for (let col = 0; col < board.length; col++) {
        for (let row = 0; row < board[0].length; row++) {
            if (board[col][row] != symbol) {
                continue;
            }
            // -->
            if (col < board.length - 3) {
                num_in_streak = 0;
                for (let i = 0; i < 4; i++) {
                    if (board[col + i][row] === symbol) {
                        num_in_streak++;
                    } else if (board[col + i][row] != " ") {
                        num_in_streak = 0;
                        break;
                    }
                }
                count += num_in_streak;
            }
            // <--
            if (col > 2) {
                num_in_streak = 0;
                for (let i = 0; i < 4; i++) {
                    if (board[col - i][row] === symbol) {
                        num_in_streak++;
                    } else if (board[col - i][row] != " ") {
                        num_in_streak = 0;
                        break;
                    }
                }
                count += num_in_streak;
            }
            // / up right
            if (col < board.length - 3 && row > 2) {
                num_in_streak = 0;
                for (let i = 0; i < 4; i++) {
                    if (board[col + i][row - 1] === symbol) {
                        num_in_streak++;
                    } else if (board[col + i][row - 1] != " ") {
                        num_in_streak = 0;
                        break;
                    }
                }
                count += num_in_streak;
            }
            // \ down right
            if (col < board.length - 3 && row < board[0].length - 3) {
                num_in_streak = 0;
                for (let i = 0; i < 4; i++) {
                    if (board[col + i][row + 1] === symbol) {
                        num_in_streak++;
                    } else if (board[col + i][row + 1] != " ") {
                        num_in_streak = 0;
                        break;
                    }
                }
                count += num_in_streak;
            }
            // / down left
            if (col > 2 && row > board[0].length - 3) {
                for (let i = 0; i < 4; i++) {
                    if (board[col - i][row + 1] === symbol) {
                        num_in_streak++;
                    } else if (board[col - i][row + 1] != " ") {
                        num_in_streak = 0;
                        break;
                    }
                }
                count += num_in_streak;
            }
            // \ up left
            if (col > 2 && row > 2) {
                for (let i = 0; i < 4; i++) {
                    if (board[col - i][row - 1] === symbol) {
                        num_in_streak++;
                    } else if (board[col - i][row - 1] != " ") {
                        num_in_streak = 0;
                        break;
                    }
                }
                count += num_in_streak;
            }
            // | down
            num_in_streak = 0;
            if (row < board[0].length - 3) {
                for (let i = 0; i < 4; i++) {
                    if (row + i < board[0].length) {
                        if (board[col][row + i] === symbol) {
                            num_in_streak++;
                        } else {
                            break;
                        }
                    }
                }
            }
            for (let i = 0; i < 4; i++) {
                if (row - i > 0) {
                    if (board[col][row - i] === symbol) {
                        num_in_streak++;
                    } else if (board[col][row - 1] === " ") {
                        break;
                    } else {
                        num_in_streak = 0;
                    }
                }
            }
            if (row < 3) {
                if (num_in_streak + row < 4) {
                    num_in_streak = 0;
                }
            }
            count += num_in_streak;
        }
    }
    return count;
}


function generate_board() {
    let _board = [];
    let row;
    for (let i = 0; i < 7; i++) {
        row = [];
        for (let j = 0; j < 6; j++) {
            row.push(" ");
        }
        _board.push(row);
    }
    return _board;
}

function syncBoard() {
    const turnElement = document.getElementById("turn");
    if (turn === "X") {
        turnElement.innerHTML = "Red's Turn";
    } else {
        turnElement.innerHTML = "Yellow's Turn";
    }
    const table = document.getElementById("board");
    table.innerHTML = "";

    for (let y = 0; y < board[0].length; y++) {
        const row = document.createElement("tr");
        for (let x = 0; x < board.length; x++) {
            const cell = document.createElement("td");
            cell.setAttribute("id", `${x},${y}`);
            cell.setAttribute("onclick", "dropPiece(this.id)");
            if (board[x][y] === "X") {
                cell.className = "red";
            } else if (board[x][y] === "O") {
                cell.className = "yellow";
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    if (has_won(board, "X") || has_won(board, "O")) {
        const turnElement = document.getElementById("turn");
        if (turn === "X") {
            turnElement.innerHTML = "Yellow Wins!";
        } else {
            turnElement.innerHTML = "Red Wins!";
        }
    } else if (game_is_over(board)) {
        const turnElement = document.getElementById("turn");
        turnElement.innerHTML = "Draw!";
    }
}

let turn = "X";

function dropPiece(id, pl = true) {
    if (ai && turn === ai && pl || game_is_over(board)) return;
    let col;
    if (typeof id === "string") {
        col = parseInt(id.split(",")[0]);
    } else {
        col = id;
    }
    if (!pl) {
        col -= 1;
    }
    place(turn, col + 1);
    if (turn === "X") {
        turn = "O";
    } else {
        turn = "X";
    }
    syncBoard();
    handleGameLogic();
}

function place(player, column) {
    column = parseInt(column);
    if (!move_is_valid(board, column)) {
        return false;
    }
    if (player !== "X" && player !== "O") {
        return false;
    }
    for (let y = board[0].length - 1; y >= 0; y--) {
        if (board[column - 1][y] === ' ') {
            board[column - 1][y] = player;
            return true;
        }
    }
    return false;
}

let board = generate_board();
let ai = "";

syncBoard();

function getRandomInt() {
    return Math.round(Math.random());
}

function handleGameLogic() {
    if (!game_is_over(board)) {
        if (ai === turn) {
            const ai_level = parseInt(document.getElementById("ai-level").value);
            let col;
            if (ai === "X") {
                col = parseInt(minimax(board, true, ai_level, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)[1]);
            }
            if (ai === "O") {
                col = parseInt(minimax(board, false, ai_level, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)[1]);
            }
            dropPiece(col, false);
            console.log(col);
        }
        syncBoard();
    } else if (has_won(board, "X") || has_won(board, "O")) {
        const turnElement = document.getElementById("turn");
        if (turn === "X") {
            turnElement.innerHTML = "Yellow Wins!";
        } else {
            turnElement.innerHTML = "Red Wins!";
        }
    } else {
        const turnElement = document.getElementById("turn");
        turnElement.innerHTML = "Draw!";
    }
}

function startAIGame() {
    board = generate_board();
    syncBoard();
    turn = "X";
    if (getRandomInt() === 1) {
        ai = "X";
    } else {
        ai = "O";
    }
    handleGameLogic();
}