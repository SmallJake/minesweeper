coveredSquare = "images\\square-large.png"
flagSquare = "images\\flag-large.png"

const EASY = 0.1
const MID = 0.2
const HARD = 0.3

minWidth = 500
size = 20

rows = 0
cols = 0
diff = EASY

first = true

board = []

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

//Triggered 
function submit(){
	cont = true
	rows = document.getElementById("rows").value
	if (isNaN(rows) || rows < 1) {
		document.getElementById("rowWarn").style.visibility = "visible"
		cont = false
	}
	else {
		document.getElementById("rowWarn").style.visibility = "hidden"
	}

	cols = document.getElementById("cols").value
	if (isNaN(cols) || cols < 1) {
		document.getElementById("colWarn").style.visibility = "visible"
		cont = false
	}
	else {
		document.getElementById("colWarn").style.visibility = "hidden"
	}
	diffRadio = document.forms[0]
	diff = EASY
	for (i = 1; i < 3; i++) {
		if (diffRadio[i].checked)
			diff = diffRadio[i].value
	}
	if (cont)
		startGame()
}

function startGame(){
	document.getElementById("menu").style.display = "none"
	size = Math.max(size, minWidth/cols)
	document.getElementById("field").style.width = size * cols + 10

	for (i = 0; i < rows; i++){
		row = []
		for (j = 0; j < cols; j++){
			row[j] = new Square()
		}
		board[i] = row
	}

	first = true
	drawField()
}

function layMines(point){
	squaresLeft = rows * cols
	totalMines = squaresLeft * diff
	mines = 0
	squaresLeft--
	for (r = 0; r < rows; r++){
		for (c = 0; c < cols; c++){
			if (r == point.row && c == point.col)
				continue
			chance = (totalMines - mines)/squaresLeft
			squaresLeft--
			if (Math.random() < chance){
				board[r][c].isMine = true
				mines++
				minRow = Math.max(r - 1, 0)
				maxRow = Math.min(r + 2, rows)
				minCol = Math.max(c - 1, 0)
				maxCol = Math.min(c + 2, cols)
				for (m = minRow; m < maxRow; m++)
					for (n = minCol; n < maxCol; n++)
						board[m][n].adjacentMines = board[m][n].adjacentMines + 1
			}
		}
	}
}

function drawField(){
	field = ""
	for (i = 0; i < rows; i++){
		for (j = 0; j < cols; j++){
			field += imgTag(i, j)
		}
		field += "<br>\n"
	}
	document.getElementById("field").innerHTML = field
}



function imgTag(row, col){
	funcStr = "\"handleClick({row:" + row + ", col:" + col + "})\""
	tag = "<img id =\"" + row + " " + col + "\" onclick=\"handleClick({row:" + row + ", col:" + col + "})\" src=" + coveredSquare + " width = \"" + size + "\" height = \"" + size + "\">"
	return tag
}

function firstClick(point){
	if(event.ctrlKey){
		square = board[point.row][point.col]
		square.isFlagged = !square.isFlagged
		document.getElementById(point.row + " " + point.col).src = square.isFlagged ? flagSquare : coveredSquare
	}
	else {
		layMines(point)
		otherClick(point)
	}
}

function otherClick(point) {
	square = board[point.row][point.col]
	if(event.ctrlKey){
		square.isFlagged = !square.isFlagged
		document.getElementById(point.row + " " + point.col).src = square.isFlagged ? flagSquare : coveredSquare
	}
	else {
		if (!square.isFlagged){
			boardPiece = document.getElementById(point.row + " " + point.col)
			boardPiece.src = "images\\" + square.adjacentMines + ".png"
			boardPiece.onclick = ""
		}
	}

}

function handleClick(point) {
	if (first) {
		firstClick(point)
		first = false
	}
	else {
		otherClick(point)
	}
}

showMenu()