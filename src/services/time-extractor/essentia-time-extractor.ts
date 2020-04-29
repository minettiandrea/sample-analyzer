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
      let msg = new EssentiaMessage(EssentiaMessage.RHYTHM, this.normalize(Array.from(sample)))
      worker.postMessage(msg)
      worker.onmessage = (event:MessageEvent) => {
        if (msg.isForMe(event.data)) {
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
}
