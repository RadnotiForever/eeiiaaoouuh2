/**
 * Created by Toma on 2017. 01. 28..
 */

function DeltaTimeMeter(){
    var d = new Date();
    var lastt = d.getTime();

    this.getDeltaTime = function() {
        var oldt = lastt;
        lastt = (new Date()).getTime();
        return lastt - oldt;
    }
}
