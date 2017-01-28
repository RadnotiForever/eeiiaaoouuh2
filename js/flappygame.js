/**
 * Created by szentsas on 1/28/17.
 */

function FlappyGameState() {

    var delta;
    var player;
    var consth, constv;
    var noOfObstacles=0;

    var obstacles = new jaws.SpriteList();

    //setup

    this.setup = function() {

        //player
        player = new jaws.Sprite({image: flappy_player.png, x: jaws.width * 0.1, y: jaws.height / 2, scale: 5})
        player.isAlive = true;
        player.v=0;

        jaws.on_keydown("esc",  function() { jaws.switchGameState(MenuState) });

        //obstacles
        for(var i = jaws.width / 3; i<=jaws.width*4/3; i+= (jaws.width / 3)) {
            obstacles.push(new Obstacle(i, Math.random()*0.8));
            noOfObstacles++;
        }
    }

    //update

    this.update = function() {
        //get delta
        delta = getDeltaTime();

        //get audio sample
        audio = updateAudioInput();

        //update player velocity
        if(audio.valid && audio.confidence > 20) {
            player.v = (Math.log(audio.frequency) - threshold);
        } else {
            if(Math.abs(player.v)>10) {
                player.v *= 0.8;
            } else {
                player.v = 0;
            }
        }

        //update player position
        player.x += player.v * delta * constv;

        //collide detection & :`(
        jaws.collide(player, obstacles, function(a, b) {a.isAlive=false});
        if(!player.isAlive) {
            console.log("MEGHALTÁÁÁÁL!!");
            jaws.switchGameState(MenuState);
        }


        //delete old obstacles outside of canvas
        obstacles.removeIf(OutsideCanvas);

        //spwn new obstacle
        if(obstacles[obstacles.length -1].x < jaws.width*4/3) {
            obstacles.push(new Obstacle(obstacles[obstacles.length -1].x + jaws.width/3, Math.random()*0.8));
            noOfObstacles++;
        }
    }


    //draw

    this.draw = function() {
        jaws.clear;                     //clear canvas
        player.draw();                  //draw player
        obstacles.draw();               //draw (and update :( ) all obstacles
    }


    //obstacle
    function Obstacle(x, h) {
        this.x=x;
        this.h=h;

        //update the obstacle
        this.draw = function() {
            this.x -+ delta*consth;
            jaws.context.drawImage(jaws.assets.get("img/flappy_obstacle.png"), this.x, this.y);
        }
    }

    //detects if something is very much left of the canvas
    function OutOfCanvas(a) {
        return a.x< -jaws.width/3;
    }
}
