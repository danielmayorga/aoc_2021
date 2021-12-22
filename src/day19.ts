import { readFile } from 'fs/promises';

interface Point{
    x: number;
    y: number;
    z: number;
}

type RotationFunc = (point:Point) => Point;
//Advent of code has been tedious the last few days, sunk cost fallacy keeps me her
//using this link to figure out the rotations https://www.euclideanspace.com/maths/algebra/matrix/transforms/examples/index.htm
//thank you airplane visuals
const rotations: RotationFunc[] = [
    p => ({x:p.x, y: p.y, z: p.z}),
    p => ({x:p.x, y: p.z, z: -p.y}),
    p => ({x:p.x, y: -p.y, z: -p.z}),
    p => ({x:p.x, y: -p.z, z: p.y}),

    p => ({x:p.y, y: -p.x, z: p.z}),
    p => ({x:p.y, y: p.z, z: p.x}),
    p => ({x:p.y, y: p.x, z: -p.z}),
    p => ({x:p.y, y: -p.z, z: -p.x}),

    p => ({x:-p.x, y: -p.y, z: p.z}),
    p => ({x:-p.x, y: -p.z, z: -p.y}),
    p => ({x:-p.x, y: p.y, z: -p.z}),
    p => ({x:-p.x, y: p.z, z: p.y}),
    
    p => ({x:-p.y, y: p.x, z: p.z}),
    p => ({x:-p.y, y: -p.z, z: p.x}),
    p => ({x:-p.y, y: -p.x, z: -p.z}),
    p => ({x:-p.y, y: p.z, z: -p.x}),

    p => ({x:p.z, y: p.y, z: -p.x}),
    p => ({x:p.z, y: p.x, z: p.y}),
    p => ({x:p.z, y: -p.y, z: p.x}),
    p => ({x:p.z, y: -p.x, z: -p.y}),
    
    p => ({x:-p.z, y: -p.y, z: -p.x}),
    p => ({x:-p.z, y: -p.x, z: p.y}),
    p => ({x:-p.z, y: p.y, z: p.x}),
    p => ({x:-p.z, y: p.x, z: -p.y}),
];

function inRelativeRange(candidate: number){
    return candidate <= 1000 && candidate>=-1000;
}

function toKey (point: Point){
    return point.x+","+point.y+","+point.z;
}

class Scanner{
    relativeScannerPosition: Point;
    relativePoints: Point[];
    rotationPoints: Point[][];
    constructor(lines: string[]){
        let basePoints = lines.map(line =>{
            let [x,y,z] = line.split(',').map(Number);
            return {x,y,z};
        })
        this.rotationPoints = this.#rotatedPoints(basePoints);
        this.relativeScannerPosition = {x: 0, y:0, z: 0};
        this.relativePoints = this.rotationPoints[0];
    }

    setRelativeScannerPosition(otherPoints: Map<string,Point>, scannerOrigin: Point): boolean{
        for (let rotationPoints of this.rotationPoints){
            for(let ourPoint of rotationPoints){
                for(let theirPoint of otherPoints.values()){
                    if (this.#fits(ourPoint, rotationPoints, theirPoint, otherPoints, scannerOrigin)){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getScannerRelativePoint = () => this.relativeScannerPosition;

    getRelativePoints = () => this.relativePoints;

    #fits = (ourPoint: Point, ourPoints: Point[], theirPoint: Point, otherPoints: Map<string, Point>, ScannerOrigin: Point) => {
        this.relativeScannerPosition  = { 
            x: theirPoint.x-ourPoint.x, 
            y: theirPoint.y-ourPoint.y,
            z: theirPoint.z-ourPoint.z
        };

        this.relativePoints = ourPoints.map(this.#recomputePoint);
        let keySet = this.relativePoints
                                .filter(p => 
                                    this.#inScannerRange(p.x, ScannerOrigin.x) && 
                                    this.#inScannerRange(p.y, ScannerOrigin.y) && 
                                    this.#inScannerRange(p.z, ScannerOrigin.z))
                                .map(toKey)
                                .reduce((set, next) => { set.add(next); return set;}, new Set<string>());
        for(let key of keySet){
            if (!otherPoints.has(key)){
                return false;
            }
        }
        if (keySet.size <12){
            return false;//should have at least 12 common points
        }

        for(let otherPoint of otherPoints.values()){
            //if in range and not in keyset
            if (this.#inOurRelativeRange(otherPoint) && !keySet.has(toKey(otherPoint))){
                return false;
            }
        }
        return true;
    }

    #inScannerRange = (candidate: number, scannerOrigin: number) => {
        let delta = candidate - scannerOrigin;
        return inRelativeRange(delta);
    }

    #inOurRelativeRange = (candidate: Point) => {
        let relativeStart = this.relativeScannerPosition;
        let deltaX = candidate.x - relativeStart.x;
        let deltaY = candidate.y - relativeStart.y;
        let deltaZ = candidate.z - relativeStart.z;
        return inRelativeRange(deltaX) && inRelativeRange(deltaY) && inRelativeRange(deltaZ);
    }

    #recomputePoint = (targetPoint: Point) => {
        let relativeStart = this.relativeScannerPosition;
        return ({
            x: relativeStart.x + targetPoint.x, 
            y: relativeStart.y + targetPoint.y, 
            z: relativeStart.z + targetPoint.z
        });
    }

    #rotatedPoints = (basePoints: Point[]) => {
        let result = [];
        for(let rotationFunc of rotations){
            result.push(basePoints.map(rotationFunc));
        }
        return result;
    }
}

async function getScanners():Promise<Scanner[]>{
    let text = await readFile('./txt/day19.txt', { encoding: 'utf8'});
    const nonEmptyString = (entry: string) => entry.trim().length !==0;

    return text
        .split(/--- scanner \d+ ---/)
        .filter(nonEmptyString)
        .map(line => 
            new Scanner(
                line.split(/\r*\n/)
                    .filter(nonEmptyString)
                )
            );
}

function part1(scanners: Scanner[]){
    let rootScanner = scanners[0]; 
    let totalBeacons = new Set<string>();
    let processing = [rootScanner];
    let processedScanners = new Set<Scanner>([rootScanner]);
    while(processing.length > 0){
        let process = processing.pop() as Scanner;
        let absolutePoints = process
            .relativePoints
            .reduce((map, val) => {map.set(toKey(val), val); return map;}, new Map<string, Point>());
        for(let key of absolutePoints.keys()){
            totalBeacons.add(key);
        }

        for(let scanner of scanners){
            if (!processedScanners.has(scanner) && scanner.setRelativeScannerPosition(absolutePoints, process.relativeScannerPosition)){
                processedScanners.add(scanner);
                processing.push(scanner);
            }
        }
    }

    return totalBeacons.size;
}

function part2(scanners: Scanner[]){
    const manhattan = (a: Point, b:Point) => Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+Math.abs(a.z-b.z);
    let max = 0;
    for(let i=0; i<scanners.length; i++){
        for (let j=i+1; j<scanners.length; j++){
            max = Math.max(manhattan(scanners[i].getScannerRelativePoint(),scanners[j].getScannerRelativePoint()), max);
        }
    }
    return max;
}



(async function () {
    let scanners = await getScanners();
    console.log("part 1: ", part1(scanners));
    console.log("part 2: ", part2(scanners));
})()