const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score")
const  ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 40;
const VACANT = "WHITE" //color of an empty space

//draw a square
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    strokeStyle = "BLACK";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// create the board

let board =[];
for(r = 0; r < ROW; r++){
    board[r] = [];
    for (c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

//draw the board
function drawBoard(){
    for(r = 0; r < ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}
drawBoard();

//The pieces and their color

const PIECES = [
    [S,"yellow"],
    [Z,"red"],
    [T,"blue"],
    [O,"green"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];
// generate random pieces
function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece(PIECES[r][0], PIECES[r][1])
}
// initiate a piece

let p = randomPiece();

//The Object Piece

function Piece(tetromino, color){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0 // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN]

    //control the pieces
    this.x = 3;
    this.y = -2;
}
// fill function

Piece.prototype.fill = function(color){
    for(r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length;c++){
            //we draw only occupied squares
            if(this.activeTetromino[r][c]){
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}
//draw a pieces to the board

Piece.prototype.draw = function(){
    this.fill(this.color);
}
//un draw a piece

Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

//move Down the piece

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        //we lock the piece and generate new one
        this.lock();
        p = randomPiece();
    }
}

//move Right the piece

Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

//move Left the piece
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}
//rotate the piece
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[((this.tetrominoN + 1) % this.tetromino.length)]
    let kick = 0;

    if(this.collision(0,0,nextPattern))
        if(this.x > COL/2){
            //it's the right wall
            kick = -1;//we need to move the piece to the left
        }else{
            //it's the left wall
            kick = 1;//we need to move the piece to the right
        }
    if(!this.collision(kick,0,nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0 + 1) % 4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}
let score = 0;

Piece.prototype.lock = function(){
    for(r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            //we skip the vacant squares
            if(!this.activeTetromino[r][c]){
                continue;
            }
            console.log(this.y + r)
            //pieces to lock on top = game over
            if(this.y + r < 0){
                // alert("Game Over");
                // stop request animation frame
                openForm();
                gameOver = true;
                break;
            }
            //we lock the piece
            board[this.y + r][this.x + c] = this.color;
        }
    }
    //remove full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for(c = 0 ; c < COL;c++){
            isRowFull = isRowFull && (board[r][c] !== VACANT)
        }
        if(isRowFull){
            //if the row is full
            // we move down all the rows above it
            for(y = r; y > 1; y--){
                for(c = 0; c < COL; c++){
                    board[y][c] = board[y - 1][c];
                }
            }
            //the top row board[0][..] has no row above it
            for(c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            //increment the score
            score += 10;
        }
    }
    //update the board
    drawBoard();
    //update the score
    scoreElement.innerHTML= score;
}

//collision function

Piece.prototype.collision = function(x, y, piece){
    for(r = 0; r < piece.length; r++){
        for (c = 0; c < piece.length; c++){
            //if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            //coordinates of the piece after movement
            let newX = this.x + c + x ;
            let newY = this.y + r + y ;

            //condition
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            //skip newY; board[-1] will crash the game
            if(newY < 0){
                continue;
            }
            //check if there is a locked piece already in a place
            if(board[newY][newX] !== VACANT){
                return true;
            }
        }
    }
    return false;
}

//CONTROL the piece
document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode === 37){
        p.moveLeft()

    }else if(event.keyCode === 38 || event.keyCode === 32){
        p.rotate();

    }else if(event.keyCode === 39){
        p.moveRight();

    }else if(event.keyCode === 40){
        p.moveDown();
    }
}
//drop the pieces every 1sec
let dropStart = Date.now();
let gameOver = false;
function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000) {
        p.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}
drop();

// function test() {
//     let name = document.getElementById("name").value
//     let point = document.getElementById("point").value
//     localStorage.setItem("name" + localStorage.length, name)
//     localStorage.setItem("point" + (localStorage.length - 1), point)
// }
//
// function display() {
//     for (let i = 0; i < localStorage.length; i += 2) {
//         document.write(localStorage.getItem("name" + i) + ": " + localStorage.getItem("point" + i) + "<br>")
//         document.write("<br>")
//     }
// }

// window.addEventListener("click", musicPlay);
//
// function musicPlay() {
//     document.getElementById("music").play();
//     window.removeEventListener("click",musicPlay);
// }
function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}