var rest = require('restler');

var base = "http://chaz.bp:3000/api/matchups/";
var d = new Date();
d.setDate(d.getDate() - 50);
var matchup = { region: "us", start: d, gameType: "1V1" };

var chaz = {
  bnetUrl: "http://us.battle.net/sc2/en/profile/2549153/1/Muse/",
  bitcoinAddress: "12345"
}

var eric = {
  bnetUrl: "http://us.battle.net/sc2/en/profile/3866178/1/remaeus/",
  bitcoinAddress: "12345"
}

var rob = {
  bnetUrl: "http://us.battle.net/sc2/en/profile/5356317/1/unusualbob/",
  bitcoinAddress: "12345"
}


rest.post(base + "new", {data: matchup }).on('complete', function(match, response) {
  console.log(match);
  rest.post(base + match.privateToken + "/join", {data: chaz}).on('complete', function(data, response) {
    console.log(data);
    //rest.post(base + match.privateToken + "/join", {data: eric}).on('complete', function(data, response) {
      console.log(data);
      rest.post(base + match.privateToken + "/join", {data: rob}).on('complete', function(data, response) {
        console.log(data);
        rest.get(base + match.privateToken + "/").on('complete', function(data, response) {
          console.log(data);
        });
      });
    //});
  });
});