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
      let id = this.setID()
      let msg:EssentiaMessage = new EssentiaMessage(id, 'harmony', Array.from(sample))
      console.log(msg)
      worker.postMessage(msg)
      worker.onmessage = (event:MessageEvent) => {
        if (event.data.ID === id) {
          let pos:number[] = Array.from(event.data.payload)
          console.log(pos)
          resolve(
            {
              peaks: [440, 880, 900],
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
  setID ():string {
    return '_' + Math.random().toString(36).substr(2, 9)
  }
}
