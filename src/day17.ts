export ={};

interface IRange{
    start: number;
    end: number;
}

//I'm banking that our answer will be a triangle sum
function part1(xRange:IRange,yRange:IRange){
    //memoized triangle sums, we want the slowest xVelocity to get maximum y velocity
    //i think this is only possible when we have a velocity that reduces to 0.
    //hence why I keep track of triangle number sums if our xposition is a triangle sum
    //we know our final velocity is 0
    let triangleNumSumMemo = new Set<number>();
    let triangleNumSum = 0;
    for(let n=1; triangleNumSum<xRange.end; n++){
        triangleNumSum+=n;
        if (triangleNumSum>=xRange.start){
            triangleNumSumMemo.add(triangleNumSum);
        }
    }

    function isTriangleSum(x: number){
        return triangleNumSumMemo.has(x);
    }

    //helper function determines highest point for individual point
    function highestYPosition(x:number,y:number):number{
        //don't even bother with non triangle number sums
        //I'm pretty certain it wont be max and are ranges are large enough to have a few triangle numbers
        if (!isTriangleSum(x)){
            return -1;
        }

        //calculate highest y by creating a triangle sum of 1 less than our absolute value
        //this part I can't articulate well but my monkey brain sees it
        let n = Math.abs(y)-1;
        return (n*(n+1))/2;

    }
    //iterate through all the points then return the highest Y position overall
    let highestY = 0;
    for(let y=yRange.start; y<=yRange.end; y++){
        for(let x=xRange.start; x<=xRange.end; x++){
            highestY=Math.max(highestY,highestYPosition(x,y));
        }
    }
    //in retrospect this operation can actually be done in constant time since (yRange.start)(yRange.start-1)/2 is always the answer I think
    return highestY;
}

function part2(xRange: IRange, yRange: IRange){
    //cool...I should of just brute forced this, so I would have been done earlier instead of trying to be clever :| sigh
    function hits(xVelocity:number,yVelocity: number):boolean{
        let yPosition = 0, xPosition=0;
        while(yPosition>=yRange.start){
            xPosition+=(xVelocity==0)? xVelocity: xVelocity--;
            yPosition+=yVelocity--;
            if(xPosition >= xRange.start && xPosition<=xRange.end && yPosition >= yRange.start && yPosition <= yRange.end){
                return true;//HIT
            }
        }
        return false;//passed
    }

    let sum=0;
    for(let x=1; x<=xRange.end; x++){
        for(let y=yRange.start; y<=Math.abs(yRange.start); y++){
            if(hits(x,y)) sum++;
        }
    }
    return sum;
}

(function (){
    let xRange:IRange = {start: 207, end: 263};
    let yRange:IRange = {start: -115, end: -63};
    console.log("part 1: ", part1(xRange, yRange));
    console.log("part 2: ", part2(xRange, yRange));
})()