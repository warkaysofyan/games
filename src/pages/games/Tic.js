import { useEffect, useState } from 'react'
import { fabric } from 'fabric'

let canvasOptions = {
	height: 300,
	width: 300,
	hoverCursor: 'pointer',
	selection: false,
	targetFindTolerance: 2,
	willReadFrequently: true,
	name: 'canvas',
}
let line = (X, W) => {
	return new fabric.Line([...X], {
		stroke: '#C06B21',
		strokeWidth: W,
		strokeLineCap: 'round',
		name: 'lines',
		selectable: false,
	})
}
let lines = [
	line([200, 0, 200, 300], 10),
	line([100, 0, 100, 300], 10),
	line([0, 100, 300, 100], 10),
	line([0, 200, 300, 200], 10),
]

let winnerLines = {
	line012: line([50, 50, 250, 50], 10),
	line345: line([50, 150, 250, 150], 10),
	line678: line([50, 250, 250, 250], 10),
	line036: line([50, 50, 50, 250], 10),
	line147: line([150, 50, 150, 250], 10),
	line258: line([250, 50, 250, 250], 10),
	line048: line([50, 50, 250, 250], 10),
	line246: line([250, 50, 50, 250], 10),
}

let back = new fabric.Rect({
	selectable: false,
	fill: 'transparent',
	height: 100,
	width: 100,
	name: 'back',
})

let Symbol = (S, mainObj) => {
	if (S === 'O') {
		return new fabric.Circle({
			originX: 'center',
			originY: 'center',
			radius: 23,
			fill: 'transparent',
			left: mainObj.left + 55,
			top: mainObj.top + 55,
			stroke: 'black',
			strokeWidth: 6,
			name: 'O',
		})
	} else if (S === 'X') {
		let lineA = line([5, 0, 40, 45], 6)
		let lineB = line([5, 45, 40, 0], 6)
		lineA.stroke = 'black'
		lineB.stroke = 'black'
		return new fabric.Group([lineA, lineB], {
			originX: 'center',
			originY: 'center',
			height: 45,
			width: 45,
			left: mainObj.left + 55,
			top: mainObj.top + 55,
			name: 'X',
		})
	}
}

let addAndUp = (mainObj, addObj) => {
	mainObj.addWithUpdate(addObj)
}

let BlankBox = (T, L, I) => {
	return new fabric.Group([back], {
		selectable: false,
		height: 100,
		width: 100,
		top: T,
		left: L,
		name: ['cell', `cell${I}`],
	})
}

function isBordFull(a) {
	let K
	a.find(e => typeof e === 'number') === undefined ? (K = true) : (K = false)
	return K
}

let blanks = [
	BlankBox(0, 0, 0),
	BlankBox(0, 100, 1),
	BlankBox(0, 200, 2),
	BlankBox(100, 0, 3),
	BlankBox(100, 100, 4),
	BlankBox(100, 200, 5),
	BlankBox(200, 0, 6),
	BlankBox(200, 100, 7),
	BlankBox(200, 200, 8),
]

export default function Tic() {
	let [turn, setTurn] = useState(true)
	let [aiPlayer, setAiPlayer] = useState({
		player: 'computer',
		symbol: 'O',
	})

	let checkWinner = arr => {
		let result = { winner: null, row: null }
		let rows = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		]

		console.log('this tis the arr: ', arr)
		rows.forEach((el, i) => {
			if (arr[el[0]] === arr[el[1]] && arr[el[1]] === arr[el[2]]) {
				result = { winner: arr[el[0]], isTie: false, row: rows[i] }
			}
		})
		if (isBordFull(arr) && !result[0]) {
			//result = [false, '', true, 'tie', 'tie']
			result = { winner: 'Tie', row: null }
		}
		return result
	}
	function getBoard() {
		let board = []

		blanks.forEach((el, i) => {
			if (el._objects[1]) {
				if (el._objects[1].name === aiPlayer.symbol) {
					board.push('aiPlayer')
				} else {
					board.push('huPlayer')
				}
			} else {
				board.push(i)
			}
		})
		return board
	}

	useEffect(() => {
		document.getElementById('whoPlaying').addEventListener('change', e => {
			aiPlayer.player = e.target.value
			setAiPlayer(aiPlayer)
		})
		// the best move of the ai

		let getNewBoard = arr => {
			return [
				[arr[0], arr[1], arr[2]],
				[arr[3], arr[4], arr[5]],
				[arr[6], arr[7], arr[8]],
			]
		}
		function checkWin(board) {
			let winner = null
			function equals3(a, b, c) {
				return a === b && b === c && a !== ''
			}
			// horizontal
			for (let i = 0; i < 3; i++) {
				if (equals3(board[i][0], board[i][1], board[i][2])) {
					winner = board[i][0]
				}
			}

			// Vertical
			for (let i = 0; i < 3; i++) {
				if (equals3(board[0][i], board[1][i], board[2][i])) {
					winner = board[0][i]
				}
			}

			// Diagonal
			if (equals3(board[0][0], board[1][1], board[2][2])) {
				winner = board[0][0]
			}
			if (equals3(board[2][0], board[1][1], board[0][2])) {
				winner = board[2][0]
			}

			let openSpots = 0
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (typeof board[i][j] === 'number') {
						openSpots++
					}
				}
			}

			if (winner === null && openSpots === 0) {
				return 'tie'
			} else {
				return winner
			}
		}

		const makeTheBestAiMove = (arr, sym) => {
			//console.log(arr)
			let bestMove
			let bestScore = -Infinity
			let board = getNewBoard(arr)

			/*for (let i = 0; i < board.length; i++) {
				if (typeof board[i] === 'number') {
					board[i] = 'aiPlayer'
					let score = minmax(board, 0, false)
					board[i] = i
					if (score > bestScore) {
						bestMove = i
						bestScore = score
					}
				}
			}*/
			let move
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					// Is the spot available?
					//move++
					//console.log(board)
					if (typeof board[i][j] === 'number') {
						move = board[i][j]
						board[i][j] = 'aiPlayer'
						let score = minmax(board, 0, false)
						board[i][j] = move
						if (score > bestScore) {
							bestScore = score
							bestMove = move
						}
					}
				}
			}
			console.log(bestScore)

			console.log(checkWin(board))

			if (bestMove !== undefined) {
				console.log('best move :', bestMove)
				blanks[bestMove].addWithUpdate(Symbol(sym, blanks[bestMove]))
			}
			canvas.renderAll()
			// eslint-disable-next-line
			turn = !turn
			setTurn(turn)
			console.log(checkWinner(board))
			let secBoard = getBoard()
			if (checkWinner(secBoard).row !== null) {
				showWinner(checkWinner(secBoard).row)
			}
		}
		let scores = {
			aiPlayer: 10,
			huPlayer: -10,
			tie: 0,
		}
		const minmax = (board, depth, isMax) => {
			//let result = checkWinner(board)
			let result = checkWin(board)
			//console.log(result)
			if (result !== null) {
				return scores[result]
			}

			if (isMax) {
				let bestScore = -Infinity
				let move
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						// Is the spot available?
						//move++
						if (typeof board[i][j] === 'number') {
							move = board[i][j]

							board[i][j] = 'aiPlayer'
							let score = minmax(board, 0, false)
							board[i][j] = move
							bestScore = Math.max(score, bestScore)
						}
					}
				}
				return bestScore
			} else {
				let bestScore = Infinity
				let move
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						// Is the spot available?
						//move++
						if (typeof board[i][j] === 'number') {
							move = board[i][j]
							board[i][j] = 'huPlayer'
							let score = minmax(board, 0, true)
							board[i][j] = move
							bestScore = Math.min(score, bestScore)
						}
					}
				}
				return bestScore
			}
		}

		let canvas = new fabric.Canvas('canvas', canvasOptions)

		function showWinner(W) {
			blanks.forEach(el => {
				el.set('opacity', '0.5')
			})
			W.forEach(w => {
				blanks[w].set('opacity', '1')
			})
			let N = W.join().replace(',', '').replace(',', '')
			let L = `line${N}`
			let liner = winnerLines[L]
			liner.set('stroke', 'green')
			canvas.add(winnerLines[L])
		}

		const restart = () => {
			document.getElementById('whoPlaying').disabled = false
			document.getElementById('compPlay').disabled = false
			blanks.forEach(el => {
				el.remove(el._objects[1])
				canvas.add(el)
				canvas.renderAll()
			})
			for (let i in winnerLines) {
				canvas.remove(winnerLines[i])
			}
			blanks.forEach(el => {
				el.set('opacity', '1')
			})
		}
		blanks.forEach(el => {
			canvas.add(el)
			canvas.renderAll()
		})
		lines.forEach(el => {
			canvas.add(el)
			canvas.renderAll()
		})

		canvas.renderAll()

		function addSymbol(S, tar) {
			document.getElementById('whoPlaying').disabled = true
			document.getElementById('compPlay').disabled = true

			addAndUp(tar, Symbol(S, tar))
			canvas.renderAll()
			turn = !turn
			setTurn(turn)
			let board = getBoard()

			if (
				checkWinner(board).winner !== null &&
				checkWinner(board).winner !== 'Tie'
			) {
				showWinner(checkWinner(board).row)
			} else {
				if (aiPlayer.player === 'computer') {
					makeTheBestAiMove(board, aiPlayer.symbol)
				}
			}
		}

		canvas.on('mouse:up', function (e) {
			let tar = e.currentTarget
			let board = getBoard()
			let res = checkWinner(board)
			if (
				tar.name[0] === 'cell' &&
				tar._objects.length <= 1 &&
				res.winner === null
			) {
				if (aiPlayer.player !== 'computer') {
					addSymbol(turn ? 'X' : 'O', tar)
				} else {
					addSymbol(aiPlayer.symbol === 'X' ? 'O' : 'X', tar)
				}
			}
		})

		document.getElementById('compPlay').addEventListener('click', () => {
			let board = [0, 1, 2, 3, 4, 5, 6, 7, 8]
			//aiPlayer.symbol = aiPlayer.symbol === 'X' ? 'O' : 'X'
			aiPlayer.symbol = 'X'
			setAiPlayer(aiPlayer)
			makeTheBestAiMove(board, 'X')
		})
		document.getElementById('restart').addEventListener('click', restart)
	})
	return (
		<div className='tic-canv-container'>
			<div>
				<div>
					<div className='centerFlex'>
						<p>playing with : </p>
						<select id='whoPlaying'>
							<option value='computer'>Computer</option>
							<option value='Friend'>Friend</option>
						</select>
					</div>
					<div className='centerFlex'>
						<p>play or let the </p>
						<button id='compPlay'> Computer play </button>
					</div>
					{/* <p>{turn ? 'X' : 'O'}'s turne</p> */}
				</div>
				<canvas id='canvas' />
				<div className='centerFlex centerFlexLast'>
					<button id='restart' className='restart'>
						Restart
					</button>
				</div>
			</div>
		</div>
	)
}
