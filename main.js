const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score")
const  ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 40;
const VACANT = "WHITE" //màu của ô trống

//vẽ khối vuông
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    strokeStyle = "BLACK";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

//tạo bảng

let board =[];
for(r = 0; r < ROW; r++){
    board[r] = [];
    for (c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

//vẽ bảng
function drawBoard(){
    for(r = 0; r < ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c, r, board[r][c]);
        }
    }
}
drawBoard();

//Vẽ khối và màu của khối

const PIECES = [
    [S,"yellow"],
    [Z,"red"],
    [T,"blue"],
    [O,"green"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];
// random các mảnh
function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece(PIECES[r][0], PIECES[r][1])
}
// bắt đầu mảnh mới

let p = randomPiece();

//vẽ đối tượng hình khối

function Piece(tetromino, color){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0 // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN]

    //điều khiển các hình khối
    this.x = 3;
    this.y = -2;
}
// điền chức năng

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
//vẽ khối lên bảng

Piece.prototype.draw = function(){
    this.fill(this.color);
}
//mở 1 mảnh

Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

//di chuyển mảnh xuống dưới

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        //khóa và tạo ra mảnh mới
        this.lock();
        p = randomPiece();
    }
}

//di chuyển mảnh sang phải

Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

//di chuyển mảnh sang trái
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}
//điều khiển xoay mảnh
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
            //bỏ qua các ô trống
            if(!this.activeTetromino[r][c]){
                continue;
            }
            console.log(this.y + r)
            //pieces to lock on top = game over
            if(this.y + r < 0){
                // alert("Game Over");
                // yêu cầu dừng khung hình
                openForm();
                gameOver = true;
                break;
            }
            //khóa mảng
            board[this.y + r][this.x + c] = this.color;
        }
    }
    //loại bỏ các hàng đầy đủ
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
    //cập nhật bảng
    drawBoard();
    //cập nhật điểm
    scoreElement.innerHTML= score;
}

//chức năng khi va chạm

Piece.prototype.collision = function(x, y, piece){
    for(r = 0; r < piece.length; r++){
        for (c = 0; c < piece.length; c++){
            //nếu hình khối trống, bỏ qua nó
            if(!piece[r][c]){
                continue;
            }
            //tọa độ của mảnh sau khi chuyển động
            let newX = this.x + c + x ;
            let newY = this.y + r + y ;

            //điều kiện
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

//Kiểm soát mảnh
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
//các mảnh rơi sau 1sec
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