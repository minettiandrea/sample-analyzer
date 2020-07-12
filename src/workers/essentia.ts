// @ts-ignore
import * as wasm from 'essentia.js/dist/essentia-wasm.module'
// @ts-ignore
import EssentiaJS from 'essentia.js/dist/essentia.js-core.es'
import Essentia from 'essentia.js/dist/core_api'
import { EssentiaMessage } from '@/workers/essentia-message'

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
  const result = essentia.SpectralPeaks(signal, 80, 5000, 10, 20, 'frequency', 44100)
  let reply = msg.reply(essentia.vectorToArray(result.frequencies))
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
  let replyMsg = {log: essentia.vectorToArray(logresult.logFreqSpectrum), linear:  subsampled}
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
