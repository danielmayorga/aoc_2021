import { readFile } from 'fs/promises';

interface BingoGame{
    numbers: number[];
    boards: Board[];
}

class Board{
    board: number[][];
    called: boolean[][];

    constructor(lines: string[]){
        this.board = [];
        this.called = [];
        for(let line of lines){
            //this trimming cost me so much time because I forgot about it
            this.board.push(line.trim().split(/ +/).map(wrd => Number(wrd)));
            this.called.push(new Array(5).fill(false));
        }
    }

    call = (num: number) => {
        for(let r = 0; r < 5; r++){
            for (let c = 0; c < 5; c++){
                if(this.board[r][c]=== num){
                    this.called[r][c] = true;
                    if(this.#check(r,c)){
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    //for part 1
    unmarkedNumberSum = () =>{
        let sum = 0;
        for(let r = 0; r < 5; r++){
            for(let c = 0; c < 5; c++){
                if (!this.called[r][c]){
                    sum+=this.board[r][c];
                }
            }
        }
        return sum;
    }

    #check = (row: number, column: number) =>{
        let rowWin = true;
        for(let r=0; r < 5; r++){
            rowWin &&= this.called[r][column];
        }
        if (rowWin){
            return true;
        }
        let columnWin = true;
        for(let c=0; c < 5; c++){
            columnWin &&= this.called[row][c];
        }
        return columnWin;
    }
}

async function getInput(path: string): Promise<BingoGame>{
    try{
        const file = await readFile(path, { encoding: 'utf8'});
        let lines = file.split(/\r?\n/);

        let bingoGame: BingoGame = {
            numbers : lines[0].split(',').map(txt => Number(txt)),
            boards : []
        };
        //construct board
        for (let i=2; i < lines.length; i++){
            let board: string[] = [];
            for(let rows = 0; rows<5; rows++){
                board.push(lines[i]);
                i++;
            }
            bingoGame.boards.push(new Board(board));
        }
        return bingoGame;

    }catch(error){
        console.error(error);
        throw error;
    }
}

function part1(game: BingoGame){
    for(let num of game.numbers){
        for(let board of game.boards){
            if (board.call(num)){
                return num * board.unmarkedNumberSum();
            }
        }
    }
}

function part2(game: BingoGame){
    let boards = [...game.boards];
    let boardNext: Board[] = [];
    let lastWin = 0;
    for(let num of game.numbers){
        for(let board of boards){
            if (board.call(num)){
                lastWin = num * board.unmarkedNumberSum();
            }else{
                boardNext.push(board);
            }
        }
        boards = boardNext;
        boardNext = [];
    }
    return lastWin;
}

async function Main(){
    const game = await getInput('./txt/day04.txt');
    console.log("part1: ", part1(game));
    console.log("part2: ", part2(game));
}

Main();