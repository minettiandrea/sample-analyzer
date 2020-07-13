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
  let peaks = essentia.SpectralPeaks(signal, 50, 20000, 20, 20) // find spectral peaks
  let pitch = essentia.PitchYinFFT(signal, signal.length, true) // estimate fundamental in fft domain
  let hpeaks = essentia.HarmonicPeaks(peaks.frequencies, peaks.magnitudes, pitch.pitch, 12, 0.3) // compute harmonic peaks
  let hpcp = essentia.HPCP(hpeaks.harmonicFrequencies, hpeaks.harmonicMagnitudes)
  console.log(Array.from(essentia.vectorToArray(hpcp.hpcp)))
  const msgResponse:SpectralAnalisis = {
    peaks: {
      frequencies: Array.from(essentia.vectorToArray(hpeaks.harmonicFrequencies)),
      magnitudes: Array.from(essentia.vectorToArray(hpeaks.harmonicMagnitudes))
    },
    hpcp: Array.from(essentia.vectorToArray(hpcp.hpcp))
  }
  let reply = msg.reply(msgResponse)
  ctx.postMessage(reply)
}

function handleSpectrum (msg:EssentiaMessage) {
  const result = essentia.Spectrum(essentia.arrayToVector(msg.payload), msg.payload.length)

  const FRAME_SIZE = 4096
  const spectrumResult = essentia.vectorToArray(result.spectrum)
  let subsampled:number[] = []
  const divider = spectrumResult.length / 2048
  spectrumResult.forEach((el:number, i:number) => {
    subsampled[Math.floor(i / divider)] = subsampled[Math.floor(i / divider)] ? subsampled[Math.floor(i / divider)] + el : el
  })
  subsampled = subsampled.map(x => x / Math.floor(divider))
  // subsampled = spectrumResult
  // let logresult = essentia.LogSpectrum(essentia.arrayToVector(subsampled))
  let replyMsg:FFTResponse = { log: [], linear: Array.from(subsampled) }
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
