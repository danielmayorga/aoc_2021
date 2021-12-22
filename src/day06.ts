import { readFile } from 'fs/promises';

/** gets an array of size 9 with 0-8 elements and their corresponding count */
async function getNumCount(path: string): Promise<number[]>{
    const file = await readFile(path, { encoding: 'utf8'});
    let numbers = file.split(',').map(wrd => Number(wrd));
    let result = new Array(9).fill(0);
    for (let num of numbers){
        result[num]++;
    }
    return result;
}

function day6(numCount: number[], maxDays: number){
    //treating the array like a queue, bad performance on shift and push, but it's an array of size 8 so who cares.
    for(let day = 0; day<maxDays; day++){
        let day0 = numCount.shift() as number;
        numCount[6]+=day0;
        numCount.push(day0);
    }
    let result = 0;
    for(let num of numCount){
        result+=num;
    }
    return result;
}

async function Main(){
    const numCount = await getNumCount('./txt/day06.txt');
    console.log("part1: ", day6(numCount,80));
    //run for another 176 to complete 256 cycles.
    console.log("part2: ", day6(numCount,176));
}

Main();