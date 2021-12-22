import { readFile } from 'fs/promises';

interface PolymerizationInput{
    text: string;
    map: Map<string, string>;
}

async function getPolymer(): Promise<PolymerizationInput>{ 
    let lines = (await readFile('./txt/day14.txt', { encoding: 'utf8'}))
        .split(/\r?\n/);

    let text = lines[0].trim();
    let map = lines.slice(2).reduce((set, line) =>{
        let [key, value]= line.split(" -> ");
        return set.set(key.trim(),value.trim());
    }, new Map<string,string>());
    
    return ({text,map});
}

 //the first algorithm I wrote to solve part 1
function inefficientPolymerCount(input: PolymerizationInput, upTo: number){
    let {text, map} = input, next="";
    for(let step=0; step<upTo; step++){
        for(let i=0; i<text.length; i++){
            next+=text[i];
            if (i+1<text.length){
                next+=(map.get(text.substring(i,i+2))??"");
            }
        }
        text = next;
        next = "";
    }
    //get most and least recurring characters
    let charCount = new Map<string, number>();
    for(let char of text){
        charCount.set(char, (charCount.get(char) ?? 0)+1);
    }
    let min = Number.MAX_SAFE_INTEGER, max = Number.MIN_SAFE_INTEGER;
    for(let value of charCount.values()){
        min = Math.min(min, value), max = Math.max(max, value);
    }
    return max-min;
}

//this morning I thought about only keeping track of the pairs through each iteration, thus not having to to the computation a ton of times
function efficientPolymerCount(input: PolymerizationInput, upTo: number){
    const {map, text} = input
    //we only keep track of pairs and their count
    let pairs = new Map<string, number>(),
    //the next "pairs" map that we swap to after each iteration
    nextPairs = new Map<string, number>();
    //the total char count
    const charCount = new Map<string, number>();
    //initialize char count, and set initial pairs
    for(let i = 0; i<text.length; i++){
        let char = text[i];
        charCount.set(char,(charCount.get(char)??0)+1);
        let pair = text.substring(i,i+2);
        if (map.has(pair)){
            pairs.set(pair, (pairs.get(pair)??0)+1);
        }    
    }
    //now for each step we'll only keep track of the new middle character added
    //and we'll update our currently maintained pairs
    for(let step=0; step<upTo; step++){
        for(let [pair,count] of pairs){
            if (map.has(pair)){
                //get middle character and update count based on the current number of pairs
                let middle= map.get(pair) as string;
                charCount.set(middle, (charCount.get(middle)??0)+count);
                //update your next pairs
                nextPairs.set(pair[0]+middle, (nextPairs.get(pair[0]+middle)??0)+count);
                nextPairs.set(middle+pair[1], (nextPairs.get(middle+pair[1])??0)+count);
            }
            //when a pair has no mapping, just drop it and don't do anything, we already have it in the count
        }
        pairs = nextPairs;
        nextPairs = new Map();
    }

    //get most and least recurring characters
    let min = Number.MAX_SAFE_INTEGER, max = Number.MIN_SAFE_INTEGER;
    for(let value of charCount.values()){
        min = Math.min(min, value), max = Math.max(max, value);
    }
    return max-min;
}

(async function (){
    let input = await getPolymer();
    console.log("part 1 first algorithm: ", inefficientPolymerCount(input,10));
    console.log("part 1 second efficient algorithm: ", efficientPolymerCount(input,10));
    console.log("part 2: ", efficientPolymerCount(input, 40));
})()