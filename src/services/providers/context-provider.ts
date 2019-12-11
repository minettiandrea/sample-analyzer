import { injectable } from 'inversify-props'

export interface AudioContextProvider {
    context():AudioContext;
}

@injectable()
export class AudioContextProviderImpl implements AudioContextProvider {
    private audioContext = new AudioContext();

    context (): AudioContext {
      return this.audioContext
    }
}
