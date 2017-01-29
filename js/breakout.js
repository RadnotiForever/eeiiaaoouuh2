function BreakoutGameState() {

    var sc = 1;
    var ball;
    var accel = 5;
    var ballspeed = 250;
    var paddle;
    var deltameter = new DeltaTimeMeter();

    var blocks = [];
    var audio;

    this.setup = function() {
        console.log("start breakout")
        jaws.on_keydown("esc",  function() { jaws.switchGameState(MenuState) })
        sc = jaws.width / 600;
        ball = new jaws.Sprite({image: "img/ball.png", x: 300*sc, y:300*sc, scale: sc, anchor: "center"})
        ballspeed *= sc;
        accel *= sc;
        ball.vx = ballspeed*Math.cos(2)
        ball.vy = ballspeed*Math.sin(2);
        ball.radius = 8*sc;

        ball.update = function(delta) {
            ball.x += ball.vx * delta;
            ball.y += ball.vy * delta;
            if (ball.x < ball.radius)
                {ball.vx *= -1; ball.x = ball.radius}
            if (ball.x+ball.radius > 600 * sc)
                {ball.x = 600*sc-ball.radius; ball.vx *= -1}
            if (ball.y < ball.radius) {
                ball.vy *= -1; ball.y = ball.radius;
            }
            if (ball.y+ball.radius > 480 * sc)
            {ball.y = 480*sc-ball.radius; ball.vy *= -1}
        }
        paddle = new jaws.Sprite({image: "img/paddle.png", x: 300*sc, y:460*sc,
                                    scale: sc, anchor: "center"});
        paddle.v = function() {
            if (audio.confidence > 35) {
                var l1 = Math.log(1000);
                var l2 = Math.log(2000);
                var d = audio.frequency - (l1+l2)/2;
                d /= (l1-l2)/2;
                return d*500;
            }
            else {
                return 0;
            }
            /*if (jaws.pressed("left"))
                return -300*sc;
            else if (jaws.pressed("right"))
                return 300*sc;
            else
                return 0;*/


        }
        paddle.update = function(delta) {
            this.x += this.v()*delta;
            this.x = Math.min(this.x, 550*sc);
            this.x = Math.max(this.x, 50*sc);
        }

        for (var i = 0; i < 5; i++)
        {
            for (var j = (i%2)*40; j < 560; j += 80)
            {
                blocks.push(new jaws.Sprite({image: "img/block.png", scale: sc, x: j*sc, y: i*40*sc}))
            }
        }

    }

    this.update = function() {
        var delta = deltameter.getDeltaTime()/1000;
        audio = updateAudioInput();
        ball.update(delta);
        paddle.update(delta);

        if (jaws.collideOneWithOne(paddle, ball)) {
            ball.vx = (ball.x-paddle.x)/2;
            ball.vy = ball.y-paddle.y;
            var s = Math.sqrt((ball.vx*ball.vx + ball.vy*ball.vy));
            var m = ballspeed/s;
            ball.vx *= m;
            ball.vy *= m;
        }

        collideBallBlock = function(block) {
            var rectCircleColliding = function(circle,rect){
                var distX = Math.abs(circle.x - rect.x);
                var distY = Math.abs(circle.y - rect.y);

                if (distX > (rect.w/2 + circle.r)) { return false; }
                if (distY > (rect.h/2 + circle.r)) { return false; }

                if (distX <= (rect.w/2)) { return true; }
                if (distY <= (rect.h/2)) { return true; }

                var dx=distX-rect.w/2;
                var dy=distY-rect.h/2;
                return (dx*dx+dy*dy<=(circle.r*circle.r));
            }
            var rect = {x: (2*block.x+block.width)/2, y : (2*block.y+block.height)/2, w: block.width, h: block.height};
            var circle = {x: ball.x, y:ball.y, r: ball.radius};
            if(rectCircleColliding(circle, rect))
            {
                console.log("Found colliding block!")
                while(rectCircleColliding(rect,circle)) {
                    ball.x -= 0.00001*ball.vx;
                    ball.y -= 0.00001*ball.vy;
                    circle = {x: ball.x, y:ball.y, r: ball.radius};
                }
                if (ball.x > block.x && ball.x < block.x+block.width) {
                    block.horhit = true;
                    console.log("hor");
                }
                else if (ball.y > block.y && ball.y < block.y + block.height) {
                    block.verhit = true;
                    console.log("ver");
                }
                else {
                    block.corhit = true;
                    console.log("cor");
                }
                return true;
            }
            else
                return false;
        }
        var c = 0;
        for (var i = 0; blocks[i]; i++) {

            if(collideBallBlock(blocks[i]))
                c++;
        }
        for (var i = 0; blocks[i]; i++) {
            if (blocks[i].corhit) {
                if (c > 1)
                    blocks[i].corhit = false;
                else {
                    // !!
                    ball.vx *= -1;
                    ball.vy *= -1;
                    blocks.splice(i, 1);
                    i--;
                }
            }
            else if (blocks[i].horhit) {
                if (ball.x > blocks[i].x && ball.x < blocks[i].x + blocks[i].width)
                {
                    ball.vy *= -1;
                    blocks.splice(i, 1);
                    i--;
                }
                else
                {
                    blocks[i].horhit = false;
                }
            }
            else if (blocks[i].verhit) {
                if (ball.y > blocks[i].y && ball.y < blocks[i].y + blocks[i].height)
                {
                    ball.vx *= -1;
                    blocks.splice(i, 1);
                    i--;
                }
            }
        }
    }

    this.draw = function() {
        jaws.clear()
        ball.draw();
        paddle.draw();
        jaws.draw(blocks);
        jaws.context.font = "bold 25pt terminal";
        jaws.context.lineWidth = 10
        ;
        jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
        if (blocks.length == 0)
        {
            jaws.context.fillStyle = "Red"
            jaws.context.fillText("You win!", 220*sc, 250*sc);
        }
        else if (ball.y > 480*sc) {
            jaws.context.fillStyle = "Black"
            jaws.context.fillText("You lose... :(", 220*sc, 250*sc);
        }

    }
}
