import { Observable, BehaviorSubject } from 'rxjs'
import { injectable } from 'inversify-props'

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
