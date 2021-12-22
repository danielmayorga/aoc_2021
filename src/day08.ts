import { readFile } from 'fs/promises';

async function getValues(path: string){
    return (await readFile(path, {encoding: 'utf8'}))
        .split(/\r*\n/)
        .map(wrd => wrd.split(/  *\|* */));
}

function part1(values: string[][]){
    let sum = 0;
    for(let words of values){
        for(let i = 10; i< words.length; i++){
            let word = words[i];
            let length = word.length;
            if (length  === 2 || length === 4 || length === 3 || length === 7 ){
                sum++;
            }
        }
    }
    return sum;
}

function part2(values: string[][]){
    let sum = 0;
    for(let words of values){
        let record = decode(words);
        let numText = "";
        for(let i = 10; i< words.length; i++){
            let word = words[i];
            numText+=record[toKey(word)]
        }
        sum+=Number(numText);
    }
    return sum;
}

const toKey = (word: string) => [...word].sort().join("");

/** Each character of "contains" is included in target*/
function contains(target: string, contains: string){
    let result = true;
    for(let char of contains){
        result &&= target.includes(char);
    }
    return result;
}

function decode(words: string[]): Record<string, string>{
    let workingset = [...words];
    let result: Record<string,string> = {};
    let map :string[] = new Array(10);
    const setWord = (word: string, value: number) =>{
        let key = toKey(word);
        map[value] = key
        result[key] = value.toString();
    }

    //find 1,4,7, and 8 by their distinct length
    for (let word of workingset){
        let length = word.length;
        if (length === 2){
            setWord(word, 1);
        }

        if (length === 4){
            setWord(word, 4);
        }

        if (length === 3){
            setWord(word, 7);
        }

        if (length === 7){
            setWord(word, 8);
        }
    }

    //find 0, 6 , 9
    for(let word of workingset){
        if (word.length === 6){
            //check if it's 9 if all the characters in 4 are contained 
            let isNine = contains(word, map[4]);
            if (isNine){
                setWord(word, 9);
            }else{
                //check if it's 0 if all characters in 1 are contained
                let isZero = contains(word, map[1]);
                if (isZero){
                    setWord(word, 0);
                }else{
                    //it's 6 otherwise
                    setWord(word, 6);
                }
            }
        }
    }

    //find 2, 3, and 5
    for(let word of workingset){
        if (word.length === 5){
            //check if it's 2
            //if some values in 2 are not contained in 9
            let isTwo = !contains(map[9], word);
            if (isTwo){
                setWord(word, 2);
            }else{
                //check if it's 3 if all characters in 7 are inclued
                let isThree = contains(word, map[7]);
                if (isThree){
                    setWord(word, 3)
                }else{
                    //it's 5 otherwise
                    setWord(word, 5);
                }
            }
        }
    }

    return result;
}

async function Main(){
    let values = await getValues('./txt/day08.txt')
    console.log("part 1: ", part1(values));
    console.log("part 2: ", part2(values));
}

Main();