import { readFile } from 'fs/promises';

interface Range{
    start: number;
    end: number;
}

interface Instruction{
    on: boolean;
    xRange: Range;
    yRange: Range;
    zRange: Range;
}

const rangeRegex = /(-*\d+)..(-*\d+)/g;

async function getInstructions():Promise<Instruction[]>{
    let text = await readFile('./txt/day22.txt', { encoding: 'utf8'})
    return text
        .split(/\r*\n/)
        .map(line =>{
            let on = line[1] === "n";
            let [xRange,yRange,zRange]= [...line.matchAll(rangeRegex)]
                .map(match => ({ start: Number(match[1]), end: Number(match[2])}));
            return {on, xRange, yRange, zRange};
        })
}

function part1(instructions: Instruction[]){
    //brute force it even though part 2 will haunt me.
    let set = new Set<string>();

    const intersectRange = (range: Range) => range.start <= 50 && range.end >= -50;
    const intersectInstruction = (instructions: Instruction) => 
            intersectRange(instructions.xRange) && 
            intersectRange(instructions.yRange) && 
            intersectRange(instructions.zRange);

    function normalizeRange(instruction:Range):Range{
        return ({
            start: Math.min((Math.max(-50, instruction.start)), 50),
            end: Math.min((Math.max(-50, instruction.end)), 50),
        });
    }
    const toKey = (x:number,y:number,z:number) => [x,y,z].join(",");

    for (let {on, xRange, yRange, zRange} of instructions.filter(intersectInstruction)){
        let xNormal = normalizeRange(xRange), 
        yNormal = normalizeRange(yRange),
        zNormal = normalizeRange(zRange);
        for(let x=xNormal.start; x<=xNormal.end; x++){
            for(let y=yNormal.start; y<=yNormal.end; y++){
                for(let z=zNormal.start; z<=zNormal.end; z++){
                    if (on){
                        set.add(toKey(x,y,z));
                    }else{
                        set.delete(toKey(x,y,z));
                    }
                }
            }
        }
    }

    return set.size;
}

function part2(instructions: Instruction[]){
    //todo
}

(async function(){
    let instructions = await getInstructions();
    console.log("part 1: ", part1(instructions));
    console.log("part 2: ", part2(instructions));
})()