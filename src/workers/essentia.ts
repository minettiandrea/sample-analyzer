import * as wasm from 'essentia.js/dist/essentia-wasm.module'
import EssentiaJS from 'essentia.js/dist/essentia.js-core.es'
import Essentia from 'essentia.js/dist/core_api'

const ctx: Worker = self as any

// Post data to parent thread

// export as default for entry point to node package with the js wrapper
let essentia = new EssentiaJS(wasm.EssentiaModule, false) as Essentia

ctx.onmessage = (e) => {
  const result = essentia.BeatTrackerMultiFeature(essentia.arrayToVector(e.data))
  ctx.postMessage(essentia.vectorToArray(result.ticks))
}

// ctx.postMessage({"test": essentia})
