import { SpectralExtractor, SpectralAnalisis } from './spectral-extractor'
import { injectable } from 'inversify-props'

@injectable()
export class DummySpectralExtractor implements SpectralExtractor {
  analyze (sample: AudioBuffer): SpectralAnalisis {
    return {
      peaks: [440, 880, 900],
      harmonicPeaks: [440, 880],
      inharmonicPeaks: [900],
      fundamental: 440,
      fundamentalNote: { name: 'A' },
      overtones: [{ name: 'A' }, { name: 'B' }],
      fft: []
    }
  }
}
