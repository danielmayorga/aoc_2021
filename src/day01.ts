import { readFile } from 'fs/promises';

async function getInput(path: string){
    try{
    const file = await readFile(path, { encoding: 'utf8'});
    return file.split('\n').map(l => Number(l));
    }catch(error){
        console.error(error);
        throw error;
    }
}

function part1(input:number[]){
    let base = input[0];
    let result = 0;
    for(let i=1; i<input.length; i++){
        if (base < input[i]){
            result++;
        }
        base = input[i];
    }
    return result;
}

function part2(input: number[]){
    let slide = 0;
    for(let i=0; i<3; i++){
        slide+=input[i];
    }

    let result = 0;
    for(let i=3; i<input.length; i++){
        let next = slide-input[i-3]+input[i];
        if(slide < next){
            result++;
        }
        slide = next;
    }
    return result;
}

async function Main(){
    const input = await getInput('./txt/day01.txt');
    console.log("part1: ", part1(input));
    console.log("part2: ", part2(input));
}

Main();