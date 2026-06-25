// Generates a crossword grid from a word list by greedily placing words at best-overlap positions.
const words = [
  { num: 1, word: "SCHWARZGELB" },
  { num: 2, word: "STUHL" },
  { num: 3, word: "REUS" },
  { num: 4, word: "GERNER" },
  { num: 5, word: "TAUCHEN" },
  { num: 6, word: "SPAETI" },
  { num: 7, word: "MAUERWERK" },
  { num: 8, word: "DREHEND" },
  { num: 9, word: "PULBIBER" },
  { num: 10, word: "FLADENBROT" },
  { num: 11, word: "NUERNBERG" },
  { num: 12, word: "KAISERBURG" },
  { num: 13, word: "WECKLA" },
  { num: 14, word: "LEBKUCHEN" },
  { num: 15, word: "PEGNITZ" },
  { num: 16, word: "INNENVERTEIDIGER" },
  { num: 17, word: "WOHNSITUATION" },
];

const GRID_SIZE = 30;
const OFFSET = 15;

function makeGrid() {
  const g = {};
  return g;
}

function canPlace(grid, word, row, col, dir) {
  let overlaps = 0;
  for (let i = 0; i < word.length; i++) {
    const r = dir === "down" ? row + i : row;
    const c = dir === "across" ? col + i : col;
    const key = `${r},${c}`;
    const existing = grid[key];
    if (existing) {
      if (existing !== word[i]) return -1;
      overlaps++;
    } else {
      // check adjacent cells perpendicular to avoid accidental touching words
      if (dir === "across") {
        if (grid[`${r - 1},${c}`] || grid[`${r + 1},${c}`]) return -1;
      } else {
        if (grid[`${r},${c - 1}`] || grid[`${r},${c + 1}`]) return -1;
      }
    }
  }
  // check cells before/after word ends are free
  if (dir === "across") {
    if (grid[`${row},${col - 1}`] || grid[`${row},${col + word.length}`]) return -1;
  } else {
    if (grid[`${row - 1},${col}`] || grid[`${row + word.length},${col}`]) return -1;
  }
  return overlaps;
}

function placeWord(grid, word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = dir === "down" ? row + i : row;
    const c = dir === "across" ? col + i : col;
    grid[`${r},${c}`] = word[i];
  }
}

function findBestPlacement(grid, word, placedEntries) {
  let best = null;
  for (const entry of placedEntries) {
    for (let i = 0; i < word.length; i++) {
      for (let j = 0; j < entry.word.length; j++) {
        if (word[i] !== entry.word[j]) continue;
        const dir = entry.dir === "across" ? "down" : "across";
        let row, col;
        if (dir === "down") {
          row = entry.row - i;
          col = entry.col + j;
        } else {
          row = entry.row + j;
          col = entry.col - i;
        }
        const score = canPlace(grid, word, row, col, dir);
        if (score > (best ? best.score : -1)) {
          best = { row, col, dir, score };
        }
      }
    }
  }
  return best;
}

const sorted = [...words].sort((a, b) => b.word.length - a.word.length);
const grid = makeGrid();
const placedEntries = [];

// place first (longest) word in center, across
const first = sorted[0];
placeWord(grid, first.word, OFFSET, OFFSET, "across");
placedEntries.push({ ...first, row: OFFSET, col: OFFSET, dir: "across" });

for (let k = 1; k < sorted.length; k++) {
  const entry = sorted[k];
  const placement = findBestPlacement(grid, entry.word, placedEntries);
  if (!placement) {
    console.error("Could not place:", entry.word);
    continue;
  }
  placeWord(grid, entry.word, placement.row, placement.col, placement.dir);
  placedEntries.push({ ...entry, row: placement.row, col: placement.col, dir: placement.dir });
}

// normalize coordinates to start at 0,0
let minRow = Infinity, minCol = Infinity, maxRow = -Infinity, maxCol = -Infinity;
for (const e of placedEntries) {
  const endRow = e.dir === "down" ? e.row + e.word.length - 1 : e.row;
  const endCol = e.dir === "across" ? e.col + e.word.length - 1 : e.col;
  minRow = Math.min(minRow, e.row);
  minCol = Math.min(minCol, e.col);
  maxRow = Math.max(maxRow, endRow);
  maxCol = Math.max(maxCol, endCol);
}
for (const e of placedEntries) {
  e.row -= minRow;
  e.col -= minCol;
}
const rows = maxRow - minRow + 1;
const cols = maxCol - minCol + 1;

placedEntries.sort((a, b) => a.num - b.num);

console.log(JSON.stringify({ rows, cols, entries: placedEntries }, null, 2));
