import { readFile } from 'fs/promises';

const readLines = async () => 
    (await readFile('./txt/day10.txt', { encoding: 'utf8'}))
        .split(/\r?\n/);

function part1(lines: string[]){

    const matches = (stack: string[], match: string) => stack.pop() === match;

    //classic matching symbols problem...I've seen so many variants
    const firstIncorrect = (line: string) => {
        let stack:string[] = [];
        for(let char of line){
            switch(char){
                case "(":
                case "{":
                case "<":
                case "[":
                    stack.push(char);
                    break;
                case ")":
                    if (!matches(stack, "(")){
                        return 3;
                    }
                break;
                case "}":
                    if (!matches(stack, "{")){
                        return 1197;
                    }
                break;
                case ">":
                    if (!matches(stack, "<")){
                        return 25137;
                    }
                break;
                case "]":
                    if (!matches(stack, "[")){
                        return 57;
                    }
                break;
            }
        }
        return 0;//no error
    }
    let sum = 0;
    for (let line of lines){
        sum+=firstIncorrect(line);
    }
    return sum;
}

//pretty much copy and pasted part 1 with some small changes
function part2(lines: string[]){

    const matches = (stack: string[], match: string) => stack.pop() === match;

    const completionScore = (line: string) => {
        let stack:string[] = [];
        for(let char of line){
            switch(char){
                case "(":
                case "{":
                case "<":
                case "[":
                    stack.push(char);
                    break;
                case ")":
                    if (!matches(stack, "(")){
                        return 0;
                    }
                break;
                case "}":
                    if (!matches(stack, "{")){
                        return 0;
                    }
                break;
                case ">":
                    if (!matches(stack, "<")){
                        return 0;
                    }
                break;
                case "]":
                    if (!matches(stack, "[")){
                        return 0;
                    }
                break;
            }
        }
        let score = 0;
        while(stack.length > 0){
            let elem = stack.pop();
            score*=5;
            switch(elem){
                case "(":
                    score+= 1;
                    break;
                case "{":
                    score+= 3;
                    break;
                case "<":
                    score+= 4;
                    break;
                case "[":
                    score+= 2;
                    break;
            }
        }
        return score;
    }

    let scores = [];
    for (let line of lines){
        let score = completionScore(line);
        if (score > 0){
            scores.push(score);
        }
    }
    //return middle element
    scores.sort((a,b)=> a-b);
    //there will always be a middle
    return scores[Math.floor(scores.length/2)];
}

(async function(){
    let lines= await readLines();
    console.log("part 1: ", part1(lines));
    console.log("part 2: ", part2(lines));
})();