import { Observable, BehaviorSubject, AsyncSubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { injectable, inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { SampleLoaderService } from '../sample-loader/sample-loader'
import { TimeAnalisis, TimeExtractor } from '../time-extractor/time-extractor'

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
    addSpectralPeaks (number:number[]):void
}

export interface PlayingEvent{
  status:boolean
  length:number
  elapsed:number
}

@injectable()
export class StoreImpl implements Store {
    @inject(REGISTRY.TimeExtractor) extractor:TimeExtractor

    protected _sample:BehaviorSubject<AudioBuffer | null> = new BehaviorSubject<AudioBuffer | null>(null);
    protected _timeAnalisis:BehaviorSubject<TimeAnalisis | null> = new BehaviorSubject<TimeAnalisis | null>(null);

    emptySampleEvent:PlayingEvent = { status: false, length: 0, elapsed: 0 }

    private _playing:BehaviorSubject<PlayingEvent> = new BehaviorSubject<PlayingEvent>(this.emptySampleEvent);

    protected _skipped:BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

    private _polyAdded = new BehaviorSubject<number[] | null>(null);
    private _spectralpeaks = new BehaviorSubject<number[] | null>(null)

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
      this._sample.next(sample)
      this.extractor.analyze(this._channelData(sample)).then(a => {
        this._timeAnalisis.next(a)
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
        { name: 'drums', url: require('@/assets/drums.wav') }
      ]
    }

    getPolyLine ():Observable<number[] | null> { return this._polyAdded }
    addPolyLine (n : number[]) { this._polyAdded.next(n) }

    getSpectralPeaks ():Observable<number[] | null> { return this._spectralpeaks }
    addSpectralPeaks (n : number[]) { this._spectralpeaks.next(n) }
}

@injectable()
export class PreLoadedStore extends StoreImpl {
    @inject(REGISTRY.SampleLoader) sampleLoader:SampleLoaderService

    constructor () {
      super()
      const cello = require('@/assets/cello.wav')
      const drums = require('@/assets/drums.wav')
      this.sampleLoader.loadFromUrl(cello).then(sample => {
        this.nextSample(sample)
      })
    }
}
