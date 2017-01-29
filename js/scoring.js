/**
 * Created by szentsas on 1/29/17.
 */


var game, score, user;

function ScoreBoardState() {



    var scoreboard = {}


    var place = 0, showingscore;

    this.setup = function() {
        try {_temp = localStorage.scoreboard;
        scoreboard = JSON.parse(_temp);
        } catch (e) {
            scoreboard = {
                "breakout":     [],
                "snake":        [],
                "flaps":        []
             }
        }
        console.log(scoreboard);
        for(place=0; place<scoreboard[game].length;place++) {
            if(score>scoreboard[game][place][0]) {
                break;
            }
        }
        /*scoreboard[game][place][0] = score;
        scoreboard[game][place][1] = user;*/
        scoreboard[game].splice(place, 0, [score, user]);
        localStorage.scoreboard = JSON.stringify(scoreboard);
        alert("Congratulations, you've got the " + ordinal(place+1) + " place!")
    }


    this.update = function() {
        if(jaws.pressed("enter")) {
            jaws.switchGameState(MenuState);
        }
    }

    this.draw = function() {
        if(!showingscore) {
            jaws.clear();
            jaws.context.textAlign = "left";
            jaws.context.font = "bold 25pt terminal";
            jaws.context.lineWidth = 10;
            jaws.context.strokeStyle =  "rgba(200,200,200,0.0)";
            jaws.context.fillStyle = "Black";
            for(var i=0;i<Math.min(5, scoreboard[game].length);i++){
                jaws.context.fillText(((i + 1) + ". " + scoreboard[game][i][1] + " " + scoreboard[game][i][0]), jaws.width/5, 60+i*60)
            }
            showingscore = true;
        }
    }


}

var newScore = function(_game, _score) {
    var _user = prompt("Please enter your name!", "Your Name");
    game = _game; score = _score; user = _user;
    jaws.switchGameState(ScoreBoardState);
    return;
}

function ordinal(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
