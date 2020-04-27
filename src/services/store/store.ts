import { Observable, BehaviorSubject } from 'rxjs'
import { injectable, inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { SampleLoaderService } from '../sample-loader/sample-loader'

export interface Store{
    sample():Observable<AudioBuffer | null>
    nextSample(sample:AudioBuffer):void
    playing ():Observable<PlayingEvent>
    resetPlayEvent ():void
    nextPlayEvent (pe:PlayingEvent):void
    skipped():Observable<number | null>
    nextSkipped(skipped:number):void
}

export interface PlayingEvent{
  status:boolean
  length:number
  elapsed:number
}

@injectable()
export class StoreImpl implements Store {
    protected _sample:BehaviorSubject<AudioBuffer | null> = new BehaviorSubject<AudioBuffer | null>(null);

    emptySampleEvent:PlayingEvent = { status: false, length: 0, elapsed: 0 }

    private _playing:BehaviorSubject<PlayingEvent> = new BehaviorSubject<PlayingEvent>(this.emptySampleEvent);

    protected _skipped:BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

    sample (): Observable<AudioBuffer | null> {
      return this._sample
    }

    nextSample (sample: AudioBuffer): void {
      this._sample.next(sample)
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
}

@injectable()
export class PreLoadedStore extends StoreImpl {
    @inject(REGISTRY.SampleLoader) sampleLoader:SampleLoaderService

    constructor () {
      super()
      const cello = require('@/assets/cello.wav')
      const drums = require('@/assets/drums.wav')
      this.sampleLoader.loadFromUrl(drums).then(sample => {
        this._sample.next(sample)
      })
    }
}
