/**
 * Created by Toma on 2017. 01. 28..
 */


var SnakeState = function () {
    var snakeHead  = new jaws.Sprite({image:"img/snakepart2.png", x:300, y:240, anchor:"center"});
    snakeHead.vx = 1;
    snakeHead.vy = 0;
    var pickup = new jaws.Sprite({image:"img/ball.png", x:Math.floor(Math.random() * 600), y:Math.floor(Math.random() * 480)});
    var snakeParts = [snakePart(0,240)];

    function snakePart(x, y){
        return new jaws.Sprite({image:"img/snakepart2.png", x:x, y:y, anchor:"center"});
    }

    var inputTimer = new ResettableTimeMeter();

    var R = 4;

     function collides(s) {
         return (snakeHead.x - s.x)*(snakeHead.x - s.x) + (snakeHead.y - s.y)*(snakeHead.y - s.y) < 4 * R * R;
     }

    function clampxy() {
        if (snakeHead.x > jaws.width) {snakeHead.x -= jaws.width;}
        if (snakeHead.x < 0) {snakeHead.x += jaws.width;}
        if (snakeHead.y > jaws.height) {snakeHead.y -= jaws.height;}
        if (snakeHead.y < 0) {snakeHead.y += jaws.height;}
    }
    function getAngle() {
        var a = 0;
        var s = updateAudioInput();
        if (s.valid && s.overThreshold) {
            a = -s.normalizedValue * 5;
        }
        return a;
    }

    var n = 5;
    var ONE_OVER_SPEED = 5;
    var gameOver = false;
    this.update = function() {
        if (!gameOver) {
            if(jaws.pressed("left a"))  { snakeHead.vx = -1 ; snakeHead.vy = 0;}
            if(jaws.pressed("right d"))  { snakeHead.vx = 1 ; snakeHead.vy = 0;}
            if(jaws.pressed("up w"))  { snakeHead.vx = 0 ; snakeHead.vy = -1;}
            if(jaws.pressed("down s"))  { snakeHead.vx = 0 ; snakeHead.vy = 1;}

            var input = getAngle();
            snakeHead.rotate(input);
            var dt = inputTimer.getDeltaTime();
            if (dt > 50) {
                dt = 50;
                inputTimer.reset();
                var l = snakeParts.length;
                var oldx = snakeHead.x;
                var oldy = snakeHead.y;
                snakeHead.x += Math.round(snakeHead.vx / ONE_OVER_SPEED * dt);
                snakeHead.y += Math.round(snakeHead.vy / ONE_OVER_SPEED * dt);
                for (var v2 = 3; v2 < l; ++v2) {
                    if (collides(snakeParts[v2])) {
                        gameOver = true;
                    }
                }
                snakeHead.x = oldx;
                snakeHead.y = oldy;
                var lastx = snakeParts[l - 1].x;
                var lasty = snakeParts[l - 1].y;
                for (var i = l - 1; i > 0; --i) {
                    snakeParts[i].x = snakeParts[i - 1].x;
                    snakeParts[i].y = snakeParts[i - 1].y;
                }
                snakeParts[0].x = snakeHead.x;
                snakeParts[0].y = snakeHead.y;
                input = input * 2 * Math.PI / 360;
                snakeHead.vx = Math.cos(input) * snakeHead.vx - Math.sin(input) * snakeHead.vy;
                snakeHead.vy = Math.cos(input) * snakeHead.vy + Math.sin(input) * snakeHead.vx;

                snakeHead.x += Math.round(snakeHead.vx / ONE_OVER_SPEED * dt);
                snakeHead.y += Math.round(snakeHead.vy / ONE_OVER_SPEED * dt);
                clampxy();

                if (n-- > 0) snakeParts.push(snakePart(lastx, lasty));

                if (gameOver) return;
                jaws.collide(snakeHead, pickup, function (a, b) {
                    pickup.x = Math.floor(Math.random() * 600);
                    pickup.y = Math.floor(Math.random() * 480);
                    snakeParts.push(snakePart(lastx, lasty));
                });
            }
        } else if (jaws.pressedWithoutRepeat("space")) {
            jaws.swichGameState(MenuState);
        }
    };

    this.draw = function() {
        jaws.clear();
        for (var k in snakeParts) {
            snakeParts[k].draw();
        }
        snakeHead.draw();
        pickup.draw();
    };

    this.setup = function() {};

};

