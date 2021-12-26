import { Heap } from 'heap-js';

type Color = "A"|"B"|"C"|"D";
const ALL_COLORS = ["A","B","C","D"] as ["A", "B", "C","D"];

//Graph Traversal
interface Hallway{
    left?: Hallway;
    right?: Hallway;
    id: number;
    sideRoom?: SideRoom;
}

interface SideRoom{
    above: Hallway|SideRoom;
    id: number;
    below?: SideRoom;
    color: Color;
}

//Graph State, we call it Board
type Entry = Color|null;
//amphipod Id to room
interface Board{
   hallways: Entry[];
   A: Entry[];
   B: Entry[];
   C: Entry[];
   D: Entry[];
}
//Graph and GraphState
interface Diagram{
    hallways: Hallway[];
    A: SideRoom[];
    B: SideRoom[];
    C: SideRoom[];
    D: SideRoom[];
    initialBoard: Board;
}

function strigifyBoard(board: Board):string{
    let array: string[] = [];
    for(let hallway of board.hallways){
        array.push(hallway??".");
    }
    for (let color of ALL_COLORS){
        for (let elem of board[color]){
            array.push(elem??".");
        }
    }
    return array.join('');
}

function boardComplete(board: Board){
    for(let color of ALL_COLORS){
        let sideroom = board[color];
        for(let elem of sideroom){
            if (elem !== color){
                return false;
            }
        }
    }
    return true;
}

function cloneBoard(board: Board):Board{
    return{
        hallways: [...board.hallways],
        A: [...board.A],
        B: [...board.B],
        C: [...board.C],
        D: [...board.D],
    };
}

//helper functions to traverse graph
function *nextLeftSpace(space: SideRoom, board: Board):Iterable<[Board,number]>{
    let iter:SideRoom|Hallway= space;
    let moves=0;
    
    while('above' in iter){
        iter = iter.above;
        moves++;
    }

    //type inference is a bit buggy with all these while loops, so we need a new variable aside from `iter`
    let hallway: Hallway|undefined = iter;

    while(hallway != null && board.hallways[hallway.id] == null){
        if (hallway.sideRoom == null){
            //get a new board
            let result = cloneBoard(board);
            //swap values
            let color = result[space.color][space.id] as Color;
            result[space.color][space.id] = null;
            result.hallways[hallway.id] = color;
            //calculate cost
            let cost = moves*moveCost[color];

            yield [result, cost];
        }
        hallway = hallway.left;
        moves++;
    }
}

function *nextRightSpace(space: SideRoom, board: Board):Iterable<[Board,number]>{
    let iter:SideRoom|Hallway= space;
    let moves=0;
    while('above' in iter){
        iter = iter.above;
        moves++;
    }

    //type inference is a bit buggy with all these while loops, so we need a new variable aside from `iter`
    let hallway: Hallway|undefined = iter;

    while(hallway != null && board.hallways[hallway.id] == null){
        if (hallway.sideRoom == null){
            //get a new board
            let result = cloneBoard(board);
            //swap values
            let color = result[space.color][space.id] as Color;
            result[space.color][space.id] = null;
            result.hallways[hallway.id] = color;
            //calculate cost
            let cost = moves*moveCost[color];

            yield [result, cost];
        }
        hallway = hallway.right;
        moves++;
    }
}

function canGoToHallway(color: Color, board:Board, diagram: Diagram): SideRoom|null {
    let candidates = board[color];
    let i=0;
    while(candidates.length > i &&  candidates[i]==null){
        i++;
    }
    if (candidates.length===i) return null;

    let topSpot = i;
    while(candidates.length > i){
        if (candidates[i]!==color){
            return diagram[color][topSpot];
        }
        i++;
    }
    return null;
}

function canEnter(color: Color, board: Board){
    return board[color].every(elem => elem == null || elem === color);//testin
}

const sideRoomLocation: Record<Color, number> = {
    'A': 2,
    'B': 4,
    'C': 6,
    'D': 8,
}

function canGoToSideRoom(space: Hallway, board: Board): [Board,number]|null{
    let entry = board.hallways[space.id];
    //if you're an empty space or if sideroom is not legal return null
    if ( entry == null || !canEnter(entry, board)){
        return null;
    }
    //now try to traverse to the space
    let moves = 1;
    let currentIndex = space.id;
    let destinationColor: Color = entry;
    let destinationIndex = sideRoomLocation[destinationColor];
    let [start,end] = space.id < destinationIndex? [currentIndex+1,destinationIndex] : [destinationIndex, currentIndex-1];
    for(let i=start; i<=end; i++){
        //something in the way, can't go to sideroom
        if(board.hallways[i]!=null){
            return null;
        }
        moves++;
    }
    //enter sideroom
    let sideroom = board[destinationColor];
    let sideroomIndex = 0;
    for(sideroomIndex=0;sideroomIndex<sideroom.length && sideroom[sideroomIndex] == null; sideroomIndex++){
        moves++;
    }
    sideroomIndex--;
    moves--;
    //swap sideroom with hallway

    //first clone the board
    let result = cloneBoard(board);
    let color = destinationColor;
    result.hallways[space.id] = null;
    result[destinationColor][sideroomIndex] = color;
    //calculate cost
    let cost = moveCost[color]*moves;

    return [result, cost]; 

}

function *boardMoves(board: Board, diagram: Diagram):Iterable<[Board,number]>{
    //try to prioritize hallway movements
    for(let hallway of diagram.hallways){
        let val = canGoToSideRoom(hallway, board);
        if(val!=null){
            yield val;
            //if you can go to the sideroom, don't try anything else
            return;
        }
    }
    //try to move from sideroom to hallway
    for(let color of ALL_COLORS){
        let sideRoom = canGoToHallway(color, board, diagram);
        if (sideRoom != null){
            for (let left of nextLeftSpace(sideRoom, board)){
                yield left;
            }
            for (let right of nextRightSpace(sideRoom, board)){
                yield right;
            }
        }
    }
}

interface Input{
    'A': Color[];
    'B': Color[];
    'C': Color[];
    'D': Color[];
}

function getDiagram(input:Input): Diagram{

    //construct Graph...do I need it...probably not, but I committed to this, god dammit
    //construct hallway
    let root: Hallway = {id: 0}
    let hallways: Hallway[]= [root];
    let before = root;
    for(let i=1; i<11; i++){
        let current: Hallway = { 
            id: i,
            left: before,
        };
        before.right=current;
        before = current;
        hallways.push(current);
    }

    //construct the side rooms
    let sideRooms = {} as Record<Color, SideRoom[]>;
    let sideRoomOrder:Color[] = ['A','B','C','D'];
    for(let i=0; i<sideRoomOrder.length; i++){
        let color = sideRoomOrder[i];
        let hallwayIndex = 2 +i*2;
        let hallway = hallways[hallwayIndex];
        //create first sideroom
        let sideRoom:SideRoom = {
            above: hallway,
            color: color,
            id: 0
        };
        // associate sideroom to hallway
        hallway.sideRoom = sideRoom;
        // set it in our record
        sideRooms[color] = [sideRoom];
    }

    for (let sideroom of Object.values(sideRooms)){
        let before = sideroom[0]
        for(let i=1; i<input.A.length; i++){
            let color = before.color;
            let current: SideRoom = {
                above: before,
                color,
                id: before.id+1
            };
            before.below = current;
            before = current;
            sideroom.push(current);
        }
    }

    return ({
        ...sideRooms,
        hallways,
        initialBoard:{
            ...input,
            hallways:Array(11).fill(null)
        },
    });
}

const moveCost: Record<Color, number> = {
    A: 1,
    B: 10,
    C: 100,
    D: 1000,
};

function playGame(input: Input):Number{
    let diagram = getDiagram(input);
    let visitedBoardState = new Set<string>();//strigified board
    let boardCost = new Map<string, number>();
    let priorityQueue = new Heap<Board>((a,b)=>{
        let aKey = strigifyBoard(a);
        let bKey = strigifyBoard(b);
        return (boardCost.get(aKey) as number) - (boardCost.get(bKey) as number);
    });
    let priorBoard = new Map<string, [Board, number]>();//to show steps...we don't reference it for memory reasons

    //initialization
    let initialBoard = diagram.initialBoard;
    let initialKey = strigifyBoard(initialBoard);
    boardCost.set(initialKey, 0);
    priorityQueue.push(initialBoard);

    //dijskra's algorithm but with board state
    while(priorityQueue.size() > 0){
        let board = priorityQueue.pop() as Board;
        let key = strigifyBoard(board)
        if (!visitedBoardState.has(key)){
            visitedBoardState.add(key);//add to set of visited moves
            const currentCost = boardCost.get(key) as number;//current cost

            if(boardComplete(board)){
                storeSteps(board, priorBoard);
                return currentCost;
            }
            
            //get every legal move and push the new board state
            for(let [nextBoard, cost] of boardMoves(board, diagram)){
                let key = strigifyBoard(nextBoard);
                if (!visitedBoardState.has(key)){
                    let nextBoardCost = boardCost.get(key) ?? Number.MAX_SAFE_INTEGER;
                    let nextCost = cost+currentCost;
                    if (nextBoardCost >nextCost){
                        boardCost.set(key, nextCost);
                        priorBoard.set(key,[board,currentCost]);
                    }
                    //printBoard(nextBoard);
                    priorityQueue.add(nextBoard);
                }
            }
        }
    }
    return -1;//no solution
}

//debuggerHelper
function printBoard(board: Board, step?:number){
    function getSideroomRow(row: number){
        return "#"+(board.A[row]??".")
              +"#"+(board.B[row]??".")
              +"#"+(board.C[row]??".")
              +"#"+(board.D[row]??".")
              +"#";
    }

    let output = "Board"+(step!= null ? " step: "+step : "")+"\n"
        +"#############\n"
        +"#"+board.hallways.map(elem => elem ?? ".").join("")+"#\n"
        +"##"+getSideroomRow(0)+"##\n";

    for(let i=1; i<board.A.length;i++){
        output+="  "+getSideroomRow(i)+"  \n";
    }

    output+= "  #########";
    
    console.log(output);
}

let storedSteps: Board[][] = [];
function storeSteps(board: Board, priorBoard:Map<string, [Board, number]>){
    let store = [board];
    let key = strigifyBoard(board);
    while(priorBoard.has(key)){
        [board] = priorBoard.get(key) as [Board,number]; 
        store.push(board);
        key = strigifyBoard(board);
    }
    storedSteps.push(store.reverse());
}

function printSteps(){
    console.log("Steps Part 1:");
    let board1 = storedSteps[0] as Board[];
    for(let i=0; i<board1.length; i++){
        printBoard(board1[i],i);
    }
    console.log("\nSteps Part 2:");
    let board2 = storedSteps[1] as Board[];
    for(let i=0; i<board2.length; i++){
        printBoard(board2[i],i);
    }
}

/** Hardcoded input */
function getInput():Input{
    return ({
        A:['B','D'], 
        B:['B','A'],
        C:['C','A'],
        D:['D','C'],
    });
}

function part1(input: Input){
    //if someone enters data for part 2, let's parse it to part 1
    if (input.A.length === 4){
        input = {
            A: [input.A[0],input.A[3]],
            B: [input.B[0],input.B[3]],
            C: [input.C[0],input.C[3]],
            D: [input.D[0],input.D[3]],
        };
    }else if (input.A.length !== 2){
        throw Error("input not of size 2 or 4");
    }
    return playGame(input);
}

function part2(input: Input){
    if (input.A.length === 2){
        input = {
            A:[input.A[0], 'D' , 'D', input.A[1]],
            B:[input.B[0], 'C' , 'B', input.B[1]],
            C:[input.C[0], 'B' , 'A', input.C[1]],
            D:[input.D[0], 'A' , 'C', input.D[1]],
        }
    }else if (input.A.length !== 4){
        throw Error("input has to be of lenght 2 or 4");
    }
    return playGame(input);
}

let input = getInput();
console.log("part 1:", part1(input));
console.log("part 2:", part2(input));
printSteps();