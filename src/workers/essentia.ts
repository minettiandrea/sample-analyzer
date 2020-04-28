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
    const spectra = essentia.Spectrum(essentia.arrayToVector(e.data.payload), e.data.payload.length)
    const result = essentia.SpectralPeaks(spectra.spectrum, undefined, undefined, 10)
    console.log(result.frequencies)
    let reply = new EssentiaMessage(e.data.ID, t, essentia.vectorToArray(result.frequencies))
    ctx.postMessage(reply)
  }
}

// ctx.postMessage({"test": essentia})
