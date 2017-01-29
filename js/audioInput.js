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
var KERNEL_GAUSSIAN = [.006, .061, .242, .382, .242, .061, .006];
var AUDIO_INPUT_CONSERVATIVE_COEFF = 30;
var AUDIO_INPUT_CONSERVATIVE_SIGMA = 200;
var AUDIO_INPUT_THRESHOLD = 60;
var PHI = (1 + Math.sqrt(5)) / 2;

var audioInputState = {
    status: AUDIO_INPUT_STATUS_LOADING,
    valid: false,
    lastRead: 0,
    confidence: 100,
    frequency: 440,
    overThreshold: false,
    normalizedValue: 0
};

var audioInputPrivate = {
    calibrationLow: Math.log(1000),
    calibrationHigh: Math.log(1700)
};

function audioInputError(){
    audioInputState.status = AUDIO_INPUT_STATUS_UNSUPPORTED;
    throw "Some features are missing from your browser";
    return false;
}

function convolve(buffer1, buffer2, from, to, kernel){
    var offset = -((kernel.length/2)|0);
    for(var i = from; i < to; i++){
        for(var j = 0; j < kernel.length; j++){
            if(i+j+offset < 0 || i + j + offset >= buffer1.length) continue;
            buffer2[i] += buffer1[i + j + offset] * kernel[j];
        }
    }
}

function calibrateAudioInput(low, high){
    audioInputPrivate.calibrationLow = Math.log(low);
    audioInputPrivate.calibrationHigh = Math.log(high);
};

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
/*    audioInputPrivate.zeroGain = audioInputPrivate.context.createGain();
    audioInputPrivate.zeroGain.value = 0.0;
    audioInputPrivate.analyzer.connect(audioInputPrivate.zeroGain);
    audioInputPrivate.zeroGain.connect(audioInputPrivate.context.destination);*/
    audioInputPrivate.noiseBuffer = new Float32Array(audioInputPrivate.lastInterestingBin);
    audioInputPrivate.noiseSamples = 0;
    audioInputPrivate.noiseCollectInterval = setInterval(collectNoiseProfiles, AUDIO_INPUT_NOISE_PROFILE_INTERVAL)
}

function collectNoiseProfiles(){
    var currentSample = new Float32Array(audioInputPrivate.fftSize/2);
    if(!isFinite(currentSample[0]) || !isFinite(currentSample[100])) return;
    audioInputPrivate.analyzer.getFloatFrequencyData(currentSample);
    for(var i = 0; i < audioInputPrivate.lastInterestingBin; i++){
        audioInputPrivate.noiseBuffer[i] += currentSample[i];
    }
    if(++audioInputPrivate.noiseSamples >= AUDIO_INPUT_NOISE_PROFILE_COUNT) {
        for (var i = 0; i < audioInputPrivate.lastInterestingBin; i++)
            audioInputPrivate.noiseBuffer[i] /= AUDIO_INPUT_NOISE_PROFILE_COUNT;
        var noiseBuffer2 = new Float32Array(audioInputPrivate.fftSize/2);
        convolve(audioInputPrivate.noiseBuffer, noiseBuffer2, audioInputPrivate.firstInterestingBin, audioInputPrivate.lastInterestingBin, KERNEL_GAUSSIAN);
        audioInputPrivate.noiseBuffer = noiseBuffer2;
        clearInterval(audioInputPrivate.noiseCollectInterval);
        audioInputState.status = AUDIO_INPUT_STATUS_READY;
        audioInputState.valid = true;
        updateAudioInput();
    }
}

function updateAudioInput() {
    if(audioInputState.status == AUDIO_INPUT_STATUS_READY){
        var sample = new Float32Array(audioInputPrivate.fftSize/2);
        if(!isFinite(sample[0]) || !isFinite(sample[100])) return audioInputState;
        audioInputPrivate.analyzer.getFloatFrequencyData(sample);
        var sample2 = new Float32Array(audioInputPrivate.fftSize/2);
        convolve(sample, sample2, 0, audioInputPrivate.fftSize/2, KERNEL_GAUSSIAN);
        var weightsNR = new Float32Array(audioInputPrivate.lastInterestingBin);
        for(var i = audioInputPrivate.firstInterestingBin; i < audioInputPrivate.lastInterestingBin; i++){
            weightsNR[i] = sample2[i] - audioInputPrivate.noiseBuffer[i];
        }
        var halfLastBin = (audioInputPrivate.lastInterestingBin/2)|0;
        var weights = new Float32Array(halfLastBin);
        for(var i = audioInputPrivate.firstInterestingBin; i < halfLastBin; i++) {
            weights[i] = weightsNR[i] + 0.5 * weightsNR[2 * i] - 0.5 * weightsNR[(PHI * i) | 0] +
                AUDIO_INPUT_CONSERVATIVE_COEFF * Math.exp(-0.5*(i - audioInputPrivate.lastSolution)*(i - audioInputPrivate.lastSolution)/AUDIO_INPUT_CONSERVATIVE_SIGMA/AUDIO_INPUT_CONSERVATIVE_SIGMA*audioInputPrivate.fftBinSize*audioInputPrivate.fftBinSize);
        }
        var avgWeight = 0;
        var maxWeight = -Infinity;
        var maxWeightIndex = -1;
        for(var i = audioInputPrivate.firstInterestingBin; i < halfLastBin; i++) {
            avgWeight += weights[i];
            if(weights[i] > maxWeight){
                maxWeight = weights[i];
                maxWeightIndex = i;
            }
        }
        avgWeight /= halfLastBin - audioInputPrivate.firstInterestingBin;
        audioInputPrivate.lastSolution = maxWeightIndex;
        audioInputState.lastRead = Date.now();
        audioInputState.frequency = maxWeightIndex * audioInputPrivate.fftBinSize;
        audioInputState.confidence = maxWeight-avgWeight;
        audioInputState.overThreshold = audioInputState.confidence > AUDIO_INPUT_THRESHOLD;
        audioInputState.normalizedValue = Math.min(Math.max((Math.log(audioInputState.frequency) - audioInputPrivate.calibrationLow) / (audioInputPrivate.calibrationHigh - audioInputPrivate.calibrationLow) * 2 - 1, -1), 1);
    }
    return audioInputState;
}

$(audioInputInit);
