import { injectable } from 'inversify-props'
import { TimeExtractor, TimeAnalisis } from './time-extractor'
import Worker from 'worker-loader!../../workers/essentia'

@injectable()
export class EssentiaTimeExtractor implements TimeExtractor {
  private secondToSamples (s:number):number {
    return Math.round(s * 44100)
  }

  analyze (sample: AudioBuffer): Promise<TimeAnalisis> {
    return new Promise((resolve, reject) => {
      const worker = new Worker()
      worker.postMessage(this.normalize(Array.from(sample.getChannelData(0))))
      worker.onmessage = (event:MessageEvent) => {
        let pos:number[] = Array.from(event.data)
        console.log(pos)
        resolve({
          start: 0,
          end: this.secondToSamples(3),
          peaks: pos.map(this.secondToSamples),
          envelope: [],
          attackSlope: 2,
          decaySlope: 0.3
        })
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
