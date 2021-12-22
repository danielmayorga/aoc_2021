import { readFile } from 'fs/promises';

const readInput = async () => 
    (await readFile('./txt/day18.txt', { encoding: 'utf8'}))
        .split(/\r*\n/)
        .map(l => l.trim());

interface Pair{
    left:   Pair | NumberNode;
    right:  Pair | NumberNode;
    parent: Pair | null;
}

interface NumberNode{
    value:  number;
    parent: Pair | null;
}

type Token = NumberNode|Pair;

function toPair(text: string):Pair{
    let stack:Token[]=[];
    for(let char of text){
        switch(char){
            case "]":
                let right = stack.pop() as Pair | NumberNode;
                let left = stack.pop()  as Pair | NumberNode;
                let parent = { left, right, parent: null};
                left.parent = right.parent = parent;
                stack.push(parent);
                break;
            case "[":
            case ",":
                break;
            default://number
                stack.push({value:Number(char), parent: null});
        }
    }
    return stack.pop() as Pair;
}

function getLeftNeighborNumberNode(pair: Pair|NumberNode):NumberNode|null{
    let parent = pair.parent;
    if (parent === null) return null;
    if (parent.left === pair){
        return getLeftNeighborNumberNode(parent);
    }
    let rightmostIterator = parent.left;
    while(!('value' in rightmostIterator)){
        rightmostIterator = rightmostIterator.right;
    }
    return rightmostIterator;
}

function getRightNeighborNumberNode(pair: Pair|NumberNode):NumberNode|null{
    let parent = pair.parent;
    if (parent === null) return null;
    if (parent.right === pair){
        return getRightNeighborNumberNode(parent);
    }
    let leftmostIterator = parent.right;
    while(!('value' in leftmostIterator)){
        leftmostIterator = leftmostIterator.left;
    }
    return leftmostIterator;
}

function add(left: Pair, right:Pair):Pair{
    let result:Pair = {left, right, parent: null};
    left.parent = right.parent = result;
    //there is probably some linear way to not handle these as object, but I committed, so I have to see jank through
    let stillReduce = true;
    while(stillReduce){
        stillReduce = attemptExplode(result) || attemptSplit(result);
    }
    return result;
}

function attemptExplode(pair: Pair|NumberNode, depth=0):boolean{
    if ("value" in pair) return false;
    if (depth >= 4){
        explode(pair);
        return true;
    }
    return attemptExplode(pair.left,depth+1) || attemptExplode(pair.right,depth+1);
}

function attemptSplit(node:Pair|NumberNode):boolean{
    if("value" in node){
        if (node.value > 9){
            split(node);
            return true;
        }
    }else{//pair
        return attemptSplit(node.left) || attemptSplit(node.right);
    }
    return false;
}

function explode(pair: Pair){
    let parent = pair.parent;
    let newNode = { value: 0, parent} as NumberNode
    if (parent!.left === pair){
        parent!.left = newNode;
    } else {
        parent!.right = newNode;
    }
    //update right neighbor;
    let rightNeighbor = getRightNeighborNumberNode(newNode);
    let leftNeighbor = getLeftNeighborNumberNode(newNode);
    if (rightNeighbor !== null){
        rightNeighbor.value+=(pair.right as NumberNode).value;
    }
    if (leftNeighbor !== null){
        leftNeighbor.value+=(pair.left as NumberNode).value;
    }
}

function split(node: NumberNode){
    let parent = node.parent;
    let split: Pair = {
        left: { 
            value: Math.floor(node.value/2),
            parent: null,
        },
        right:{
            value: Math.ceil(node.value/2), 
            parent: null
        },
        parent
    };
    split.left.parent = split.right.parent = split;
    if(node === parent?.left){
        parent.left = split;
    }else if (node === parent?.right){
        parent.right = split;
    }else{
        throw Error("shouldn't reach this")
    }
}

function magnitude(candidate: Pair|NumberNode):number{
    if ("value" in candidate){
        return candidate.value;
    }
    return 3*magnitude(candidate.left)+2*magnitude(candidate.right);
}

function part1(lines: string[]){
    let pairs = lines.map(toPair);
    let result = add(pairs[0],pairs[1]);
    for(let i=2; i< pairs.length; i++){
        result = add(result,pairs[i])
    }
    return magnitude(result);
}

function clone(pair: Pair|NumberNode):Pair|NumberNode{
    if ("value" in pair){
        return {...pair};
    }else{
        let left = clone(pair.left);
        let right = clone(pair.right);

        let result = ({
            left,
            right,
            parent: null
        });
        left.parent = result;
        right.parent = result;
        return result;
    }
}

function addNonMutating(left: Pair, right: Pair):Pair{
    return add(clone(left) as Pair,clone(right) as Pair);
}

function part2(lines: string[]){
    let pairs = lines.map(toPair);
    let max = 0;
    for(let pair of pairs){
        for(let pair2 of pairs){
            if(pair !== pair2){
                let result = addNonMutating(pair,pair2);
                max = Math.max(max,magnitude(result))
            }
        }
    }
    return max;
}

//for debugging purposes
function printParenthesis(result:Pair|NumberNode):string{
    if ('value' in result) return result.value.toString();
    return `[${printParenthesis(result.left)},${printParenthesis(result.right)}]`;
}

(async function(){
    let lines = await readInput();
    console.log("part 1: ", part1(lines));
    console.log("part 2: ", part2(lines));
})();