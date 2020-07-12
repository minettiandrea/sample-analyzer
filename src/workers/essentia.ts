// @ts-ignore
import * as wasm from 'essentia.js/dist/essentia-wasm.module'
// @ts-ignore
import EssentiaJS from 'essentia.js/dist/essentia.js-core.es'
import Essentia from 'essentia.js/dist/core_api'
import { EssentiaMessage } from '@/workers/essentia-message'
import { FFTResponse } from '@/services/providers/fft'
import { SpectralAnalisis } from '@/services/spectral-extractor/spectral-extractor'

const ctx: Worker = self as any

// Post data to parent thread

// export as default for entry point to node package with the js wrapper
let essentia = new EssentiaJS(wasm.EssentiaModule, false) as Essentia

function handleRhythm (msg:EssentiaMessage) {
  const result = essentia.BeatTrackerDegara(essentia.arrayToVector(msg.payload))
  let reply = msg.reply(essentia.vectorToArray(result.ticks))
  ctx.postMessage(reply)
}

function handleHarmony (msg:EssentiaMessage) {
  let signal = essentia.arrayToVector(msg.payload)
  let peaks = essentia.SpectralPeaks(signal, undefined, 20000, 8)
  let hpcp = essentia.HPCP(peaks.frequencies, peaks.magnitudes)
  const msgResponse:SpectralAnalisis = {
    peaks: {
      frequencies: Array.from(essentia.vectorToArray(peaks.frequencies)),
      magnitudes:  Array.from(essentia.vectorToArray(peaks.magnitudes))
    },
    hpcp: Array.from(essentia.vectorToArray(hpcp.hpcp))
  } 
  let reply = msg.reply(msgResponse)
  console.log(reply)
  ctx.postMessage(reply)
}

function handleSpectrum (msg:EssentiaMessage) {
  const result = essentia.Spectrum(essentia.arrayToVector(msg.payload),msg.payload.length)

  const FRAME_SIZE = 2048
  const spectrumResult = essentia.vectorToArray(result.spectrum)
  let subsampled:number[] = []
  const divider = spectrumResult.length / 2048;
  spectrumResult.forEach((el:number,i:number) => {
    subsampled[Math.floor(i/divider)] = subsampled[Math.floor(i/divider)] ? subsampled[Math.floor(i/divider)] + el : el
  });
  subsampled = subsampled.map(x => x / Math.floor(divider))
  // subsampled = spectrumResult
  let logresult = essentia.LogSpectrum(essentia.arrayToVector(subsampled))
  let replyMsg:FFTResponse = {log: Array.from(essentia.vectorToArray(logresult.logFreqSpectrum)), linear: Array.from(subsampled)}
  const reply = msg.reply(replyMsg)
  ctx.postMessage(reply)
}

ctx.onmessage = (e) => {
  let msg:EssentiaMessage = EssentiaMessage.fromData(e.data)
  switch (msg.type) {
    case EssentiaMessage.RHYTHM:
      handleRhythm(msg)
      break
    case EssentiaMessage.HARMONY:
      handleHarmony(msg)
      break
    case EssentiaMessage.SPECTRUM:
      handleSpectrum(msg)
      break
  }
}
