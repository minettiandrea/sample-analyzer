import { injectable } from 'inversify-props'
import { TimeExtractor, TimeAnalisis } from './time-extractor'
import Worker from 'worker-loader!../../workers/essentia'
import { EssentiaMessage } from '@/workers/essentia-message'

@injectable()
export class EssentiaTimeExtractor implements TimeExtractor {
  private secondToSamples (s:number):number {
    return Math.round(s * 44100)
  }

  analyze (sample: Float32Array): Promise<TimeAnalisis> {
    return new Promise((resolve, reject) => {
      const worker = new Worker()
      let id = this.setID()
      let msg = new EssentiaMessage(id, 'rhythm', this.normalize(Array.from(this.normalize(sample))))
      worker.postMessage(msg)
      worker.onmessage = (event:MessageEvent) => {
        if (event.data.ID === id) {
          let pos:number[] = Array.from(event.data.payload)
          resolve({
            start: 0,
            end: this.secondToSamples(3),
            peaks: pos.map(this.secondToSamples),
            envelope: [],
            attackSlope: 2,
            decaySlope: 0.3
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

  setID ():string {
    return '_' + Math.random().toString(36).substr(2, 9)
  }
}
