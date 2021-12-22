import { readFile } from 'fs/promises';

async function getValues(path: string){
    return (await readFile(path, {encoding: 'utf8'})).split(',').map(wrd => Number(wrd));
}

function part1(values: number[]){
    //don't mutate input that normally gets me in trouble in part 2
    let array = [...values];
    array.sort((a,b) => a-b);
    //we'll keep track of the total left and right sum
    //initial right sum will have everything shifted to the right by at least 1 space for out iterator
    let rightSum = array.reduce((prev, curr) => prev+curr, 0) - ((array[0]-1)*array.length);
    let leftSum = 0;
    //when we shift the candidate position from (min->max) we'll keep a count of total
    //entries in the left and right side
    let position = 0;
    let minDistance = rightSum;
    //probably a more clever way with mean/median and junk but meh
    for (let candidate = array[0]; candidate<=array[array.length -1]; candidate++){
        leftSum+=position;
        rightSum-=(array.length - position);
        
        while(position<array.length && candidate>=array[position]){
            position++;
        }

        let totalCrabDistance = (leftSum+rightSum);
        if (totalCrabDistance < minDistance){
            minDistance = totalCrabDistance
        }
    }
    return minDistance;
}

function part2(values: number[]){
    //don't mutate input that normally gets me in trouble in part 2
    let array = [...values],
    min = Number.MAX_SAFE_INTEGER, 
    max = Number.MIN_SAFE_INTEGER;

    for (let num of array){
        if (num < min) { min = num;}
        if (num > max) { max = num;}
    }
    let minSum = Number.MAX_SAFE_INTEGER;
    //brute force it!
    for (let candidate = min; candidate<=max; candidate++){
        let currSum = array.reduce((prev, curr) => prev+sigma(candidate, curr),0);
        if (currSum < minSum){
            minSum = currSum;
        }
    }
    return minSum;
}

function sigma(position: number, current: number){
    let n = Math.abs(position-current);
    return (n*(n+1))/2;
}

async function Main(){
    let values = await getValues('./txt/day07.txt')
    console.log("part 1: ", part1(values));
    console.log("part 2: ", part2(values));
}

Main();