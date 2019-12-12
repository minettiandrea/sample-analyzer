import { TimeExtractor, TimeAnalisis } from './time-extractor'
import { injectable } from 'inversify-props'

@injectable()
export class DummyTimeExtractor implements TimeExtractor {
  private secondToSamples (s:number):number {
    return Math.floor(s * 44100)
  }

  analyze (sample: AudioBuffer): Promise<TimeAnalisis> {
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
