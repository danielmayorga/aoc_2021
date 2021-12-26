import {readFileSync} from "fs";
//I fucking hate this problem.
//When I went to the gym a few days ago I thought of cool path compression ways to solve this
//however when I read my input I realized there were patterns. Only W is being written in, Z is output. X and Y intermidiate state
//don't matter. I thought it was just a unique property of my input but turns out the "puzzle" is
//exploiting the input...I want general solutions not hacky problems
interface CommandChunk{
    zDiv: number;
    xPlus: number;
    yAdd: number;
}

function parseCommands(){
    let lines = readFileSync('./txt/day24.txt',{encoding:'utf8'})
        .split(/\r*\n/);
    let commands:CommandChunk[] = [];
    for(let i=0; i<lines.length; i+=18){
        let [zDiv, xPlus, yAdd] = [4,5,15].map(j => Number(lines[i+j].split(' ')[2]));
        commands.push({ zDiv, xPlus, yAdd});
    }
    return commands;
}

function runCommand(z:number, w: number, command:CommandChunk):number{
    let x = z%26;
    z= Math.floor(z/command.zDiv);
    x+=command.xPlus;
    if(x != w){
        z*=26;
        let y=w+command.yAdd;
        z+=y;
    }
    return z;
}

function part1(commands: CommandChunk[]){
    const toKey = (step: number, value: number) => step+","+value;
    let fails = new Set<string>();
    
    function recurseSolve(stack: number[], z: number=0):boolean{
        if (stack.length === 14){
            return z===0;
        }

        let key = toKey(stack.length, z);
        if (fails.has(key)){
            return false;
        }

        for(let num=9; num>0; num--){
            stack.push(num);
            let newZ = runCommand(z, num, commands[stack.length-1]);
            if(recurseSolve(stack, newZ)){
                return true;
            }
            stack.pop();
        }
        fails.add(toKey(stack.length,z));
        return false;
    }
    let answer:number[] = [];
    recurseSolve(answer);
    return answer.join('');
}

//same code, just line 80 is iterating through 1->9
function part2(commands: CommandChunk[]){
    const toKey = (step: number, value: number) => step+","+value;
    let fails = new Set<string>();
    
    function recurseSolve(stack: number[], z: number=0):boolean{
        if (stack.length === 14){
            return z===0;
        }

        let key = toKey(stack.length, z);
        if (fails.has(key)){
            return false;
        }

        for(let num=1; num<9; num++){
            stack.push(num);
            let newZ = runCommand(z, num, commands[stack.length-1]);
            if(recurseSolve(stack, newZ)){
                return true;
            }
            stack.pop();
        }
        fails.add(toKey(stack.length,z));
        return false;
    }
    let answer:number[] = [];
    recurseSolve(answer);
    return answer.join('');
}

let commands = parseCommands();
console.log("part 1: "+part1(commands));
console.log("part 2: "+part2(commands));