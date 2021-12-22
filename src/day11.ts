import { readFile } from 'fs/promises';

const getMatrix = async () => 
    (await readFile('./txt/day11.txt', { encoding: 'utf8'}))
        .split(/\r?\n/)
        .map(line => [...line.trim()].map(Number));

function day11(matrix: number[][]){
    let row = matrix.length;
    let column = matrix[0].length;
    const toKey = (r:number, c: number) => r*column+c;

    const nextStep = () => {
        let flashes = 0;
        let visited = new Set();
        function notify(r: number, c: number){
            //if out of bounds don't do anything
            if (r < 0 || r >= row) return;
            if (c < 0 || c >= column) return;
            //if already visited don't do anything
            if (visited.has(toKey(r,c))) return; 
            matrix[r][c]++;
            //if greater than 9, notify neighbor
            if (matrix[r][c] > 9){
                flashes++;
                matrix[r][c]=0;//reset
                visited.add(toKey(r,c));
                for (let iterateRow = -1; iterateRow <= 1; iterateRow++){
                    for (let iterateColumn = -1; iterateColumn <= 1; iterateColumn++){
                        notify(r+iterateRow, c+iterateColumn);
                    }
                }
            }
        }

        for(let r=0; r<row; r++){
            for(let c=0; c<column; c++){
                notify(r,c);//update by 1 and notify neighbors about flash
            }
        }

        return flashes;
    }

    const allFlashing = () => {
        for(let r=0; r<row; r++){
            for(let c=0; c<column; c++){
                if (matrix[r][c]!== 0) return false;
            }
        }
        return true;
    }

    let sum = 0;
    let allFlashingStep = -1;
    let i=0
    for(; i<100; i++){
        sum+=nextStep();
        if (allFlashing()){ //I doubt it's in the first 100 steps, but why not
            allFlashingStep = i+1;
        }
    }
    while(allFlashingStep <0){
        nextStep();
        if (allFlashing()){
            allFlashingStep = i+1;
        }
        i++;
    }

    return [sum, allFlashingStep];
}

(async function(){
    let matrix = await getMatrix();
    let [part1, part2] = day11(matrix);
    console.log("part 1: ", part1);
    console.log("part 2: ", part2);
})();