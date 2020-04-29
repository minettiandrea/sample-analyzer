import { SpectralExtractor, SpectralAnalisis } from './spectral-extractor'
import { injectable } from 'inversify-props'
import { ConstNote } from '@/model/note'
import Worker from 'worker-loader!../../workers/essentia'
import { EssentiaMessage } from '@/workers/essentia-message'

@injectable()
export class EssentiaSpectralExtractor implements SpectralExtractor {
  analyze (sample: Float32Array): Promise<SpectralAnalisis> {
    return new Promise((resolve, reject) => {
      const worker = new Worker()
      let msg:EssentiaMessage = new EssentiaMessage(EssentiaMessage.HARMONY, Array.from(sample))
      console.log(msg)
      worker.postMessage(msg)
      worker.onmessage = (event:MessageEvent) => {
        if (msg.isForMe(event.data)) {
          let pos:number[] = Array.from(event.data.payload)
          resolve(
            {
              peaks: pos,
              harmonicPeaks: [440, 880],
              inharmonicPeaks: [900],
              fundamental: 440,
              fundamentalNote: ConstNote,
              overtones: [ConstNote, ConstNote],
              fft: []
            })
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
