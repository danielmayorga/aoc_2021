# [Day 14 2019](https://adventofcode.com/2019/day/14) in Javascript with Node 16.13 

I wanted to do an old challenge. Here is explanation of my logic and thought process

## Part 1 - Logic and Thought Process

I tried doing it without thinking at first. I naively kept on getting the wrong answer, so I thought a bit through the example. 

```
10 ORE => 10 A
1 ORE => 1 B
7 A, 1 B => 1 C
7 A, 1 C => 1 D
7 A, 1 D => 1 E
7 A, 1 E => 1 FUEL
```

For A, you don't require 40 ORE, you require 30. This is because 1 FUEL => 28 A and 1 B.

So, I started taking into account the remainder for each element. I maintained a Map with key value pairs of Element Name(i.e. FUEL, ...) and the remainder of each I have left after a step.

If you have enough remainder to pay the cost of conversion, then you don't have to keep asking for more ORE, since you already have the material to make it!

## Part 2 - Logic and Thought Process

This one also had me thinking a bit.

### First Wrong Approach - Divide and Run

My first instinct was to divide by cost per Fuel by total cost `1000000000000`, and then modify my `getCost` to become a boolean function `canMakeAmount` and run canMakeAmount until I run out of ORE. That was **WRONG** because we weren't taking into acount the remainder and how it behaves each iteration.

### Second Wrong Approach - Just run brute force

Now that we knew the issue, we could naively run `canMakeAmount` and incremement a counter each time it runs with the initial map of { { "ORE" : 1000000000000 }}. This was FAR TOO SLOW. It worked but it had a terrible runtime. I think it took 10 minutes to get the result.

#### Third Times the Charm - Leverage Cool Property

I thought of a cool property. Hey, why don't we still use `canMakeAmount` but do it from greater increments of 10 and work our way down by 10. i.e. 
```
Keep running as long as you can make fuel for 
1000000000000
if yes, then increment count by that amount.
if no, then...
keep runnin as long as you can make fuel for
100000000000
...
10000000000
...
1000000000
...
I think you get the idea
...
1000
...
100
...
10
...
1
```

The cool think is that this runs `canMakeAmount` at most (13*10). `130` which is a wayyyyy better runtime than 10 minutes with `1993284` computations.

So that's my thought process and the best solution I could think of :) 