/**
 * Created by Toma on 2017. 01. 28..
 */


var SnakeState = function () {
    var snakeHead  = new jaws.Sprite({image:"img/snakepart2.png", x:300, y:240});
    snakeHead.vx = 1;
    snakeHead.vy = 0;
    //var pickup = new jaws.Sprite({image:"img/snakepart2.png", x:Math.floor(Math.random() * 600), y:Math.floor(Math.random() * 480)});
    var snakeParts = [];
    for (var v = 0; v < 3; ++v) {
        snakeParts.push(new jaws.Sprite({image:"img/snakepart2.png", x:300 - v * 5, y:240}))
    }

    var inputTimer = new ResettableTimeMeter();

    function snakePart(x, y){
        return new jaws.Sprite({image:"img/snakepart2.png", x:x, y:y, anchor:"center"});
    }

    function clampxy() {
        if (snakeHead.x > jaws.width) {snakeHead.x -= jaws.width;}
        if (snakeHead.x < 0) {snakeHead.x += jaws.width;}
        if (snakeHead.y > jaws.height) {snakeHead.y -= jaws.height;}
        if (snakeHead.y < 0) {snakeHead.y += jaws.height;}
    }

    var SPEED = 0.1;
    var gameOver = false;
    this.update = function() {
        if (!gameOver) {
            if(jaws.pressed("left a"))  { snakeHead.vx = -1 ; snakeHead.vy = 0;}
            if(jaws.pressed("right d"))  { snakeHead.vx = 1 ; snakeHead.vy = 0;}
            if(jaws.pressed("up w"))  { snakeHead.vx = 0 ; snakeHead.vy = -1;}
            if(jaws.pressed("down s"))  { snakeHead.vx = 0 ; snakeHead.vy = 1;}
            //var input = Math.random() / 2;
            //snakeHead.rotate(Math.floor(input / 2 / Math.PI * 360));
            var dt = inputTimer.getDeltaTime();
            if (dt > 200) {
                inputTimer.reset();
                var l = snakeParts.length;
                //var lastx = snakeParts[l - 1].x;
                //var lasty = snakeParts[l - 1].y;
                for (var i = l - 1; i > 0; --i) {
                    snakeParts[i].x = snakeParts[i - 1].x;
                    snakeParts[i].y = snakeParts[i - 1].y;
                }
                snakeParts[0].x = snakeHead.x;
                snakeParts[0].y = snakeHead.y;
                //snakeHead.vx = Math.cos(input) * snakeHead.vx - Math.sin(input) * snakeHead.vy;
                //snakeHead.vx = Math.cos(input) * snakeHead.vy + Math.sin(input) * snakeHead.vx;
                snakeHead.x += Math.round(snakeHead.vx * SPEED * dt);
                snakeHead.y += Math.round(snakeHead.vy * SPEED * dt);
                clampxy();
                jaws.collide(snakeHead, snakeParts, function (a, b) {
                    //gameOver = true;
                });
                if (gameOver) return;
                /*jaws.collide(snakeHead, pickup, function (a, b) {
                    pickup.x = Math.floor(Math.random() * 600);
                    pickup.y = Math.floor(Math.random() * 480);
                    snakeParts.push(snakePart(lastx, lasty));
                });*/
            }
        }
    };

    this.draw = function() {
        jaws.clear();
        for (var k in snakeParts) {
            snakeParts[k].draw();
        }
        snakeHead.draw();
        //pickup.draw();
    };

    this.setup = function() {};

};

