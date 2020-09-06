# fantasy-capitalist
An Adventure Capitalist inspired experiment.

### Problem to be solved:
Honestly, Adventure Capitalist is a little boring. It is excellent at getting those Skinner Box hooks
into players, but is quite simple and certainly does not feel fulfilling.

Solution: Make it more complicated! Add semi-meaningful choices into the game so that the player is doing
a little bit of planning and balancing into their economic domination.
The planned design:
* Player purchases structures that produce various resources, but require resources from other structures to function.
* Increasing production capacity involves hiring more workers (an increasing cost) and leveling up workers (a further cost).
* Allow workers to be moved between structures so that skills gained at one structure can give bonuses at another (as well as just rebalancing their production/consumption - meaningful decision time!)
* Have quests every day for players to trade in resources (including leveled workers) for favor with external factions (refresh quests daily, keep them checking in!)
* Spend that favor gained to acquire upgrades (for example, healers for the Adventurers Guild reduce the healing potions required to run the Guild)

### Tech stuff
Relative to Adventure Capitalist, these changes are entirely client-side (so this experiment is all client side).
The game has been built using PixiJS, for two reasons:
* I think it would be very enjoyable to sit and watch animations of your structures/workers running, instead of just a bunch of boring bars going up.
* That is what I am familiar with.

The simulation code is separated from any interface code so that the simulation can easily be run on its own. This would be important for unit-tests, as they would be very important to validate that the "catching up" after inactivity gives as close an output as possible to letting the game run while open.

The interface code sort of brute-forces keeping in sync with the simulation for a couple reasons:
* As I have spent lots of time digging through the PixiJS internals, I know that setting values to the current value is ignored and doesn't have much of a CPU/GPU cost.
* If we expect the game to eventually be changing values constantly, then having an event system is just extra overhead when you'd be checking nearly every frame anyway.

Additionally, the design to spread growth out among different resource types means that (depending on game balance) we can go a lot longer before running into floating point precision issues, as `BigInt` is still new. However, this probably isn't a big deal anyway as the precision likely does not matter once you are abbreviating numbers as "quadrillion" and above.

### Current status of the game, relative to the design:
* The interface is obviously very rough, and lacks any sort of help guiding the player on what to do (as the goal was to make
the game more complicated).
    * The game isn't even properly responsive to window size, and that really should be fixed.
* Only the very basics are in the game right now
    * one multi-structure production change (I'd like to see multiple chains that sometimes meet)
    * workers can't be moved between structures
    * worker skills are not displayed (this is how what leveling really effects)
    * there are no quests/structural upgrades.
* The simulation code really should have unit tests.

### Link to Game:
https://andrewstart.github.io/fantasy-capitalist/

*NOTE:* May not work in Firefox due to content security error when loading Javascript. Chrome does not have this issue.


### Art credit
All of the art is from https://www.kenney.nl/