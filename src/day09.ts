import { readFile } from 'fs/promises';

async function getValues(path: string){
    return (await readFile(path, {encoding: 'utf8'}))
        .split(/\r*\n/)
        .map(wrd => [...wrd].map(char => Number(char)));
}

function day9(matrix: number[][]){
    let part1Sum=0, part2Basins:number[] = [];
    //determin is point is lowpoint relative to surroundings
    const isLowPoint = (row: number, column: number) =>{
        let current = matrix[row][column];
        return (row-1 < 0 || current < matrix[row-1][column])
        && (column-1 < 0 || current < matrix[row][column-1])
        && (row+1 >= matrix.length || current < matrix[row+1][column])
        && (column+1 >= matrix[0].length || current < matrix[row][column+1]);
    }
    //generate key for graph traversal visited Set                 
    const toKey = (row: number, column: number) => 
        row*matrix.length+column;
    
    //count non-9 adjacent nodes for point
    //done with DFS traversal
    const basinCount = (row: number, column: number) => {
        let contained = new Set<number>();
        let stack: [row: number, column: number][] = [[row, column]];
        let count = 0;
        while(stack.length > 0){
            let [row, column] = stack.pop() as [row: number, column: number];
            if (contained.has(toKey(row,column))){
                continue;
            }
            count++;
            contained.add(toKey(row, column));
            if (row+1 < matrix.length && matrix[row+1][column] < 9){
                stack.push([row+1, column]);
            }
            if (column+1 < matrix[0].length && matrix[row][column+1]<9){
                stack.push([row, column+1]);
            }
            if (row-1 >= 0 && matrix[row-1][column]<9){
                stack.push([row-1, column]);
            }
            if (column-1 >= 0 && matrix[row][column-1]<9){
                stack.push([row, column-1]);
            }
        }
        return count;
    }
    //iterate through points in matrix
    for(let row = 0; row < matrix.length; row++){
        for(let column = 0; column < matrix[0].length; column++){
            if(isLowPoint(row, column)){
                //if there is a low point add to sum for part 1
                part1Sum+=matrix[row][column]+1;
                // if there is a low point get basin count for part 2
                part2Basins.push(basinCount(row,column));
            }
        }
    }
    //part 2 asks to multiply the top 3 basin counts together
    part2Basins.sort((a,b) => b-a);
    let part2Sum = 1;
    for (let i=0; i<3; i++){
        part2Sum*=part2Basins[i];
    }
    //return part1 and part2 solutions
    return [part1Sum, part2Sum];
}

async function Main(){
    let values = await getValues('./txt/day09.txt')
    let [part1, part2] = day9(values);
    console.log("part 1: ", part1);
    console.log("part 2: ", part2);
}

Main();