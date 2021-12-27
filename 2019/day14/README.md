# [Day 14 2019](https://adventofcode.com/2019/day/14) in Javascript with Node 16.13 

I wanted to do an old challenge. I did the first 13 problems of 2019 so why not return to what I didn't complete.
Here is an explanation of my logic and thought process.

## Part 1 

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

So, I started taking into account the remainder for each element. During conversion you may be left with unused elements. Keep track of them and we can potentially use it in the future for a different step. I maintained a Map with key value pairs of element names and the remainder of each I have left after a step.

If you have enough in our remainder to pay the cost of conversion, then you don't have to keep asking for more sub elements, since you already have the material to make it!

## Part 2 - Logic and Thought Process

This one also had me thinking a bit.

### First Wrong Approach - Divide and Run

My first instinct was to divide ORE cost i.e. `1000000000000` by cost of 1 Fuel.
I then modify my `getCost` to become a boolean function `canMakeAmount` returns true if you have enough ORE to make the requested amount.
That was **WRONG** because we weren't taking into acount the remainder and how it behaves each iteration.

### Second Wrong Approach - Just run brute force

Now that we knew the issue, we could naively run `canMakeAmount` and incremement a counter each time it runs with the initial map of { { "ORE" : 1000000000000 }}. This was FAR TOO SLOW. It worked but it had a terrible runtime since we keep on making them in 1 incriment. I think it took 10+ minutes to get the result, so I thought a bit more...can we do better than increments of 1?...

### Third Times the Charm - Leverage Cool Property

I thought of a cool property. 
Hey, why don't we still use `canMakeAmount` but do it from greater increments of 10 and work our way down by 10. i.e.
If an increment can make fuel, we add it to the counter and try again. If it cannot we divide by 10 and try again.
We start at our starting position 1000000000000, and just work our way down to the 1's place.

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

The cool thing is that this runs `canMakeAmount` at most (13\*9: 13 digit positions with 1-9 increments). `117` times we'll ever run this on worst runtime, which is a wayyyyy better runtime than 10 minutes with `1993284` computations.

So that's my thought process and the best solution I could think of :)
