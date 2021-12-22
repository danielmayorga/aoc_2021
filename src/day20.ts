import { readFile } from 'fs/promises';

interface Point{
    x: number;
    y: number;
    light: boolean;
}

interface PuzzleInput{
    key: string;
    image: Map<string,Point>;
}

function toKeyPoint(point:Point){
    return toKey(point.x,point.y);
}

function toKey(x: number, y: number){
    return x+","+y;
}

async function getPuzzleInput():Promise<PuzzleInput>{
    let text = await readFile('./txt/day20.txt', { encoding: 'utf8'})
    let [key, _, ...grid] = text.split(/\r*\n/).map(l => l.trim());
    let image = new Map();
    for(let y=0; y<grid.length; y++){
        for(let x=0; x<grid[0].length; x++){
            let point = {x,y, light: grid[y][x] ==="#"};
            image.set(toKeyPoint(point),point);
        }
    }

    return({
        key,
        image
    })
}

function day20(puzzle: PuzzleInput, upto: number){
    let {key, image} = puzzle;
    for(let i=0;i<upto;i++){
        image = process(key, image, (i%2)===0);
    }
    return [...image.values()].filter(p => p.light).length;
}

function process(key: string, image: Map<string,Point>, outBound0s: boolean): Map<string,Point>{
    let set = new Set<string>();//visited for optimization
    let result = new Map<string, Point>();
    function readPosition(x:number, y:number):0|1{
        let point = image.get(toKey(x,y));
        if(point!== undefined){
            return point.light? 1: 0;
        }
        return outBound0s? 0 : 1;
    }

    function setImage(x: number, y:number){
        if (set.has(toKey(x,y))) return;
        set.add(toKey(x,y));
        //read row above
        let index = 0;
        for(let column = y-1; column<=y+1; column++){
            for(let row = x-1; row<=x+1; row++){
                index<<=1;
                index+=readPosition(row,column);
            }
        }
        result.set(toKey(x,y),{x,y, light: key[index] === "#"});
    }

    for(let point of image.values()){
        let {x,y}=point;
        for(let column = y-1; column<=y+1; column++){
            for(let row = x-1; row<=x+1; row++){
                setImage(row,column);
            }
        }

    }
    return result;
}

(async function () {
    let puzzle = await getPuzzleInput();
    console.log("part 1: ", day20(puzzle,2));
    console.log("part 2: ", day20(puzzle,50));
})()