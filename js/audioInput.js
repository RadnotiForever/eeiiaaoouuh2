"use strict";

/**
 * Created by bala on 1/28/17.
 */

var AUDIO_INPUT_STATUS_LOADING = 0;
var AUDIO_INPUT_STATUS_UNSUPPORTED = 1;
var AUDIO_INPUT_STATUS_REQUESTED = 2;
var AUDIO_INPUT_STATUS_WORKING = 3;
var AUDIO_INPUT_STATUS_READY = 4;
var AUDIO_INPUT_TARGET_RESOLUTION = 1024;
var AUDIO_INPUT_CUTOFF = 11025;
var AUDIO_INPUT_MINFREQ = 65; // save the americans
var AUDIO_INPUT_NOISE_PROFILE_INTERVAL = 50;
var AUDIO_INPUT_NOISE_PROFILE_COUNT = 100;
var PHI = (1 + Math.sqrt(2)) / 2;

var audioInputState = {
    status: AUDIO_INPUT_STATUS_LOADING,
    valid: false,
    lastRead: 0,
    confidence: 100,
    frequency: 440
}

var audioInputPrivate = {};

function audioInputError(){
    audioInputState.status = AUDIO_INPUT_STATUS_UNSUPPORTED;
    throw "Some features are missing from your browser";
    return false;
}

window.AudioContext = window.AudioContext || window.webkitAudioContext || audioInputError();
if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || audioInputError();

function audioInputInit(){
    audioInputState.status = AUDIO_INPUT_STATUS_REQUESTED;
    navigator.getUserMedia({audio: true, video: false}, audioInputInit2, audioInputError);
}

function audioInputInit2(stream){
    audioInputPrivate.context = new AudioContext();
    audioInputPrivate.mediaStream = stream;
    audioInputPrivate.analyzer = audioInputPrivate.context.createAnalyser();
    audioInputPrivate.source = audioInputPrivate.context.createMediaStreamSource(stream);
    audioInputState.status = AUDIO_INPUT_STATUS_WORKING;
    var targetFFTSize = (2 * AUDIO_INPUT_TARGET_RESOLUTION) / AUDIO_INPUT_CUTOFF * (audioInputPrivate.context.sampleRate / 2);
    audioInputPrivate.fftSize = 1 << (Math.ceil(Math.log2(targetFFTSize))|0);
    audioInputPrivate.fftBinSize = (audioInputPrivate.context.sampleRate / 2) / (audioInputPrivate.fftSize /     2);
    audioInputPrivate.firstInterestingBin = (AUDIO_INPUT_MINFREQ / audioInputPrivate.fftBinSize) | 0;
    audioInputPrivate.lastInterestingBin = (AUDIO_INPUT_CUTOFF / audioInputPrivate.fftBinSize) | 0;
    audioInputPrivate.analyzer.fftSize = audioInputPrivate.fftSize;
    audioInputPrivate.source.connect(audioInputPrivate.analyzer, 0, 0);
    audioInputPrivate.zeroGain = audioInputPrivate.context.createGain();
    audioInputPrivate.zeroGain.value = 0.0;
    audioInputPrivate.analyzer.connect(audioInputPrivate.zeroGain);
    audioInputPrivate.zeroGain.connect(audioInputPrivate.context.destination);
    audioInputPrivate.noiseBuffer = new Float32Array(audioInputPrivate.lastInterestingBin);
    audioInputPrivate.noiseSamples = 0;
    audioInputPrivate.noiseCollectInterval = setInterval(collectNoiseProfiles, AUDIO_INPUT_NOISE_PROFILE_INTERVAL)
}

function collectNoiseProfiles(){
    var currentSample = new Float32Array(audioInputPrivate.fftSize/2);
    audioInputPrivate.analyzer.getFloatFrequencyData(currentSample);
    for(var i = 0; i < audioInputPrivate.lastInterestingBin; i++){
        audioInputPrivate.noiseBuffer[i] += currentSample[i];
    }
    if(++audioInputPrivate.noiseSamples >= AUDIO_INPUT_NOISE_PROFILE_COUNT) {
        for (var i = 0; i < audioInputPrivate.lastInterestingBin; i++)
            audioInputPrivate.noiseBuffer[i] /= AUDIO_INPUT_NOISE_PROFILE_COUNT;
        clearInterval(audioInputPrivate.noiseCollectInterval);
        audioInputState.status = AUDIO_INPUT_STATUS_READY;
        audioInputState.valid = true;
        updateAudioInput();
    }
}

function updateAudioInput() {
    if(audioInputState.status == AUDIO_INPUT_STATUS_READY){
        var sample = new Float32Array(audioInputPrivate.fftSize/2);
        audioInputPrivate.analyzer.getFloatFrequencyData(sample);
        var weightsNR = new Float32Array(audioInputPrivate.lastInterestingBin);
        for(var i = audioInputPrivate.firstInterestingBin; i < audioInputPrivate.lastInterestingBin; i++){
            weightsNR[i] = sample[i] - audioInputPrivate.noiseBuffer[i];
        }
        var weights = new Float32Array(audioInputPrivate.lastInterestingBin/2);
        for(var i = audioInputPrivate.firstInterestingBin; i < audioInputPrivate.lastInterestingBin/2; i++) {
            weights[i] = weightsNR[i] + 0.5 * weightsNR[2 * i] - 0.5 * weightsNR[(PHI * i) | 0];
        }
        var avgWeight = 0;
        var maxWeight = -Infinity;
        var maxWeightIndex = -1;
        for(var i = audioInputPrivate.firstInterestingBin; i < audioInputPrivate.lastInterestingBin/2; i++) {
            avgWeight += weights[i];
            if(weights[i] > maxWeight){
                maxWeight = weights[i];
                maxWeightIndex = i;
            }
        }
        avgWeight /= audioInputPrivate.lastInterestingBin/2 - audioInputPrivate.firstInterestingBin;
        audioInputState.frequency = maxWeightIndex * audioInputPrivate.fftBinSize;
        audioInputState.confidence = maxWeight-avgWeight;
    }
    return audioInputState;
}

$(audioInputInit);
