"use strict";

/**
 * Created by bala on 1/28/17.
 */

var AUDIO_INPUT_STATUS_LOADING = 0;
var AUDIO_INPUT_STATUS_UNSUPPORTED = 1;
var AUDIO_INPUT_STATUS_REQUESTED = 2;
var AUDIO_INPUT_STATUS_WORKING = 3;
var AUDIO_INPUT_STATUS_READY = 4;

var audioInputState = {
    status: AUDIO_INPUT_STATUS_LOADING,
    valid: false,
    lastRead: 0,
    confidence: 100,
    frequency: 440
}

function audioInputError(){
    audioInputState.status = AUDIO_INPUT_STATUS_UNSUPPORTED;
    throw "Some features are missing from your browser";
    return false;
};

window.AudioContext = window.AudioContext || window.webkitAudioContext || audioInputError();
if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || audioInputError();

function updateAudioInput() {
    return {
        status: AUDIO_INPUT_STATUS_READY,
        valid: true,
        lastRead: 0,
        confidence: 100,
        frequency: 440
    }
}
