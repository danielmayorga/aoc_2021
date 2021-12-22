import { readFile } from 'fs/promises';
import { Heap } from 'heap-js';//first npm package used on challenge - using a priority queue and didn't want to roll my own

const getMatrix = async () => 
    (await readFile('./txt/day15.txt', { encoding: 'utf8'}))
        .split(/\r?\n/)
        .map(line => [...line.trim()].map(Number));

function part1(matrix: number[][]){
    return dijkstra(matrix, {x: 0, y: 0}, {x: matrix[0].length-1, y: matrix.length-1});
}

function part2(matrix: number[][]){
    //create new matrix with the tile pattern
    let newMatrix:number[][] = new Array(matrix.length*5);
    for(let y=0; y<matrix.length*5; y++){
        newMatrix[y]=new Array(matrix[0].length*5) as number[];
    }

    for (let yTiles=0; yTiles<5; yTiles++){
        for (let xTiles=0; xTiles<5; xTiles++){
            for(let y=0; y<matrix.length; y++){
                for(let x=0; x<matrix[0].length; x++){
                    let yy = yTiles*matrix.length+y;
                    let xx = xTiles*matrix[0].length+x;
                    newMatrix[yy][xx] = (matrix[y][x]+xTiles+yTiles)%9;
                    if (newMatrix[yy][xx] === 0){
                        newMatrix[yy][xx] = 9;
                    }
                }
            }
        }
    }

    return dijkstra(newMatrix, {x: 0, y: 0}, {x: newMatrix[0].length-1, y: newMatrix.length-1});
}

interface Point{
    x: number;
    y: number;
}

function toKey(point:Point){
    return point.x+","+point.y;
}

function dijkstra(matrix: number[][], start: Point, end: Point){
    const xLength = end.x+1;
    const yLength = end.y+1;
    //things I need for dijkstra
    let pathCost = new Map<string, number>();
    const pathCostPoint = (point: Point) => pathCost.get(toKey(point)) ?? Number.MAX_SAFE_INTEGER;
    let priorityQueue = new Heap<Point>((a,b)=> pathCostPoint(a) - pathCostPoint(b));
    let visited = new Set<string>();
    //initialize
    pathCost.set(toKey(start), 0);//starting point cost doesn't count
    priorityQueue.push(start);
    let endKey = toKey(end);
    //create a generator to get neighbors
    function *getUntraversedNeighbors(point: Point){
        for(let diff=-1; diff<=1; diff+=2){
            let pointX = { x: point.x + diff, y: point.y};
            if (pointX.x >=0 && pointX.x < xLength && !visited.has(toKey(pointX))){
                yield pointX;
            }
            let pointY = { x: point.x, y: point.y + diff};
            if (pointY.y >=0 && pointY.y < yLength && !visited.has(toKey(pointY))){
                yield pointY;
            }
        }
    }


    while(priorityQueue.size() > 0){
        let current = priorityQueue.pop() as Point;
        let key = toKey(current);
        if (!visited.has(key)){
            if(key === endKey){
                //reach end, just return result
                return pathCost.get(endKey);
            }
            //iterate through neighbors
            let currentCost = pathCost.get(key) as number;
            for(let neighbor of getUntraversedNeighbors(current)){
                let neighborKey = toKey(neighbor);
                let candidateCost = currentCost+matrix[neighbor.y][neighbor.x];
                let neighborCost = pathCost.get(neighborKey) ?? Number.MAX_SAFE_INTEGER;
                if (candidateCost < neighborCost){
                    pathCost.set(neighborKey, candidateCost);
                    priorityQueue.push(neighbor);
                }
            }

        }
        visited.add(key);
    }

    return pathCost.get(endKey);
}

(async function(){
    let matrix = await getMatrix();
    console.log("part 1: ", part1(matrix));
    console.log("part 2: ", part2(matrix));
})()