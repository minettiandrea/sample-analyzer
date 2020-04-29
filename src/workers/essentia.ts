import * as wasm from 'essentia.js/dist/essentia-wasm.module'
import EssentiaJS from 'essentia.js/dist/essentia.js-core.es'
import Essentia from 'essentia.js/dist/core_api'
import { EssentiaMessage } from '@/workers/essentia-message'

const ctx: Worker = self as any

// Post data to parent thread

// export as default for entry point to node package with the js wrapper
let essentia = new EssentiaJS(wasm.EssentiaModule, false) as Essentia
let types:string[] = ['rhythm', 'harmony']
ctx.onmessage = (e) => {
  let t:string = e.data.type
  if (t === types[0]) { // rhythm analysis
    const result = essentia.BeatTrackerDegara(essentia.arrayToVector(e.data.payload))
    let reply = new EssentiaMessage(e.data.ID, t, essentia.vectorToArray(result.ticks))
    ctx.postMessage(reply)
  } else if (t === types[1]) { // spectral peaks
    let signal = e.data.payload
    const spectra = essentia.Spectrum(essentia.arrayToVector(signal), signal.length)
    const logspectra = essentia.LogSpectrum(spectra.spectrum, undefined, undefined, undefined, 44100)
    const result = essentia.SpectralPeaks(logspectra.logFreqSpectrum, -5, undefined, 10)
    let reply = new EssentiaMessage(e.data.ID, t, essentia.vectorToArray(result.frequencies))
    ctx.postMessage(reply)
  }
}
// ctx.postMessage({"test": essentia})
