import * as wasm from 'essentia.js/dist/essentia-wasm.module'
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
  const result = essentia.SpectralPeaks(signal, undefined, 20000, 10)
  let reply = msg.reply(essentia.vectorToArray(result.frequencies))
  // console.log(essentia.vectorToArray(logspectra.logFreqSpectrum))
  ctx.postMessage(reply)
}

function handleSpectrum (msg:EssentiaMessage) {
  const result = essentia.Spectrum(essentia.arrayToVector(msg.payload))
  // console.log(result)
  let logresult = essentia.LogSpectrum(result.spectrum)
  let reply = msg.reply(essentia.vectorToArray(logresult.logFreqSpectrum))
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
