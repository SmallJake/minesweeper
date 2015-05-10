coveredSquare = "images\\square-large.png"
flagSquare = "images\\flag-large.png"
mineSquare = "images\\mine.png"

const MINWIDTH = 700
const MINSIZE = 20

var mySize

var myRows
var myCols
var myDiff

var myFirstClick
var myGoal

var myTimerStartStop

var myTimer

myBoard = []

//Logical representation of a board square
function Square(){
	this.isMine = false
	this.isFlagged = false
	this.isRevealed = false
	this.adjacentMines = 0
}

//Represents a location on the playing field
function Point(r, c){
	this.row = r
	this.col = c
}

// Holds a time
function Timer(){
	this.seconds = 0
	this.minutes = 0
	this.hours = 0
}

//Displays a timer in the form m:ss, or h:mm:ss, if large enough
Timer.prototype.toString = function(){
	var timeString = myTimer.seconds.toString()
	if (timeString.length == 1)
		timeString = "0" + timeString
	timeString = myTimer.minutes.toString() + ":" + timeString
	if (myTimer.hours != 0){
		if (timeString.length == 4)
			timeString = "0" + timeString
		timeString = myTimer.hours.toString() + ":" + timeString
	}
	return timeString
}

//Shows the menu by setting it visible
function showMenu(){
	document.getElementById("field").innerHTML = ""
	document.getElementById("result").style.display="none"
	document.getElementById("menu").style.display = "block"
	document.getElementById("options").style.display = "none"
	window.clearInterval(myTimerStartStop)
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

//Initializes the board & draws the field
function startGame(){
	document.getElementById("menu").style.display = "none"
	document.getElementById("result").style.display="none"
	mySize = Math.max(MINSIZE, MINWIDTH/Math.max(myCols, myRows))
	document.getElementById("field").style.width = mySize * myCols
	
	document.getElementById("options").style.width = Math.min(MINWIDTH, mySize * myCols)
	document.getElementById("options").style.display = "block"

	myTimer = new Timer()
	document.getElementById("timer").innerHTML = "0:00"

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

//Draws all the squares of the field
function drawField(){
	var field = ""
	for (var i = 0; i < myRows; i++){
		for (var j = 0; j < myCols; j++){
			field += "<img id =\"" + i + " " + j + "\" onclick=\"handleClick(new Point(" + i + "," + j + "))\" src=" + coveredSquare + " width = \"" + mySize + "\" height = \"" + mySize + "\">"
		}
		field += "<br>\n"
	}
	document.getElementById("field").innerHTML = field
}

// Randomly places mines on the board, excluding the given square
function layMines(point){
	var squaresLeft = myRows * myCols
	var totalMines = Math.floor(squaresLeft * myDiff)
	myGoal = squaresLeft - totalMines
	var mines = 0
	squaresLeft--
	for (var r = 0; r < myRows; r++){
		for (var c = 0; c < myCols; c++){
			if (r == point.row && c == point.col)
				continue
			chance = (totalMines - mines)/squaresLeft
			squaresLeft--
			if (Math.random() < chance){
				myBoard[r][c].isMine = true
				mines++
				applyAround(new Point(r, c), increaseMineCount)
			}
		}
	}
}

//Takes a point & a function which can be applied to a point, & applies that function to every point adjacent to the given point
function applyAround(point, func){
	var minRow = Math.max(point.row - 1, 0)
	var maxRow = Math.min(point.row + 1, myRows - 1)
	var minCol = Math.max(point.col - 1, 0)
	var maxCol = Math.min(point.col + 1, myCols - 1)
	for (var m = minRow; m <= maxRow; m++){
		for (var n = minCol; n <= maxCol; n++) {
			if (!(m == point.row && n == point.col))
				func(new Point(m, n))
		}
	}
}

//Adds one to a square's adjacent mine count.
function increaseMineCount(point){
	myBoard[point.row][point.col].adjacentMines = myBoard[point.row][point.col].adjacentMines + 1
}

//Called whenever a covered square is clicked, takes an object with the coordinates of the clicked square
function handleClick(point) {
	if(event.ctrlKey){
		var square = myBoard[point.row][point.col]
		square.isFlagged = !square.isFlagged
		document.getElementById(point.row + " " + point.col).src = square.isFlagged ? flagSquare : coveredSquare
	}
	else {
		if (myFirstClick) {
			firstClick(point)
		}
		reveal(point)
	}
}

//Called until the first non-ctrl-click, takes an object with the coordinates of the clicked square
//Toggles whether a square has a flag on ctrl-click
//On a regular click distributes mines across the board, making sure the given square is not a mine
//This function ensures that a player does not lose on their first click, since that would seem unfair
function firstClick(point){
	myTimerStartStop = setInterval(tickTock, 1000)
	myFirstClick = false
	layMines(point)
}

//Called for each click of an uncovered square, takes an object with the coordinates of the clicked square
//Toggles whether a square has a flag on ctrl-click
//On a regular click uncovers a square
function reveal(point) {
	var square = myBoard[point.row][point.col]
	if (!square.isFlagged){
		if (!square.isRevealed){
			square.isRevealed = true

			var boardPiece = document.getElementById(point.row + " " + point.col)
			var adj = square.adjacentMines

			if (square.isMine){
				boardPiece.src = mineSquare
				gameover()
			}
			else{
				boardPiece.src = "images\\" + adj + ".png"
				if (adj == 0)
					applyAround(point, reveal)
				boardPiece.onclick = null
				myGoal--
				if (myGoal == 0)
					win()
			}
		}
	}
}

//Called once a second during gameplay
function tickTock(){
	addSecond(myTimer)
	document.getElementById("timer").innerHTML = myTimer.toString()
}

//Adds a second to the timer, taking care of wraparound
function addSecond(timer){
	timer.seconds++
	if (timer.seconds >= 60) {
		timer.seconds -= 60
		timer.minutes++
		if (timer.minutes >= 60) {
			timer.minutes -= 60
			timer.hours++
		}
	}
}

//Disables all the square on the field so that they cannot be clicked on
function disableButtons(){
	for (var i = 0; i < myRows; i++){
		for (var j = 0; j < myCols; j++){
			document.getElementById(i + " " + j).onclick = null
		}
	}
}

//Stops the timer, disables the board, & shows the result screen
function endgame(){
	window.clearInterval(myTimerStartStop)
	disableButtons()
	document.getElementById("result").style.display = "block"
}

//Informs the player they lost
function gameover(){
	document.getElementById("resulthead").innerHTML = "Too bad!"
	document.getElementById("resultbody").innerHTML = "You lose."
	revealMines()
	endgame()
}

function revealMines(){
	for (var i = 0; i < myRows; i++){
		for (var j = 0; j < myCols; j++){
			if (myBoard[i][j].isMine)
				document.getElementById(i + " " + j).src = mineSquare
		}
	}
}

//Informs the player they won
function win(){
	document.getElementById("resulthead").innerHTML = "Congratulations!"
	document.getElementById("resultbody").innerHTML = "You won in " + myTimer.toString() + "."
	endgame()
}