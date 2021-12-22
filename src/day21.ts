function part1(players: [number,number]){
    let turns = 0;
    let score:[number,number] = [0,0];
    let position:[number,number] = [players[0],players[1]];
    let index=0;

    const getNextDice = () => (index++%100)+1;
    const newPosition = (start: number) => {
        let value = getNextDice()+getNextDice()+getNextDice()+start;
        let index = value%10;
        return index+1;
    }

    while (true){
        position[0]=newPosition(position[0]-1);
        score[0]+=position[0];
        turns++;
        if (score[0]>=1000) break;

        position[1]=newPosition(position[1]-1);
        score[1]+=position[1];
        turns++;
        if(score[1]>1000) break;
    }

    let min = Math.min(...score);
    return min*turns*3;
}

//used for memo
function toKey(player1:number, player2:number, score1: number, score2: number){
    return player1+","+player2+","+score1+","+score2;
}

//Dynamic Programming :o
function part2(players:[number, number]){
    let memo = new Map<string,[win1: number, win2: number]>();
    let combinations:number[] = []; 
    for(let x=1; x<=3; x++){
        for(let y=1; y<=3; y++){
            for(let z=1; z<=3; z++){
                combinations.push(x+y+z);
            }
        }
    }

    function whoWins(position1: number, position2: number, score1: number, score2: number,){
        let key = toKey(position1, position2, score1, score2);
        let memoized = memo.get(key);
        if (memoized !== undefined){
            return memoized;
        }
        let result:[number,number] = [0,0];
        //now run the function
        for(let firstVal of combinations){
            let position1Updated = ((firstVal+position1-1)%10)+1;
            let score1Update = score1+position1Updated;
            //if we win just end the game and count the win
            if (score1Update >= 21){
                result[0]++;
            }else{
                //if we lose continue the game with player 2
                for(let secondVal of combinations){
                    let position2Updated = ((secondVal+position2-1)%10)+1;
                    let score2Update = score2+position2Updated;
                    if (score2Update >= 21){
                        result[1]++;
                    }else{
                        //if player 2 doesn't win, continue the game with player 1 recursively
                        let newChanges = whoWins(position1Updated, position2Updated, score1Update, score2Update);
                        result[0]+=newChanges[0];
                        result[1]+=newChanges[1];
                    }
                }
            }
        }
        memo.set(key, result);
        return result;
    }
    let scores = whoWins(players[0],players[1],0,0);
    return Math.max(...scores);
}

//hardcode values
console.log("part 1: ", part1([4,5]));
console.log("part 2: ", part2([4,5]));