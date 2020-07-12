import { SpectralExtractor, SpectralAnalisis } from './spectral-extractor'
import { injectable } from 'inversify-props'
import { ConstNote } from '@/model/note'
// @ts-ignore
import Worker from 'worker-loader!../../workers/essentia'
import { EssentiaMessage } from '@/workers/essentia-message'

@injectable()
export class EssentiaSpectralExtractor implements SpectralExtractor {
  analyze (sample: number[]): Promise<SpectralAnalisis> {
    return new Promise((resolve, reject) => {
      const worker = new Worker()
      let msg:EssentiaMessage = new EssentiaMessage(EssentiaMessage.HARMONY, sample)
      worker.postMessage(msg)
      worker.onmessage = (event:MessageEvent) => {
        if (msg.isForMe(event.data)) {
          resolve(event.data.payload)
        }
      }
    })
  }

  normalize (data:number[]):Float32Array {
    let max = Math.max.apply(data)
    let min = Math.min.apply(data)
    data.forEach(a => a - min / (max - min))

    return Float32Array.from(data)
  }
}
