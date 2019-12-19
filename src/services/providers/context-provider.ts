import { injectable } from 'inversify-props'

export interface AudioContextProvider {
    context():AudioContext;
}

@injectable()
export class AudioContextProviderImpl implements AudioContextProvider {
    private audioContext = new AudioContext({
      sampleRate: 44100
    });

    context (): AudioContext {
      return this.audioContext
    }
}
