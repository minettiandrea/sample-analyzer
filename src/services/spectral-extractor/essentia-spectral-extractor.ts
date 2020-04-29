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
<<<<<<< HEAD
      let id = this.setID()
      let msg:EssentiaMessage = new EssentiaMessage(id, 'harmony', Array.from(sample))
=======
      let msg:EssentiaMessage = new EssentiaMessage(EssentiaMessage.HARMONY, Array.from(sample))
      console.log(msg)
>>>>>>> d39e078e1ca958b45e75d8e9a23b806db97206f6
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
<<<<<<< HEAD
  setID ():string {
    return '_' + Math.random().toString(36).substr(2, 9)
  }

  normalize (data:number[]):Float32Array {
    let max = Math.max.apply(data)
    let min = Math.min.apply(data)
    data.forEach(a => a - min / (max - min))

    return Float32Array.from(data)
  }
=======
>>>>>>> d39e078e1ca958b45e75d8e9a23b806db97206f6
}
