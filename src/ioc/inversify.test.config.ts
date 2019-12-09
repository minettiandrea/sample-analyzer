import { SpectralExtractor } from '@/services/spectral-extractor/spectral-extractor'
import { DummySpectralExtractor } from '@/services/spectral-extractor/spectral-extractor-impl'
import { REGISTRY } from './registry'
import { container } from 'inversify-props'

export default function () {
  container.addSingleton<SpectralExtractor>(DummySpectralExtractor, REGISTRY.SpectralExtractor)
};
