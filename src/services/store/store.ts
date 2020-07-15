import { Observable, BehaviorSubject, AsyncSubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { injectable, inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { SampleLoaderService } from '../sample-loader/sample-loader'
import { TimeAnalisis, TimeExtractor } from '../time-extractor/time-extractor'
import { FFT, FFTResponse } from '../providers/fft'
import { EssentiaSpectralExtractor } from '../spectral-extractor/essentia-spectral-extractor'
import { SpectrumPoint } from '../providers/quantizer'

export interface Example{
  name: string,
  url: string
}

export interface Store{
    sample():Observable<AudioBuffer | null>
    nextSample(sample:AudioBuffer):void
    timeAnalysis():Observable<TimeAnalisis | null>
    channelData ():Float32Array
    playing ():Observable<PlayingEvent>
    resetPlayEvent ():void
    nextPlayEvent (pe:PlayingEvent):void
    skipped():Observable<number | null>
    nextSkipped(skipped:number):void
    sampleExamples():Example[]
    getPolyLine ():Observable<number[] | null>
    addPolyLine (number:number[]):void
    getSpectralPeaks ():Observable<number[] | null>
    getHCPC ():Observable<number[] | null>
    getFFT():Observable<SpectrumPoint[] | null>
    loading():Observable<boolean>
    setLoading():void
}

export interface PlayingEvent{
  status:boolean
  length:number
  elapsed:number
}

@injectable()
export class StoreImpl implements Store {
    @inject(REGISTRY.SpectralExtractor) spectralExtractor: EssentiaSpectralExtractor
    @inject(REGISTRY.TimeExtractor) extractor:TimeExtractor
    @inject(REGISTRY.FFT) fft:FFT

    protected _sample:BehaviorSubject<AudioBuffer | null> = new BehaviorSubject<AudioBuffer | null>(null);
    protected _timeAnalisis:BehaviorSubject<TimeAnalisis | null> = new BehaviorSubject<TimeAnalisis | null>(null);

    emptySampleEvent:PlayingEvent = { status: false, length: 0, elapsed: 0 }

    private _playing:BehaviorSubject<PlayingEvent> = new BehaviorSubject<PlayingEvent>(this.emptySampleEvent);

    protected _skipped:BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

    private _polyAdded = new BehaviorSubject<number[] | null>(null);
    private _spectralpeaks = new BehaviorSubject<number[] | null>(null)
    private _hpcp = new BehaviorSubject<number[] | null>(null)
    private _fft = new BehaviorSubject<SpectrumPoint[] | null>(null)
    private _loading = new BehaviorSubject<boolean>(true)

    sample (): Observable<AudioBuffer | null> {
      return this._sample
    }

    private _channelData (s:AudioBuffer):Float32Array {
      let channel = s.getChannelData(0)
      for (let j = 1; j < s.numberOfChannels; j++) {
        let d = s.getChannelData(j)
        channel = channel.map((a, b) => (a + d[b]) / s.numberOfChannels)
      }
      return channel
    }

    channelData ():Float32Array {
      return this._sample.value ? this._channelData(this._sample.value) : Float32Array.from([0])
    }

    timeAnalysis (): Observable<TimeAnalisis | null> {
      return this._timeAnalisis
    }

    nextSample (sample: AudioBuffer): void {
      this._timeAnalisis.next(null)
      this._hpcp.next(null)
      this._spectralpeaks.next(null)
      this._fft.next(null)
      this._sample.next(sample)

      var data = this._channelData(sample)

      this.fft.of(data).then((spectrum:FFTResponse) => {
        const fft = spectrum.full.map((x, i) => {
          return { magnitude: x, frequency: i * ((sample.sampleRate / 2) / spectrum.full.length) }
        })

        this._fft.next(fft)

        this.spectralExtractor.analyze(spectrum.subsampled).then(se => {
          this._spectralpeaks.next(se.peaks.frequencies)
          this._hpcp.next(se.hpcp)

          this.extractor.analyze(data).then(a => {
            this._timeAnalisis.next(a)
            this._loading.next(false)
          })
        })
      })
    }

    playing ():Observable<PlayingEvent> {
      return this._playing
    }

    resetPlayEvent () {
      this._playing.next(this.emptySampleEvent)
    }

    nextPlayEvent (pe:PlayingEvent) {
      this._playing.next(pe)
    }

    skipped (): Observable<number | null> {
      return this._skipped
    }

    nextSkipped (skipped : number): void {
      this._skipped.next(skipped)
    }

    sampleExamples (): Example[] {
      return [
        { name: 'cello', url: require('@/assets/cello.wav') },
        { name: 'drums', url: require('@/assets/drums.wav') },
        { name: 'rhodes', url: require('@/assets/rhodes.wav') }

      ]
    }

    getPolyLine ():Observable<number[] | null> { return this._polyAdded }
    addPolyLine (n : number[]) { this._polyAdded.next(n) }

    getSpectralPeaks ():Observable<number[] | null> { return this._spectralpeaks }
    getHCPC (): Observable<number[] | null> { return this._hpcp }

    getFFT (): Observable<SpectrumPoint[] | null> { return this._fft }

    setLoading () {
      this._loading.next(true)
    }

    loading ():Observable<boolean> {
      return this._loading
    }
}

@injectable()
export class PreLoadedStore extends StoreImpl {
    @inject(REGISTRY.SampleLoader) sampleLoader:SampleLoaderService

    constructor () {
      super()
      const cello = require('@/assets/cello.wav')
      const drums = require('@/assets/drums.wav')
      const rhodes = require('@/assets/rhodes.wav')
      this.sampleLoader.loadFromUrl(cello).then(sample => {
        this.nextSample(sample)
      })
    }
}
