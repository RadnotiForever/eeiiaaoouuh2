/**
 * Created by bala on 1/28/17.
 */

function atupdate(){
    var data = updateAudioInput();
    $("#barf").width(data.frequency/2);
    $("#barc").width(data.confidence);
    requestAnimationFrame(atupdate);
}

$(function () {
    requestAnimationFrame(atupdate);
})
