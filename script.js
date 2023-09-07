const canvas = createCanvas(500, 600, 10, ['#421', '#fa3']);
const buttons = createButtons();
let state = Array.from({ length: canvas.rowCount }, () => Array(canvas.columnCount).fill(0));
let timer, pause
let history = [];

state[1][1] = 1;
state[1][2] = 1;
state[1][3] = 1;

document.body.append(canvas, buttons);

render();
simulateLife();

canvas.onclick = handleClick;
document.onkeydown = handleSpace;
buttons.firstChild.onclick = rewind;
buttons.lastChild.onclick = generateNext;

function createCanvas(width, height, cellSize, colors) {
  const canvas = document.createElement('canvas');

  canvas.ctx = canvas.getContext('2d');
  canvas.cellSize = cellSize;
  canvas.colors = colors;
  canvas.width = width;
  canvas.height = height;
  canvas.rowCount = height / cellSize;
  canvas.columnCount = width / cellSize;

  return canvas;
}

function handleSpace(e) {
  if (e.code == 'Space') {
    if (pause) {
      simulateLife();
    } else {
      stop();
    }
    pause = !pause;
  }
}

function handleClick(e) {
  let { offsetX: x, offsetY: y } = e;
  let columnIndex = Math.floor(x / canvas.cellSize);
  let rowIndex = Math.floor(y / canvas.cellSize);
  state[rowIndex][columnIndex] = +!state[rowIndex][columnIndex];
  render()
}

function render() {
  let { rowCount, columnCount } = canvas;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      drawCell(rowIndex, columnIndex)
    }
  }
}

function drawCell(rowIndex, columnIndex) {
  let x = columnIndex * canvas.cellSize;
  let y = rowIndex * canvas.cellSize;
  let color = canvas.colors[state[rowIndex][columnIndex]]
  drawSquare(x, y, canvas.cellSize, color)
}

function drawSquare(x, y, size, color) {
  canvas.ctx.fillStyle = color;
  canvas.ctx.fillRect(x, y, size, size)
}

function simulateLife() {
  buttons.hidden = true;

  timer = setInterval(generateNext, 200);
}

function stop() {
  buttons.hidden = false;
  clearInterval(timer);
}

function calcNextState() {
  let nextState = [];

  for (let rowIndex in state) {
    let row = state[rowIndex];

    let newRow = []

    for (let cellIndex in row) {
      newRow.push(calcNextCellState(rowIndex, cellIndex))

    }
    nextState.push(newRow);
  }
  return nextState;
}

function calcNextCellState(rowIndex, cellIndex) {

  let t = (+rowIndex - 1 + canvas.rowCount) % canvas.rowCount;
  let l = (+cellIndex - 1 + canvas.columnCount) % canvas.columnCount;
  let b = (+rowIndex + 1) % canvas.rowCount;
  let r = (+cellIndex + 1) % canvas.columnCount;

  let neighborCount = state[rowIndex][cellIndex] * 10 + state[rowIndex][r] + state[rowIndex][l] + state[b][cellIndex] + state[t][cellIndex] + state[t][l] + state[t][r] + state[b][l] + state[b][r];

  return +[3, 12, 13].includes(neighborCount);
  // return ( neighborCount == 3 || neighborCount == 12 || neighborCount == 13  )
}

function createButtons() {
  let div = document.createElement('div');
  let prevBtn = document.createElement('button');
  let nextBtn = document.createElement('button');

  prevBtn.innerText = 'Last generation';
  nextBtn.innerText = 'Next generation';
  div.className = 'buttons'

  div.append(prevBtn, nextBtn);

  return div;
}

function rewind() {
  state = history.shift();
  render();
}

function generateNext() {
  history.unshift(state);
  history.length = 100;
  state = calcNextState();
  render();
}