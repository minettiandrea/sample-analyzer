import { injectable } from 'inversify-props'
import { TimeExtractor, TimeAnalisis } from './time-extractor'
import Worker from "worker-loader!../../workers/essentia"

@injectable()
export class EssentiaTimeExtractor implements TimeExtractor {
  private secondToSamples (s:number):number {
    return Math.floor(s * 44100)
  }

  analyze (sample: AudioBuffer): Promise<TimeAnalisis> {

    const worker = new Worker()
    worker.postMessage(sample.getChannelData(0))
    worker.onmessage = (event) => { console.log(event) }
    return new Promise((resolve, reject) => resolve({
      start: this.secondToSamples(0.5),
      end: this.secondToSamples(3),
      peaks: [this.secondToSamples(1), this.secondToSamples(1.5), this.secondToSamples(2)],
      envelope: [],
      attackSlope: 2,
      decaySlope: 0.3
    }))
  }
}
