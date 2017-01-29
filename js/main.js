function MenuState() {
    var index = 0
    var items = ["Not quite flappy", "Snakish", "Breakout thing"]

    this.setup = function() {
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
        index = 0;
        jaws.on_keydown(["down","s"],       function()  { index++; if(index >= items.length) {index=items.length-1} } )
        jaws.on_keydown(["up","w"],         function()  { index--; if(index < 0) {index=0} } )
        jaws.on_keydown(["enter","space"],  function()  {
            console.log("enter pressed");
            if(items[index]=="Not quite flappy") {/*jaws.switchGameState(FlappyGameState)*/ }
            if (items[index]=="Snakish") {jaws.switchGameState(SnakeState)}
            if (items[index]=="Breakout thing"){
            console.log("pressed breakout");
            jaws.switchGameState(/*BreakoutGameState*/)}
        })
    }

    this.draw = function() {
        jaws.context.clearRect(0,0,jaws.width,jaws.height)
        for(var i=0; items[i]; i++) {
            // jaws.context.translate(0.5, 0.5)
            jaws.context.font = "bold 25pt terminal";
            jaws.context.lineWidth = 10
            jaws.context.fillStyle =  (i == index) ? "Red" : "Black"
            jaws.context.strokeStyle =  "rgba(200,200,200,0.0)"
            jaws.context.fillText(items[i], 30, 100 + i * 60)
        }
    }
}

/*
 *
 * Our script-entry point
 *
 */
window.onload = function() {
    jaws.assets.add("img/ball.png");
    jaws.assets.add("img/snakepart2.png");
    jaws.start(MenuState);

}
