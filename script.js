var buttons = [];
var grid = [];
var colors = ["violet", "brown", "lightgreen", "yellow", "orange", "lightblue"];
var topcolor = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
var gridcolor = [];
const solution = document.querySelector('.topgrid');


function generatesquare() {
  for(let i=0; i<5; i++) {
    for(let j=0; j<5; j++) {
      var newColor = colors[Math.floor(Math.random() * colors.length)];
      topcolor[i][j]=newColor;
    }
  }
}

function createSolution() {
  for(let i=0; i<9; i++) {
    topgrid = document.createElement("button");
    solution.appendChild(topgrid);
    grid.push(topgrid);
  }
}
createSolution();

function generateSolution() {
  gridcolor = [];
  let tempcolors=[];
  for(let i=0; i<5; i++) {
    tempcolors.push(...topcolor[i]);
  }
  for (let i=0; i<9; i++) {
    newIndex = Math.floor(Math.random() * tempcolors.length);
    grid[i].style.backgroundColor = tempcolors[newIndex];
    gridcolor.push(tempcolors[newIndex]);
    tempcolors.splice(newIndex, 1);
  }
}


class Box {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getTopBox() {
    if (this.y === 0) return null;
    return new Box(this.x, this.y - 1);
  }

  getRightBox() {
    if (this.x === 4) return null;
    return new Box(this.x + 1, this.y);
  }

  getBottomBox() {
    if (this.y === 4) return null;
    return new Box(this.x, this.y + 1);
  }

  getLeftBox() {
    if (this.x === 0) return null;
    return new Box(this.x - 1, this.y);
  }

  getNextdoorBoxes() {
    return [
      this.getTopBox(),
      this.getRightBox(),
      this.getBottomBox(),
      this.getLeftBox()
    ].filter(box => box !== null);
  }

  getRandomNextdoorBox() {
    const nextdoorBoxes = this.getNextdoorBoxes();
    return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
  }
}

const swapBoxes = (grid, box1, box2) => {
  const temp1 = grid[box1.y][box1.x];
  grid[box1.y][box1.x] = grid[box2.y][box2.x];
  grid[box2.y][box2.x] = temp1;

  const temp2 = topcolor[box1.y][box1.x];
  topcolor[box1.y][box1.x] = topcolor[box2.y][box2.x];
  topcolor[box2.y][box2.x] = temp2;

};

const isSolved = grid => {
  return (
    topcolor[1][1] === gridcolor[0] &&
    topcolor[1][2] === gridcolor[1] &&
    topcolor[1][3] === gridcolor[2] &&
    topcolor[2][1] === gridcolor[3] &&
    topcolor[2][2] === gridcolor[4] &&
    topcolor[2][3] === gridcolor[5] &&
    topcolor[3][1] === gridcolor[6] &&
    topcolor[3][2] === gridcolor[7] &&
    topcolor[3][3] === gridcolor[8]
  );
};

const getRandomGrid = () => {
  let grid = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 0]];

  // Shuffle
  let blankBox = new Box(4, 4);
  for (let i = 0; i < 1000; i++) {
    const randomNextdoorBox = blankBox.getRandomNextdoorBox();
    swapBoxes(grid, blankBox, randomNextdoorBox);
    blankBox = randomNextdoorBox;
  }

  return grid;
};

class State {
  constructor(grid, move, time, status) {
    this.grid = grid;
    this.move = move;
    this.time = time;
    this.status = status;
  }

  static ready() {
    return new State(
      [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
      0,
      0,
      "ready"
    );
  }

  static start() {
    return new State(getRandomGrid(), 0, 0, "playing");
  }
}

class Game {
  constructor(state) {
    this.state = state;
    this.tickId = null;
    this.tick = this.tick.bind(this);
    this.render();
    this.handleClickBox = this.handleClickBox.bind(this);
  }

  static ready() {
    return new Game(State.ready());
  }

  tick() {
    this.setState({ time: this.state.time + 1 });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  handleClickBox(box) {
    return function() {
      console.log(topcolor)
      console.log(gridcolor)
      const nextdoorBoxes = box.getNextdoorBoxes();
      const blankBox = nextdoorBoxes.find(
        nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
      );
      if (blankBox) {
        const newGrid = [...this.state.grid];
        swapBoxes(newGrid, box, blankBox);
        if (isSolved(newGrid)) {
          clearInterval(this.tickId);
          this.setState({
            status: "won",
            grid: newGrid,
            move: this.state.move + 1
          });
        } else {
          this.setState({
            grid: newGrid,
            move: this.state.move + 1
          });
        }
      }
    }.bind(this);
  }

  render() {
    const { grid, move, time, status } = this.state;
    buttons = [];

    // Render grid
    const newGrid = document.createElement("div");
    newGrid.className = "grid";
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const button = document.createElement("button");
        button.classList.add("b"+i+j);
        buttons.push(button);
        button.style.backgroundColor = grid[i][j] === 0 ? "#E4FDE1" : topcolor[i][j];

        if (grid[i][j] === 0){
          topcolor[i][j] = "0";
        
          if(i!==0 && i!==4 && j!==0 && j!==4){
            button.style.backgroundColor = "#E4FDE1"
          }
        }

        if (status === "playing") {
          button.addEventListener("click", this.handleClickBox(new Box(j, i)));
        }

        newGrid.appendChild(button);
      }
    }
    const blackbox = document.createElement("div");
    blackbox.classList.add("black-box");
    newGrid.appendChild(blackbox);
    document.querySelector(".grid").replaceWith(newGrid);

    // Render button
    const newButton = document.createElement("button");
    if (status === "ready") newButton.textContent = "Start";
    if (status === "playing") newButton.textContent = "Reset";
    if (status === "won") newButton.textContent = "Play";
    newButton.addEventListener("click", () => {
      generatesquare();
      generateSolution();
      clearInterval(this.tickId);
      this.tickId = setInterval(this.tick, 1000);
      this.setState(State.start());
    });
    document.querySelector(".header button").replaceWith(newButton);

    // Render move
    document.getElementById("move").textContent = `Total Moves taken: ${move}`;
    document.getElementById("time").textContent = `Total Time taken: ${time}`;

    if (status === "won") {
      const endscreen = document.createElement("div");
      endscreen.classList.add("endScreen");
      const message = document.createElement("h1");
      message.classList.add("message");
      message.innerHTML = "Game over, You Won the match";
      const tryagain = document.createElement("div");
      tryagain.classList.add("try-again");
      tryagain.innerHTML = "Please try again";
      document.querySelector(".grid").appendChild(endscreen);
      document.querySelector(".grid").appendChild(message);
      document.querySelector(".grid").appendChild(tryagain);

      tryagain.addEventListener("click", () => {
        generatesquare();
        generategrid();
        clearInterval(this.tickId);
        this.tickId = setInterval(this.tick, 1000);
        this.setState(State.start());
      });
    }
  }
}

const GAME = Game.ready();
