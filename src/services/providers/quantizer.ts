import { injectable } from 'inversify-props'

export interface SpectrumPoint{
  magnitude: number
  frequency: number
}

export interface Quantizer{
  lin(array: number[], bars:number):number[]
}

@injectable()
export class QuantizerImpl implements Quantizer {
  lin (array: number[], bars:number):number[] {
    const blocksize = Math.floor(array.length / bars) // how many samples in each block
    var dataf : number [] = [] // initialize the output

    for (let i = 0; i < bars; i++) { // for each bar
      let blockbegins = blocksize * i
      let sum = 0

      for (let j = 0; j < blocksize; j++) { // in each bar I sum up the values of each sample
        sum = sum + Math.abs(array[blockbegins + j])
      // sum
      }
      dataf.push(sum / blocksize) // pushes the average of each block into an array
    }
    const factor = Math.max(...dataf)
    dataf = dataf.map(n => n * (1 / factor)) // average respect to the max
    return dataf
  }

}
