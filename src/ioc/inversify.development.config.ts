import { SpectralExtractor } from '@/services/spectral-extractor/spectral-extractor'
import { DummySpectralExtractor } from '@/services/spectral-extractor/spectral-extractor-impl'
import { REGISTRY } from './registry'
import { container } from 'inversify-props'
import { AudioContextProviderImpl, AudioContextProvider } from '@/services/providers/context-provider'
import { SampleLoaderService } from '@/services/sample-loader/sample-loader'
import { SampleLoaderImpl } from '@/services/sample-loader/sample-loader-impl'

export default function () {
  container.addSingleton<SpectralExtractor>(DummySpectralExtractor, REGISTRY.SpectralExtractor)
  container.addSingleton<AudioContextProvider>(AudioContextProviderImpl, REGISTRY.AudioContextProvider)
  container.addSingleton<SampleLoaderService>(SampleLoaderImpl, REGISTRY.SampleLoader)
};
