StarCoin
========

Crowdfunded Bitcoin Starcraft Tournaments and Showmatches

Getting Started
---------------

``` 
 $ npm install
 $ node app.js
```

#### Create a test matchup

```
 $ node test.js
```


API
---

### POST "/api/matchups/new"


#### parameters

```
region (required): Region the players are playing on. ie: "us" or "eu".

winCondition (optional): Number of wins required to with the matchup. Default: 3

start (optional): Time the matchup is scheduled to start. Default: Date.now()

name: (optional): Name of the matchup. Default: "SC2 Matchup"
```




### POST "/api/matchups/:privateToken/join"

#### parameters (all required)

```
name: player name

webId: battlenet id found in battlet.net profile URL

realm: found in the battle.net profile URL

bitcoinAddress: the player's bitcoin address to send winnings to.
```

#### Breakdown of profile URL

```
http://:region.battle.net/api/sc2/profile/:webId/:realm/:name/
```




### GET "/api/matchups/:publicToken"

#### response

```
name: matchup name
region: 
players: list of participating players
start: Datetime the matchup starts.
ended: Boolean - if the winCondition has been met
winCondition: number of victories required to win
results: list of match results
winners: array of winners if the matchup winCondition is met.
```
