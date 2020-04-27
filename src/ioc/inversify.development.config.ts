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
import { DrawToolkit, DrawToolkitImpl } from '@/services/providers/draw-toolkit'
import { NoteFrequencyProvider, NoteFrequencyProviderImpl } from '@/services/providers/note-frequency'
import { Quantizer, QuantizerImpl } from '@/services/providers/quantizer'
import { FFTKiss, FFT } from '@/services/providers/fft'
import { EssentiaTimeExtractor } from '@/services/time-extractor/essentia-time-extractor'

export default function () {
  container.addSingleton<SpectralExtractor>(DummySpectralExtractor, REGISTRY.SpectralExtractor)
  container.addSingleton<TimeExtractor>(EssentiaTimeExtractor, REGISTRY.TimeExtractor)
  container.addSingleton<AudioContextProvider>(AudioContextProviderImpl, REGISTRY.AudioContextProvider)
  container.addSingleton<NoteFrequencyProvider>(NoteFrequencyProviderImpl, REGISTRY.NoteFrequencyProvider)
  container.addSingleton<SampleLoaderService>(SampleLoaderImpl, REGISTRY.SampleLoader)
  container.addSingleton<Store>(PreLoadedStore, REGISTRY.Store)
  container.addSingleton<DrawToolkit>(DrawToolkitImpl, REGISTRY.DrawToolkit)
  container.addSingleton<Quantizer>(QuantizerImpl, REGISTRY.Quantizer)
  container.addSingleton<FFT>(FFTKiss, REGISTRY.FFT)
};
