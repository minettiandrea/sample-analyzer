import { SpectralExtractor, SpectralAnalisis } from './spectral-extractor'
import { injectable } from 'inversify-props'
import { ConstNote } from '@/model/note'
import Worker from 'worker-loader!../../workers/essentia'

@injectable()
export class DummySpectralExtractor implements SpectralExtractor {
  analyze (sample: AudioBuffer): Promise<SpectralAnalisis> {
    return new Promise((resolve, reject) => resolve({
      peaks: [440, 880, 900],
      harmonicPeaks: [440, 880],
      inharmonicPeaks: [900],
      fundamental: 440,
      fundamentalNote: ConstNote,
      overtones: [ConstNote, ConstNote],
      fft: []
    }))
  }
}
