
import { FFTR } from 'kissfft-js'
import { injectable } from 'inversify-props'

export interface FFT{
  of(data:Float32Array):number[];
}

@injectable()
export class FFTKiss implements FFT {
  of (data:Float32Array):number[] {
    const fftr = new FFTR(data.length)
    return fftr.forward(Array.from(data)).map(f => Math.abs(f))
  }
}
