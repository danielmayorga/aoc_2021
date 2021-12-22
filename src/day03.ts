import { readFile } from 'fs/promises';

async function readInput(){
    let file = await readFile('./txt/day03.txt', { encoding: 'utf8'});
    return file.split('\n');
}

function part1(input: string[]){
    let size = input[0].length;
    let parity = Array<number>(size).fill(0);
    for(let word of input){
        for(let i=0; i<size; i++){
            let char = word[i];
            if (char ==="1"){
                parity[i]++;
            } else {
                parity[i]--;
            }
        }
    }
    let gamma = 0, epsilon = 0;
    for (let i=0; i<size; i++){
        gamma <<= 1;
        epsilon <<= 1;
        if (parity[i]>=0){
            gamma++;
        }else{
            epsilon++;
        }
    }
    return gamma*epsilon;
}

function part2(input: string[]){
    let oxygenSet = [...input];
    let co2Set = [...input];
    let size = input[0].length;
    for(let i=0; i<size; i++){
        let oxygen_1 = MostCommon1(oxygenSet, i);
        let co2_1 = !MostCommon1(co2Set, i);
        oxygenSet = Filter(oxygenSet, i, (oxygen_1)? "1": "0");
        co2Set = Filter(co2Set, i, (co2_1)? "1": "0");
    }
    if (oxygenSet.length === 1 && co2Set.length === 1){
        return toDecimal(oxygenSet[0])*toDecimal(co2Set[0]);
    }
}

function toDecimal(bits:string){
    let result = 0; 
    for(let char of bits){
        result<<=1;
        if (char==="1"){
            result++;
        }
    }
    return result;
}

function MostCommon1(words: string[], position: number) {
    let parity = 0;
    for(let word of words){
        if (word[position] === "1"){
            parity++;
        }else{
            parity--;
        }
    }
    return parity >= 0;
}

function Filter(words: string[], position: number, filterChar: string): string[]{
    let result: string[] = [];
    for(let word of words){
        if (word[position] === filterChar){
            result.push(word);
        }
    }
    if (result.length === 0) return words;
    return result;
}

async function main(){
    let input = await readInput();
    console.log("part 1: ", part1(input));
    console.log("part 2: ", part2(input));
}

main();