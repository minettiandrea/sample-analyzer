import { SpectralExtractor } from './spectral-extractor'
import { injectable } from 'inversify-props'

@injectable()
export class DummySpectralExtractor implements SpectralExtractor {
  test (): string {
    return 'bla bla'
  }
}
