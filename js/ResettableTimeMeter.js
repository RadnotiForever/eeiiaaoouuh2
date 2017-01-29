/**
 * Created by Toma on 2017. 01. 28..
 */

function ResettableTimeMeter(){
    var d = new Date();
    var lastt = d.getTime();

    this.getDeltaTime = function() {
        var t = new Date().getTime();
        return t - lastt;
    }
    this.reset = function() {
        lastt = new Date().getTime();
    }
}
