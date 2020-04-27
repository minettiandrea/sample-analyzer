import * as wasm from 'essentia.js/dist/essentia-wasm.module'
import EssentiaJS from 'essentia.js/dist/essentia.js-core.es'
import Essentia from 'essentia.js/dist/core_api'

const ctx: Worker = self as any

// Post data to parent thread

// export as default for entry point to node package with the js wrapper
let essentia = new EssentiaJS(wasm.EssentiaModule, false) as Essentia
console.log(essentia)


ctx.onmessage = (e) => {

  const result = essentia.PeakDetection(essentia.arrayToVector(Array.from(e.data)))

  ctx.postMessage(essentia.vectorToArray(result.positions))

}



// ctx.postMessage({"test": essentia})
