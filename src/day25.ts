import {readFileSync} from "fs";

type Grid = string[][];

function getGrid():Grid{
    return readFileSync('./txt/day25.txt', { encoding: 'utf8'})
        .split(/\r*\n/)
        .map(line => [...line]);
}

function attemptMoveEast(grid:Grid, row:number, column:number):boolean{
    if (grid[row][column] !== '>') return false;
    let goTocolumn = (column+1)%grid[0].length;
    if (grid[row][goTocolumn] === '.'){
        grid[row][goTocolumn] = '<';//set ">" to "<" to prevent duplicate moves
        grid[row][column] = 'x';//set new "." to "x" to prevent shift of other elements
        return true;
    }
    return false;
}

function attemptMoveSouth(grid:Grid, row:number, column:number):boolean{
    if (grid[row][column] !== 'v') return false;
    let goToRow = (row+1)%grid.length;
    if (grid[goToRow][column] === '.'){
        grid[goToRow][column] = '^';//same idea as attemptMoveEast
        grid[row][column] = 'x';
        return true;
    }
    return false;
}

function moveEast(grid: Grid):boolean{
    let moved = false;
    for(let row=0; row<grid.length; row++){
        for(let column = 0; column <grid[0].length; column++){
            moved = attemptMoveEast(grid, row, column) || moved;
        }
        for(let column = 0; column <grid[0].length; column++){
            //after an attempt, replace x with . and "<" with ">"
            if (grid[row][column]==='x'){ 
                grid[row][column] = '.';
            }
            if (grid[row][column]==='<'){ 
                grid[row][column] = '>';
            }
        }
    }
    return moved;
}

function moveSouth(grid: Grid):boolean{
    let moved = false;
    for(let column = 0; column <grid[0].length; column++){
        for(let row=0; row<grid.length; row++){
            moved = attemptMoveSouth(grid, row, column)||moved;
        }
        for(let row=0; row<grid.length; row++){
            if (grid[row][column]==='x'){ 
                grid[row][column] = '.';
            }
            if (grid[row][column]==='^'){ 
                grid[row][column] = 'v';
            }
        }
    }
    return moved;
}

function part1(){
    let grid = getGrid();
    let moving = true;
    let moves = 0;
    while(moving){
        moves++;
        moving = moveEast(grid);
        moving = moveSouth(grid) || moving;
    }
    return moves;
}

//for debugging purposes
function printGrid(grid: Grid, count: number){
    console.log(`grid: ${count} \n`+grid.map(row => row.join("")).join("\n"));
}

console.log("part 1", part1());