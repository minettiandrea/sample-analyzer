import { Observable, BehaviorSubject } from 'rxjs'

export interface Store{
    sample():Observable<AudioBuffer | null>
    nextSample(sample:AudioBuffer):void
}

export class StoreImpl implements Store {
    private _sample:BehaviorSubject<AudioBuffer | null> = new BehaviorSubject<AudioBuffer | null>(null);

    sample (): Observable<AudioBuffer | null> {
      return this._sample
    }

    nextSample (sample: AudioBuffer): void {
      this._sample.next(sample)
    }
}
