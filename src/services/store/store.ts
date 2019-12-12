import { Observable, BehaviorSubject } from 'rxjs'
import { injectable, inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { SampleLoaderService } from '../sample-loader/sample-loader'

export interface Store{
    sample():Observable<AudioBuffer | null>
    nextSample(sample:AudioBuffer):void
}

@injectable()
export class StoreImpl implements Store {
    private _sample:BehaviorSubject<AudioBuffer | null> = new BehaviorSubject<AudioBuffer | null>(null);

    sample (): Observable<AudioBuffer | null> {
      return this._sample
    }

    nextSample (sample: AudioBuffer): void {
      this._sample.next(sample)
    }
}

@injectable()
export class PreLoadedStore implements Store {
    @inject(REGISTRY.SampleLoader) sampleLoader:SampleLoaderService

    constructor () {
      const cello = require('@/assets/cello.wav')
      this.sampleLoader.loadFromUrl(cello).then(sample => {
        this._sample.next(sample)
      })
    }

    private _sample:BehaviorSubject<AudioBuffer | null> = new BehaviorSubject<AudioBuffer | null>(null);

    sample (): Observable<AudioBuffer | null> {
      return this._sample
    }

    nextSample (sample: AudioBuffer): void {
      this._sample.next(sample)
    }
}
