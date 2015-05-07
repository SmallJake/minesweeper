openSquare = "images\\square-large.png"
flagSquare = "images\\flag-large.png"

const EASY = 0.1
const MID = 0.2
const HARD = 0.3

minWidth = 500
size = 20

rows = 0
cols = 0
diff = EASY

board = []

function Square(){
	this.isMine = false
	this.isFlagged = false
	this.isRevealed = false
	this.adjacent = 0
}

function showMenu(){
	document.getElementById("menu").style.display = "block"
}

function submit(){
	rows = document.getElementById("rows").value
	cols = document.getElementById("cols").value
	diffRadio = document.forms[0]
	diff = EASY
	for (i = 1; i < 3; i++) {
		if (diffRadio[i].checked)
			diff = diffRadio[i].value
	}
	startGame()
}

function startGame(){
	document.getElementById("menu").style.display = "none"
	size = Math.max(size, minWidth/cols)
	document.getElementById("field").style.width = size * cols + 10
	drawField(firstClick)
}

function layMines(point){
	squaresLeft = rows * cols
	totalMines = squaresLeft * diff
	mines = 0
	squaresLeft--
	for (i = 0; i < rows; i++){
		row = []
		for (j = 0; j < cols; j++){
			if (i == point.row && j == point.col)
				continue
			row[j] = new Square()
			chance = (totalMines - mines)/squaresLeft
			if (Math.random() < chance){
				row[j].isMine = true
				mines++
			}
			squaresLeft--
		}
		board[i] = row
	}
}

function drawField(clickFunc){
	field = ""
	for (i = 0; i < rows; i++){
		for (j = 0; j < cols; j++){
			field += imgTag(i, j, clickFunc)
		}
		field += "<br>\n"
	}
	document.getElementById("field").innerHTML = field
}



function imgTag(row, col, clickFunc){
	funcStr = "\"" + clickFunc.name + "({row:" + row + ", col:" + col + "})\""
	tag = "<img id =\"" + row + " " + col + "\" onclick=" + funcStr + " src=" + openSquare + " width = \"" + size + "\" height = \"" + size + "\">"
	return tag
}

function firstClick(point){
	confirm("first")
	layMines(point)
	drawField(clicked)
}

function clicked(point) {
	if(event.ctrlKey){
		board[point.row][point.col].isFlagged = !board[point.row][point.col].isFlagged
		document.getElementById(point.row + " " + point.col).src = board[point.row][point.col].isFlagged ? flagSquare : openSquare
	}
	else {
	}
}

showMenu()