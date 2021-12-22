import { readFile } from 'fs/promises';

interface Point{
    x: number;
    y: number;
}

interface Line{
    start: Point;
    end: Point;
}

async function getLines(path: string): Promise<Line[]>{
    const file = await readFile(path, { encoding: 'utf8'});
    return file
        .split(/\r?\n/)
        .map(line => {
            let segment = line.trim().split(' ');
            const startPoint = getPoint(segment[0]);
            const endPoint = getPoint(segment[2]);
            return ({
                start: startPoint,
                end: endPoint
            }) as Line;
        });
}

function getPoint(segment: string): Point{
    let [x,y,...rest] = segment.split(',').map(txt => Number(txt));
    if(rest.length !== 0) throw new Error("Expectation Violated for Point Parsing");
    return {x,y};
}

function day5(lines: Line[], allowDiag = false){
    let segmentMap = new Map<number, number>();
    for(let line of lines){
        if (line.start.x === line.end.x){
            let iterator = iterateAxis(line.start.y, line.end.y);
            for(let i of iterator){
                let key = toKey(line.start.x,i);
                segmentMap.set(key, (segmentMap.get(key)??0)+1);
            }

        }
        if (line.start.y === line.end.y){
            let iterator = iterateAxis(line.start.x, line.end.x);
            for(let i of iterator){
                let key = toKey(i,line.start.y);
                segmentMap.set(key, (segmentMap.get(key)??0)+1);
            }
        }
        //diagonal check from part 2
        if (allowDiag){
            let xDiff = Math.abs(line.start.x - line.end.x);
            let yDiff = Math.abs(line.start.y - line.end.y);
            if (xDiff === yDiff){//diagonal 45 degrees
                let xUpdator = ((line.start.x - line.end.x) > 0) ? -1 : 1;
                let yUpdator = ((line.start.y - line.end.y) > 0) ? -1 : 1;
                let startX = line.start.x;
                let startY = line.start.y;
                for(let i=0; i<=xDiff; i++, startX+=xUpdator, startY += yUpdator){
                    let key = toKey(startX,startY)
                    segmentMap.set(key, (segmentMap.get(key)??0)+1);
                }
            }
        }
    }
    let count = 0;
    for(let value of segmentMap.values()){
        if (value > 1){
            count++;
        }
    }
    return count;
}

function toKey(x: number, y: number){
    return x*1000+y;
}

function* iterateAxis(a: number, b:number){
    let [min,max] = [Math.min(a, b), Math.max(a, b)];
    for(min; min<=max; min++){
        yield min;
    }
    return max-min;
}


async function Main(){
    const lines = await getLines('./txt/day05.txt');
    console.log("part1: ", day5(lines));
    console.log("part2: ", day5(lines, true));
}

Main();