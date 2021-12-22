import { readFile } from 'fs/promises';

const readHexadecimal = async () => 
    (await readFile('./txt/day16.txt', { encoding: 'utf8'}))
        .trim();

class BitArray{
    #hex: string;
    #bitMap: Map<string, number[]>;
    constructor(hex: string){
        this.#hex = hex;
        this.#bitMap = new Map([
            ["0",[0,0,0,0]],["1",[0,0,0,1]],["2",[0,0,1,0]],["3",[0,0,1,1]],
            ["4",[0,1,0,0]],["5",[0,1,0,1]],["6",[0,1,1,0]],["7",[0,1,1,1]],
            ["8",[1,0,0,0]],["9",[1,0,0,1]],["A",[1,0,1,0]],["B",[1,0,1,1]],
            ["C",[1,1,0,0]],["D",[1,1,0,1]],["E",[1,1,1,0]],["F",[1,1,1,1]],
        ]);
    }

    #toBitArray(char: string){
        const result = this.#bitMap.get(char);
        if (result === undefined){
            throw new Error("illegal character: "+char);
        }
        return result;
    }

    readBits(startIndex: number, endIndex: number){//end is inclusive
        //starting character
        let startCharIndex = Math.floor(startIndex/4);
        let endCharIndex = Math.floor(endIndex/4);
        let result = [];
        for(let charIterator = startCharIndex; charIterator <= endCharIndex; charIterator++){
            let character = this.#hex[charIterator];
            let bitArray = this.#toBitArray(character);
            for(let bitIterator=0; bitIterator<4; bitIterator++){
                let bitIndex = (charIterator*4)+bitIterator;
                if (bitIndex >= startIndex && bitIndex <= endIndex){
                    result.push(bitArray[bitIterator]);
                }
            }
        }
        return result;
    }
}

interface ValuePacket{
    version: number;
    type: 4;
    value: bigint;
    startIndex: number;//inclusive
    endIndex: number;//not inclusive
}

interface OpPacket{
    version: number;
    type: 0|1|2|3|5|6|7; 
    subpacket: Packet[];
    startIndex: number;//inclusive
    endIndex: number;//not inclusive
}

type Packet = OpPacket|ValuePacket;

function toPackets(hex: string):Packet{
    const bitReader = new BitArray(hex);

    const toNumber = (array: number[]) => {
        let num = 0;
        for(let i=0; i<array.length; i++){
            num<<=1;
            num+=array[i];
        }
        return num;
    }

    const readPacket = (startIndex: number) => {
        //read the first 3 bits
        let version = toNumber(bitReader.readBits(startIndex, startIndex+2));
        let type = toNumber(bitReader.readBits(startIndex+3, startIndex+5));
        if (type ===4){
            let value = 0n;
            let i = startIndex+6
            for(; ;i+=5){
                let chunk = bitReader.readBits(i, i+4);//get next 5 bits
                let end = chunk.shift() === 0;
                value = value<<4n;
                value = value+BigInt(toNumber(chunk));//I hope values are supported by numbers...they weren't needed to use BigInt.
                if (end){
                    break;
                }
            }

            return {
                version,
                type,
                value,
                startIndex,
                endIndex: i+5
            } as ValuePacket;
        }else{
            //operator
            let lengthType = bitReader.readBits(startIndex+6,startIndex+6)[0];
            let packets:Packet[] = [];
            let endIndex = startIndex;
            if (lengthType===0){
                //length in bits
                let bitLength = toNumber(bitReader.readBits(startIndex+7, startIndex+21));//next 15 bits are bit length
                endIndex = startIndex+22+bitLength;
                for(let startIterator = startIndex+22; startIterator<endIndex; ){
                    let packet = readPacket(startIterator);
                    packets.push(packet);
                    startIterator = packet.endIndex;
                }
            }else{
                //packet count
                let packetCount = toNumber(bitReader.readBits(startIndex+7, startIndex+17));//next 11 bits are packet count
                let startIterator = startIndex+18;
                for(let i=0; i<packetCount; i++){
                    let packet = readPacket(startIterator);
                    packets.push(packet);
                    endIndex = startIterator = packet.endIndex;
                }
            }

            return {
                version,
                type,
                subpacket: packets,
                startIndex,
                endIndex
            } as OpPacket;
        }
    }
    return readPacket(0);
}

function part1(hex: string){
    let packet = toPackets(hex);
    let versionSum = 0;
    const recurseSum =(packet: Packet) =>{
        versionSum+=packet.version;
        if (packet.type !== 4){
            for(let subpacket of packet.subpacket){
                recurseSum(subpacket);
            }
        }
    }
    recurseSum(packet);
    return versionSum;
}

function part2(hex: string){
    let packet = toPackets(hex);
    const getValue: (packet:Packet)=> bigint = (packet: Packet) => {
        switch(packet.type){
            case 0:{
                let sum = 0n;
                for (let sub of packet.subpacket){
                    sum += getValue(sub);
                }
                return sum;
            }
            case 1:{
                let product =1n;
                for (let sub of packet.subpacket){
                    product*=getValue(sub);
                }
                return product;
            }
            case 2:{
                let min = BigInt(Number.MAX_SAFE_INTEGER);
                for (let sub of packet.subpacket){
                    let val = getValue(sub);
                    if (val<min){
                        min=val;
                    }
                }
                return min;
            }
            case 3:{
                let max = BigInt(Number.MIN_SAFE_INTEGER);
                for (let sub of packet.subpacket){
                    let val = getValue(sub);
                    if (val>max){
                        max=val;
                    }
                }
                return max;
            }
            case 4:{
                return packet.value;
            }
            case 5:{
                return getValue(packet.subpacket[0]) > getValue(packet.subpacket[1]) ? 1n : 0n;
            }
            case 6:{
                return getValue(packet.subpacket[0]) < getValue(packet.subpacket[1]) ? 1n : 0n;
            }
            case 7:{
                return getValue(packet.subpacket[0]) === getValue(packet.subpacket[1]) ? 1n : 0n;
            }
            default:
                throw new Error("Illegal Type");
        }
    }
    return getValue(packet);
}

(async function(){
    let hex = await readHexadecimal();
    console.log("part 1: ", part1(hex));
    console.log("part 2: ", part2(hex));
})()