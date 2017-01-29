/**
 * Created by szentsas on 1/28/17.
 * #icbuggy
 */

function FlappyGameState() {

    var delta;
    var deltameter = new DeltaTimeMeter();
    var player;
    var consth = 0.1, constv = 0.01;
    var noOfObstacles=0;

    var obstacles = [];
    var obstacles2 = [];

    //setup

     this.setup = function() {

        //player
        player = new jaws.Sprite({image: "img/flappy_player.png", x: jaws.width * 0.1, y: jaws.height / 2, scale: 2})
        player.isAlive = true;
        player.v=0;

        jaws.on_keydown("esc",  function() { jaws.switchGameState(MenuState) });

        //obstacles
         obstacles.push(new jaws.Sprite({x: jaws.width*3/2,
             y: (Math.random()*0.7+0.2)*jaws.height,
             image: "img/flappy_obstacle.png"}));
         obstacles2.push(new jaws.Sprite({x: obstacles[obstacles.length-1].x,
             y: obstacles[obstacles.length-1].y-1.3*jaws.height,
             image: "img/flappy_obstacle2.png"}));
        /*for(var i = jaws.width / 3; i<=jaws.width*4/3; i+= (jaws.width / 3)) {
            obstacles.push(new jaws.Sprite({x: i,
                y: (Math.random()*0.7+0.2)*jaws.height,
                image: "img/flappy_obstacle.png"}));
            noOfObstacles++;
        }

         for(var i=0;i<obstacles.length;i++) {
             obstacles2.push(new jaws.Sprite({x: obstacles[i].x,
                 y: obstacles[i].y-1.3*jaws.height,
                 image: "img/flappy_obstacle2.png"}));
         }*/
    }

    //update

    this.update = function() {
        //get delta
        delta = deltameter.getDeltaTime();

        //get audio sample
        audio = updateAudioInput();

        //update player velocity
        if(audio.valid && audio.confidence > 20) {
            player.v = (Math.log(audio.frequency) - Math.log(1300);
        }
        /*
        if(jaws.pressed("down")) {
            player.v=10;
        } else if(jaws.pressed("up")) {
            player.v=-10;
        } else {
            player.v=0;
        }*/

        //update player position
        player.y += player.v * delta * constv;
        player.y=Math.max(player.y, 0);
        player.y=Math.min(player.y, jaws.height-19);

        //collide detection & :`(
        jaws.collide(player, obstacles, function(a, b) {a.isAlive=false});
        jaws.collide(player, obstacles2, function(a, b) {a.isAlive=false});
        if(!player.isAlive) {
            console.log("MEGHALTÁÁÁÁL!!");
            jaws.switchGameState(MenuState);
        }


        //delete old obstacles outside of canvas
        while (OutOfCanvas(obstacles[0])) {
            obstacles.splice(0, 1);
            obstacles2.splice(0, 1);
        }

        //spwn new obstacles
        if(obstacles[obstacles.length -1].x < jaws.width*3/2) {
            obstacles.push(new jaws.Sprite({x: obstacles[obstacles.length -1].x + jaws.width/2,
                                            y: (Math.random()*0.7+0.2)*jaws.height,
                                            image: "img/flappy_obstacle.png"}));

            obstacles2.push(new jaws.Sprite({x: obstacles[obstacles.length-1].x,
                y: obstacles[obstacles.length-1].y-1.3*jaws.height,
                image: "img/flappy_obstacle2.png"}));

            noOfObstacles++;
        }
        /*console.log('obstacles:')
        console.log(obstacles[0].x)
        console.log(obstacles[obstacles.length-1].x)*/

    }


    //draw

    this.draw = function() {
        jaws.clear();                               //clear canvas
        player.draw();                              //draw player
        for (i=0; i<(obstacles.length); i++) {
                    obstacles[i].x -= delta*consth;
                    obstacles2[i].x -= delta*consth;
                    obstacles[i].draw();            //draw (and update :( ) all obstacles
                    obstacles2[i].draw();
        }

    }


    //detects if something is very much left of the canvas
    function OutOfCanvas(a) {
        return (a.x< (-jaws.width/3));
    }
}
