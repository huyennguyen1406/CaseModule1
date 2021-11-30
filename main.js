const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score")
const  ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 40;
const VACANT = "WHITE" //mau o trong

//ve khoi vuong
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    strokeStyle = "BLACK";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

//tao bang
let board =[];
for(r = 0; r < ROW; r++){
    board[r] = [];
    for (c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

//ve bang
function drawBoard(){
    for(r = 0; r < ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c, r, board[r][c]);
        }
    }
}

drawBoard();

//Ve khoi & mau cua khoi
const PIECES = [
    [S,"yellow"],
    [Z,"red"],
    [T,"blue"],
    [O,"green"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];
// random các manh
function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece(PIECES[r][0], PIECES[r][1])
}
// bat dau manh moi

let p = randomPiece();

//ve doi tuong hinh khoi
function Piece(tetromino, color){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0 // bat dau manh dau tien
    this.activeTetromino = this.tetromino[this.tetrominoN]

    //dieu khien cac hinh khoi
    this.x = 3;
    this.y = -2;
}

// dien chuc nang
Piece.prototype.fill = function(color){
    for(r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length;c++){
            //vẽ các khối vuông bị chiếm
            if(this.activeTetromino[r][c]){
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

//ve khoi len bang
Piece.prototype.draw = function(){
    this.fill(this.color);
}

//mo 1 manh
Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

//di chuyen manh xuong duoi
Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        //khoa va tao manh moi
        this.lock();
        p = randomPiece();
    }
}

//di chuyen manh sang phai
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

//di chuyen manh sang phai
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

//dieu khien xoay manh
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[((this.tetrominoN + 1) % this.tetromino.length)]
    let kick = 0;

    if(this.collision(0,0, nextPattern))
        if(this.x > COL/2){
            //nếu gặp tường bên phải
            kick = -1;//cần di chuyển mảnh sang trái
        }else{
            //it's the left wall
            kick = 1;//we need to move the piece to the right
        }
    if(!this.collision(kick,0, nextPattern)) {
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
            //bo qua o trong
            if(!this.activeTetromino[r][c]){
                continue;
            }
            console.log(this.y + r)
            //pieces to lock on top = game over
            if(this.y + r < 0){
                // alert("Game Over");
                // yeu cau dung khung hinh
                openForm();
                gameOver = true;
                break;
            }
            //khoa mang
            board[this.y + r][this.x + c] = this.color;
        }
    }

    //loai bo cac hang day du
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for(c = 0 ; c < COL;c++){
            isRowFull = isRowFull && (board[r][c] !== VACANT)
        }
        if(isRowFull){
            //khi hàng đầy
            // di chuyển xuống tất cả các hàng phía trên nó
            for(y = r; y > 1; y--){
                for(c = 0; c < COL; c++){
                    board[y][c] = board[y - 1][c];
                }
            }
            //bảng hàng trên cùng [0][..] không có hàng nào phía trên
            for(c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            //cộng điểm
            score += 10;
        }
    }
    //cap nhat bang
    drawBoard();
    //cap nhat diem
    scoreElement.innerHTML= score;
}

//chuc nang va cham
Piece.prototype.collision = function(x, y, piece){
    for(r = 0; r < piece.length; r++){
        for (c = 0; c < piece.length; c++){
            //neu hinh khoi trong, bo qua no
            if(!piece[r][c]){
                continue;
            }
            //toa do cac mang sau chuyen dong
            let newX = this.x + c + x ;
            let newY = this.y + r + y ;

            //dieu kien
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            //bỏ qua newY[-1], trò chơi sụp đổ
            if(newY < 0){
                continue;
            }
            //kiểm tra xem có một mảnh bị khóa ở một nơi không
            if(board[newY][newX] !== VACANT){
                return true;
            }
        }
    }
    return false;
}

//Kiem soat mang
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
//cac manh roi sau 1sec
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
//add music
window.addEventListener("click", musicPlay);

function musicPlay() {
    document.getElementById("music").play();
    window.removeEventListener("click",musicPlay);
}

function openForm() {
    document.getElementById("myForm").style.display = "block";
}
function closeForm() {
    document.getElementById("myForm").style.display = "none";
}