import {readFileSync} from 'fs';

/**@param segment{string} */
function parseSegment(segment){
    let [cost, name] = segment.trim().split(' ');
    return [Number(cost), name];
}

/**@param text{string} */
function getConversions(path){
    let text = readFileSync(path, {encoding: 'utf8'});
    let result = new Map();
    let lines = text.split(/\r*\n/);
    for(let line of lines){
        let [ingredientChunk, productChunk] = line.split(" => ");
        let ingredients = ingredientChunk.split(',').map(parseSegment);
        let [amount, productName] = parseSegment(productChunk);
        let produce = ({
            amount,
            ingredients
        });
        result.set(productName, produce);
    }
    return result;
}

/** #param conversions */
function part1(conversions){
    let remainder = new Map();
    const getCost = (required, name) => {
        if(name === "ORE"){
            return required;
        }
        //try to get remainder
        let remain = remainder.get(name)??0;
        if (remain < required){
            required-=remain;
            remainder.set(name, 0);
        }else{
            remainder.set(name, remain-required)
            return 0;//no additional ORE required
        }

        let produce = conversions.get(name);
        //calculate conversions
        let multiplier = Math.ceil(required/produce.amount);
        let leftover = produce.amount*multiplier-required;
        remainder.set(name, leftover+(remainder.get(name)??0));
        let cost = 0;
        for(let ingredient of produce.ingredients){
            cost += getCost(ingredient[0]*multiplier, ingredient[1]);
        }
        return cost;
    }

    return [getCost(1, "FUEL"), remainder];
}

function part2(costPerFuel, remainderPerFuel){
    let multiplier = Math.floor(1000000000000/costPerFuel);

    const canMakeAmount = (required, name, materialSource) => {
        //try to get remainder
        let remain = materialSource.get(name)??0;
        if (remain < required){
            required-=remain;
            materialSource.set(name, 0);
        }else{
            materialSource.set(name, remain-required)
            return true;//we have enough in the leftover to not request more material
        }

        if(name === "ORE"){
            return false;//we don't have enough material left
        }

        let produce = conversions.get(name);
        //calculate conversions
        let multiplier = Math.ceil(required/produce.amount);
        let leftover = produce.amount*multiplier-required;
        materialSource.set(name, leftover+(materialSource.get(name)??0));
        for(let ingredient of produce.ingredients){
            if(!canMakeAmount(ingredient[0]*multiplier, ingredient[1], materialSource)){
                return false;
            }
        }
        return true;
    }
    let count = 0;
    let materialSource = new Map([["ORE", 1000000000000]]);
    let power = 1000000000000;
    //this runs in Constant Time 13*10
    while(power>=1){
        let duplicate = new Map(materialSource);
        if (!canMakeAmount(power,"FUEL",duplicate)){
            power/=10;
        }else{
            materialSource=duplicate;
            count+=power;
        }
    }
    return count;
}

let conversions = getConversions('./input.txt');
let [costPerFuel, remainderPerFuel] =part1(conversions)
console.log("part 1:", costPerFuel);
console.log("part 2:", part2(costPerFuel, remainderPerFuel))