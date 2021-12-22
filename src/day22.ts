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

interface Cube{
    x: Range;
    y: Range;
    z: Range;
}

function part2(instructions: Instruction[]){
    //thought in 3d for a bit and came up with this janky solution
    let cubeSpace: Cube[] = [];
    let removedCubeSpace: Cube[] = [];

    const intersectRange = (a: Range, b: Range) => a.start <= b.end && a.end >= b.start;
    const isOverlapCube = (a: Cube, b: Cube) => 
        intersectRange(a.x, b.x) &&
        intersectRange(a.y, b.y) &&
        intersectRange(a.z, b.z);

    function interceptRange(a:Range,b: Range):Range{
        return ({
            start: Math.max(b.start, a.start),
            end: Math.min(b.end, a.end),
        });
    }        

    const getOverlapCube = (a: Cube, b: Cube) => 
        ({
            x: interceptRange(a.x, b.x),
            y: interceptRange(a.y, b.y),
            z: interceptRange(a.z, b.z),
        } as Cube) ;

    for(let {on, xRange: x, yRange: y, zRange: z} of instructions){
        let current = {x,y,z};
        if (on){
            //find overlap with existing cubespace and remove the overlapping area
            let currentOverlap = []
            for(let cube of cubeSpace){
                if (isOverlapCube(current,cube)){
                    currentOverlap.push(getOverlapCube(current,cube));
                }
            }
            //find overlap with deleted elements and readd them to the cubespace
            for(let removed of removedCubeSpace){
                if(isOverlapCube(current, removed)){
                    cubeSpace.push(getOverlapCube(current, removed));
                }
            }
            //add your own overlaps to the remove pile 
            removedCubeSpace.push(...currentOverlap);
            // add to the current area to the cubespace
            cubeSpace.push(current);
        }else{
            //remove elements you are currently overlapping with in the cubespace
            let currentRemoveOverlap = [];
            for(let cube of cubeSpace){
                if(isOverlapCube(current, cube)){
                    currentRemoveOverlap.push(getOverlapCube(current, cube));
                }
            }
            //if you overlap with an element in the removed space, readd that space to prevent double removal
            for(let removed of removedCubeSpace){
                if(isOverlapCube(current, removed)){
                    cubeSpace.push(getOverlapCube(current,removed));
                }
            }
            //remove overlapping elements from the cubespace
            removedCubeSpace.push(...currentRemoveOverlap);
        }
    }

    const area = (cube: Cube) => 
        BigInt((cube.x.end - cube.x.start+1)*
        (cube.y.end - cube.y.start+1)*
        (cube.z.end - cube.z.start+1));

    let result = 0n;
    for (let space of cubeSpace.map(area)){
        result+=space;
    }
    for (let removed of removedCubeSpace.map(area)){
        result-=removed;
    }
    return result;
}

(async function(){
    let instructions = await getInstructions();
    console.log("part 1: ", part1(instructions));
    console.log("part 2: ", part2(instructions));
})()