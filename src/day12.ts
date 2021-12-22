import { readFile } from 'fs/promises';

type Graph = Map<string, string[]>;

const getInput = async () => {
    let edges = (await readFile('./txt/day12.txt', { encoding: 'utf8'}))
        .split(/\r?\n/)
        .map(line => line.split('-'));

    let graph = new Map<string, string[]>();
    const addNode = (node: string, neighbor: string) =>{
        let neighbors = graph.get(node) ?? [];
        neighbors.push(neighbor);
        graph.set(node,neighbors);
    }

    for(let [a,b] of edges){
        addNode(a,b);
        addNode(b,a);
    }
    return graph;
}

function part1(graph: Graph){
    let paths = 0;

    const traverse = (node: string, currentPath: string[]) =>{
        if (node.toLowerCase() === node && currentPath.includes(node)){
            return;
        }
        for(let neighbor of (graph.get(node)??[])){
            if (neighbor === "end"){
                paths++;
            }else{
                currentPath.push(node);
                traverse(neighbor,currentPath);
                currentPath.pop()
            }
        }
    }
    traverse("start",[]);
    return paths;
}

function part2(graph: Graph){
    let paths = 0;

    const existingLowercaseDupe = (array: string[]) => {
        //probably not efficient to have new sets everytime this runs
        let set = new Set<string>();
        for(let elem of array){
            if (set.has(elem) && elem === elem.toLowerCase()){
                return true;
            }
            set.add(elem);
        }
        return false;
    }

    const traverse = (node: string, currentPath: string[]) =>{
        if (node.toLowerCase() === node && currentPath.includes(node) && (node === "start" || existingLowercaseDupe(currentPath))){
            return;
        }
        for(let neighbor of (graph.get(node)??[])){
            if (neighbor === "end"){
                paths++;
            }else{
                currentPath.push(node);
                traverse(neighbor,currentPath);
                currentPath.pop()
            }
        }
    }
    traverse("start",[]);
    
    return paths;
}

(async function(){
    let input = await getInput();
    console.log("part 1: ", part1(input));
    console.log("part 2: ", part2(input));
})();