import { readFile } from 'fs/promises';

async function getPuzzleInput(){
    let text = await readFile('./txt/day22.txt', { encoding: 'utf8'})
    return text.split(/\r*\n/).map(l => l.trim());
}

function part1(){

}

function part2(){

}

(async function(){
    let input = await getPuzzleInput();
    console.log("part 1: ", part1());
    console.log("part 2: ", part2());
})()