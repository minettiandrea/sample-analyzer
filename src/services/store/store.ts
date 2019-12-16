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
}

@injectable()
export class PreLoadedStore extends StoreImpl {
    @inject(REGISTRY.SampleLoader) sampleLoader:SampleLoaderService

    constructor () {
      super()
      const cello = require('@/assets/cello.wav')
      this.sampleLoader.loadFromUrl(cello).then(sample => {
        console.log(sample)
        console.log(sample.duration)
        this._sample.next(sample)
      })
    }
}
