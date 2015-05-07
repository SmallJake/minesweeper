coveredSquare = "images\\square-large.png"
flagSquare = "images\\flag-large.png"
mineSquare = "images\\mine.png"

const EASY = 0.1
const MID = 0.2
const HARD = 0.3

const MIDWIDTH = 500
const MINSIZE = 20

mySize = 0

myRows = 0
myCols = 0
myDiff = EASY

myFirstClick = true

myBoard = []

//Logical representation of a board square
function Square(){
	this.isMine = false
	this.isFlagged = false
	this.isRevealed = false
	this.adjacentMines = 0
}

//Shows the menu by setting it visible
function showMenu(){
	document.getElementById("menu").style.display = "block"
}

//Triggered when the player hits the start game button
//Checks their input & starts the game
function submit(){
	var cont = true

	myRows = document.getElementById("rows").value
	if (isNaN(myRows) || myRows < 1) {
		document.getElementById("rowWarn").style.visibility = "visible"
		cont = false
	}
	else {
		document.getElementById("rowWarn").style.visibility = "hidden"
	}

	myCols = document.getElementById("cols").value
	if (isNaN(myCols) || myCols < 1) {
		document.getElementById("colWarn").style.visibility = "visible"
		cont = false
	}
	else {
		document.getElementById("colWarn").style.visibility = "hidden"
	}

	var diffRadio = document.getElementsByName("difficulty")
	for (var i = 0; i < 3; i++) {
		if (diffRadio[i].checked){
			myDiff = diffRadio[i].value
			break
		}
	}

	if (cont)
		startGame()
}

//Initiates the board & draws the field
function startGame(){
	document.getElementById("menu").style.display = "none"
	mySize = Math.max(MINSIZE, MIDWIDTH/myCols)
	document.getElementById("field").style.width = mySize * myCols + 10

	for (var i = 0; i < myRows; i++){
		var row = []
		for (var j = 0; j < myCols; j++){
			row[j] = new Square()
		}
		myBoard[i] = row
	}

	myFirstClick = true
	drawField()
}

//Draws all the squares
function drawField(){
	var field = ""
	for (var i = 0; i < myRows; i++){
		for (var j = 0; j < myCols; j++){
			field += "<img id =\"" + i + " " + j + "\" onclick=\"handleClick(" + i + "," + j + ")\" src=" + coveredSquare + " width = \"" + mySize + "\" height = \"" + mySize + "\">"
		}
		field += "<br>\n"
	}
	document.getElementById("field").innerHTML = field
}

// Randomly places mines on the board, excluding the given square
function layMines(row, col){
	var squaresLeft = myRows * myCols
	var totalMines = squaresLeft * myDiff
	var mines = 0
	squaresLeft--
	for (var r = 0; r < myRows; r++){
		for (var c = 0; c < myCols; c++){
			if (r == row && c == col)
				continue
			chance = (totalMines - mines)/squaresLeft
			squaresLeft--
			if (Math.random() < chance){
				myBoard[r][c].isMine = true
				mines++
				applyAround(r, c, increaseMineCount)
			}
		}
	}
}

function applyAround(row, col, func){
	var minRow = Math.max(row - 1, 0)
	var maxRow = Math.min(row + 1, myRows - 1)
	var minCol = Math.max(col - 1, 0)
	var maxCol = Math.min(col + 1, myCols - 1)
	for (var m = minRow; m <= maxRow; m++){
		for (var n = minCol; n <= maxCol; n++) {
			var x = m
			var y = n
			if (!(m == row && n == col))
				func(m, n)
		}
	}
}

function increaseMineCount(row, col){
	myBoard[row][col].adjacentMines++
}

//Called whenever a covered square is clicked, takes an object with the coordinates of the clicked square
function handleClick(row, col) {
	if (myFirstClick) {
		firstClick(row, col)
	}
	else {
		otherClick(row, col)
	}
}

//Called until the first non-ctrl-click, takes an object with the coordinates of the clicked square
//Toggles whether a square has a flag on ctrl-click
//On a regular click distributes mines across the board, making sure the given square is not a mine
//This function ensures that a player does not lose on their first click, since that would seem unfair
function firstClick(row, col){
	if(event.ctrlKey){
		var square = myBoard[row][col]
		square.isFlagged = !square.isFlagged
		document.getElementById(row + " " + col).src = square.isFlagged ? flagSquare : coveredSquare
	}
	else {
		myFirstClick = false
		layMines(row, col)
		otherClick(row, col)
	}
}

//Called for each click of an uncovered square, takes an object with the coordinates of the clicked square
//Toggles whether a square has a flag on ctrl-click
//On a regular click uncovers a square
function otherClick(row, col) {
	var square = myBoard[row][col]
	if(event.ctrlKey){
		square.isFlagged = !square.isFlagged
		document.getElementById(row + " " + col).src = square.isFlagged ? flagSquare : coveredSquare
	}
	else {
		if (!square.isFlagged){
			reveal(row, col)
		}
	}
}

function reveal(row, col) {
	var square = myBoard[row][col]
	if (!square.isRevealed){
		square.isRevealed = true

		var boardPiece = document.getElementById(row + " " + col)
		var adj = square.adjacentMines

		if (square.isMine){
			boardPiece.src = mineSquare
		}
		else{
			boardPiece.src = "images\\" + adj + ".png"
		}

		if (adj == 0)
			applyAround(row, col, reveal)

		boardPiece.onclick = null
	}
}

showMenu()