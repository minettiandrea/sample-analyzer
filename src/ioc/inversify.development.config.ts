import { SpectralExtractor } from '@/services/spectral-extractor/spectral-extractor'
import { DummySpectralExtractor } from '@/services/spectral-extractor/spectral-extractor-impl'
import { REGISTRY } from './registry'
import { container } from 'inversify-props'
import { AudioContextProviderImpl, AudioContextProvider } from '@/services/providers/context-provider'
import { SampleLoaderService } from '@/services/sample-loader/sample-loader'
import { SampleLoaderImpl } from '@/services/sample-loader/sample-loader-impl'
import { StoreImpl, Store, PreLoadedStore } from '@/services/store/store'
import { TimeExtractor } from '@/services/time-extractor/time-extractor'
import { DummyTimeExtractor } from '@/services/time-extractor/dummy-time-extractor'
import { DrawToolkit } from '@/services/providers/draw-toolkit'

export default function () {
  container.addSingleton<SpectralExtractor>(DummySpectralExtractor, REGISTRY.SpectralExtractor)
  container.addSingleton<TimeExtractor>(DummyTimeExtractor, REGISTRY.TimeExtractor)
  container.addSingleton<AudioContextProvider>(AudioContextProviderImpl, REGISTRY.AudioContextProvider)
  container.addSingleton<SampleLoaderService>(SampleLoaderImpl, REGISTRY.SampleLoader)
  container.addSingleton<Store>(PreLoadedStore, REGISTRY.Store)
  container.addSingleton<DrawToolkit>(DrawToolkit, REGISTRY.DrawToolkit)
};
