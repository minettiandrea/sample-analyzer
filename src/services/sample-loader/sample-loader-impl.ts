import { SampleLoaderService } from './sample-loader'
import { injectable, inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { AudioContextProvider } from '../providers/context-provider'

@injectable()
export class SampleLoaderImpl implements SampleLoaderService {
  @inject(REGISTRY.AudioContextProvider) context: AudioContextProvider;

  loadFromUrl (url: string):Promise<AudioBuffer> {
    return new Promise<AudioBuffer>(resolve => {
      fetch(url).then(response => {
        response.arrayBuffer().then(buffer => {
          this.context.context().decodeAudioData(buffer, audioBuffer => resolve(audioBuffer))
        })
      })
    })
  }

  loadFromFile (file: File): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>(resolve => {
      const fr = new FileReader()
      fr.readAsArrayBuffer(file)
      fr.onload = () => {
        if (fr.result) {
          this.context.context().decodeAudioData(fr.result as ArrayBuffer, audioBuffer => resolve(audioBuffer))
        } else {
          resolve(this.context.context().createBuffer(2, 0, 44100))
        }
      }
    })
  }
}
