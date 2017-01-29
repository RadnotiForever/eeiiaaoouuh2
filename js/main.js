function MenuState() {

    var index = 0;
    var items = ["Not so flappy", "Snakish", "Breakout thing", "Calibration"];
    var ready = false;

    this.setup = function() {

        /*canvas = document.getElementById("canvas"); //resize canwas to full"screen"
         canvas.width = document.body.clientWidth;
         canvas.height = document.body.clientHeight;*/


        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
        index = 0;
        jaws.on_keydown(["down","s"],       function()  { index++; if(index >= items.length) {index=items.length-1} } )
        jaws.on_keydown(["up","w"],         function()  { index--; if(index < 0) {index=0} } )
        jaws.on_keydown(["enter","space"],  function()  {
            console.log("enter pressed");
            if (!ready)
                return;
            if(items[index]=="Not so flappy") {console.log("pressed flappy"); jaws.switchGameState(FlappyGameState) }
            if (items[index]=="Snakish") {console.log("pressed snake"); jaws.switchGameState(SnakeState)}
            if (items[index]=="Breakout thing"){
                jaws.switchGameState(BreakoutGameState)}
            if (items[index] == "Calibration") {
                jaws.switchGameState(CalibrateState);
            }
        })
    }

    this.draw = function() {
        ready = updateAudioInput().valid;
        jaws.context.clearRect(0,0,jaws.width,jaws.height)
        for(var i=0; items[i]; i++) {
            // jaws.context.translate(0.5, 0.5)
            jaws.context.font = "bold 25pt terminal";
            jaws.context.textAlign = "left";
            jaws.context.lineWidth = 10
            jaws.context.fillStyle =  (i == index) ? "Red" : "Black"
            jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
            jaws.context.fillText(items[i], 30, 100 + i * 60)
        }
    }
}

function CalibrateState() {

    var time = 0;
    var deltameter = new DeltaTimeMeter();
    var lowsum = 0; var lowc = 0; var highsum = 0; var highc = 0;
    var gotNoise = false;

    this.setup = function() {
        console.log("starting calibration")
    }

    this.update = function(){
        time += deltameter.getDeltaTime();
        if (time > 1000 && time < 5000) {
            var res = updateAudioInput();
            if (res.overThreshold) {
                lowc++;
                lowsum += Math.log(res.frequency);
            }
            else lc2++;
        }
        else if (time > 7000 && time < 11000) {
            var res = updateAudioInput();
            if (res.overThreshold) {
                highc++;
                highsum += Math.log(res.frequency);
            }
            else hc2++;
        }
        else if (time > 12000) {
            var res = updateAudioInput();
            if (!gotNoise){
                if (lowc > 30 && highc > 30) {
                    var low = lowsum/lowc;
                    var high = highsum/highc;
                    calibrateAudioInput(low, high);
                }
                gotNoise = true;
                startNoiseCollection();
            } else if (res.valid) {
                jaws.switchGameState(MenuState);
            }
        }

    }

    this.draw = function() {

        jaws.context.clearRect(0,0,jaws.width,jaws.height)
        jaws.context.font = "bold 25pt terminal";
        jaws.context.textAlign = "left";
        jaws.context.lineWidth = 10
        jaws.context.fillStyle = "Black"
        jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
        if (time < 5000) {
            jaws.context.fillText("Make a low pitched sound", 100, 220);
        }
        else if (time > 6000 && time < 11000) {
            jaws.context.fillText("Make a high pitched sound", 100, 220);
        }
        else if (time > 11000 && time < 12000) {
            if (highc > 30 && lowc > 30) {
                jaws.context.fillText("Calibration successful", 100, 220);
            } else {
                jaws.context.fillText("Calibration failed", 100, 220);
            }
        }
        else if (time > 13000) {
            jaws.context.fillText("Sampling background noise...", 40, 220);
        }
    }
}

/*
 *
 * Our script-entry point
 *
 */
window.onload = function() {
    jaws.assets.add("img/flappy_player.png");
    jaws.assets.add("img/flappy_obstacle.png");
    jaws.assets.add("img/flappy_obstacle2.png");
    jaws.assets.add("img/ball.png");
    jaws.assets.add("img/paddle.png");
    jaws.assets.add("img/block.png");
    jaws.assets.add("img/snakepart2.png");
    jaws.start(MenuState);

}
