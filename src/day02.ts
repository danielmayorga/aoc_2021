import { readFile } from 'fs/promises';

type InputArg = [string, number][];

async function getInput(path: string): Promise<InputArg>{
    try{
    const file = await readFile(path, { encoding: 'utf8'});
    return file.split('\n').map(l => {
        let [direction, num] = l.split(' ');
        return [direction, Number(num)];
    });
    }catch(error){
        console.error(error);
        throw error;
    }
}

function part1(input: InputArg){
    let depth = 0;
    let horizontal = 0;
    for(let[direction, num] of input){
        switch(direction[0]){
            case 'd':
                depth+=num;
                break;
            case 'f':
                horizontal+=num;
                break;
            case 'u':
                depth-=num;
                break;
            default:
                throw new Error("you shouldn't hit this");
        }
    }
    return horizontal*depth;
}

function part2(input: InputArg){
    let aim = 0;
    let depth = 0;
    let horizontal = 0;
    for(let[direction, num] of input){
        switch(direction[0]){
            case 'd':
                aim+=num;
                break;
            case 'f':
                horizontal+=num;
                depth+=(aim*num);
                break;
            case 'u':
                aim-=num;
                break;
            default:
                throw new Error("you shouldn't hit this");
        }
    }
    return horizontal*depth;
}

async function Main(){
    const input = await getInput('./txt/day02.txt');
    console.log("part1: ", part1(input));
    console.log("part2: ", part2(input));
}

Main();