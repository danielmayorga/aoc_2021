import { readFile } from 'fs/promises';

interface Fold{
    axis: 'x'| 'y';
    boundaryLine: number;
}

interface Point{
    x: number;
    y: number;
}

class TransparentPaper{
    #map: Map<string, Point> = new Map();
    #toKey = (x: number, y: number) => x.toString()+","+y.toString();

    addPoint = (x: number, y: number) => 
        this.#map.set(this.#toKey(x,y), {x,y});

    removePoint = (x: number, y: number) => 
        this.#map.delete(this.#toKey(x,y));
    
    getPoints = () => this.#map.values();

    hasPoint = (x: number, y: number) =>
        this.#map.has(this.#toKey(x,y));
}

interface TransparentInput{
    points : TransparentPaper;
    folds: Fold[];
}

async function getInput(path: string): Promise<TransparentInput>{
    let points = new TransparentPaper();
    let lines = (await readFile(path, {encoding: 'utf8'}))
        .split(/\r*\n/);
    let i=0;
    //get points
    for (;i<lines.length; i++){
        let [x,y] = lines[i].split(',');

        if(y === undefined){
            i++;
            break;// move on to folds
        }
        points.addPoint(Number(x),Number(y));
    }
    //get folds
    let folds: Fold[] = [];
    for (;i<lines.length; i++){
        let line = lines[i];
        let fold: Fold = {
            axis: line[11] as 'x'|'y',
            boundaryLine: Number(line.substring(13)),
        };
        folds.push(fold);
    }
    return({
        points,
        folds
    })
}

function part1(input: TransparentInput){
    processFold(input.points, input.folds[0]);
    return [...input.points.getPoints()].length;
}

function processFold(points: TransparentPaper, fold: Fold){
    let xAxis = fold.axis === 'x';
    let boundaryLine = fold.boundaryLine;
    for(let point of [...points.getPoints()]){
        if (xAxis){
            if(point.x > boundaryLine){
                points.removePoint(point.x,point.y);
                let xUpdate = boundaryLine - Math.abs(boundaryLine-point.x);
                let newPoint:Point = {x: xUpdate, y: point.y};
                points.addPoint(newPoint.x, newPoint.y);
            }
        }else{
            if(point.y > boundaryLine){
                points.removePoint(point.x,point.y);
                let yUpdate = boundaryLine - Math.abs(boundaryLine-point.y);
                let newPoint:Point = {x: point.x, y: yUpdate};
                points.addPoint(newPoint.x, newPoint.y);
            }
        }
    }
}

function part2(input: TransparentInput){
    //determine size of array I need to display
    let xSize = Number.MAX_SAFE_INTEGER, ySize = Number.MAX_SAFE_INTEGER; 
    //process all the folds
    for (let fold of input.folds){
        processFold(input.points, fold);

        // get the min and max lenght for the array we will display
        if (fold.axis === "x"){
            xSize = Math.min(xSize, fold.boundaryLine);
        }else{
            ySize = Math.min(ySize, fold.boundaryLine);
        }
    }
    let output ="\n";
    for(let y=0; y<=ySize; y++){
        for(let x=0; x<=xSize; x++){
            output+=(input.points.hasPoint(x,y))? "#" : " ";
        }
        output+="\n";
    }
    return output;
}

(async function Main(){
    let values = await getInput('./txt/day13.txt');
    console.log("part 1: ", part1(values));
    //reset the input, I normally get in trouble because of my mutations
    values = await getInput('./txt/day13.txt');
    console.log("part 2: ", part2(values));
    //console.log("part 2: ", part2);
})();