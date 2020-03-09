import { injectable } from 'inversify-props'

export interface LogPoint{
  magnitude: number
  frequency: number
}

export interface Quantizer{
  lin(array: number[], bars:number):number[]

  log(array: number[], step: number, minFrequency:number, fs:number):LogPoint[]
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

  log (array: number[], step: number, minFrequency:number, fs:number):LogPoint[] {
    // calculate the centroid of bins in log2 scale
    let steps = []
    for (let j = 0; Math.pow(2, j * step) < fs / 2; j++) {
      let f = Math.pow(2, j * step)
      if (f > minFrequency) {
        steps.push(f)
      }
    }

    let fResolution = fs / array.length

    // for each frequency step
    let quantization:LogPoint[] = []
    for (let i = 0; i < steps.length; i++) {
      // calculates the interval
      let lowerBound = 0
      let upperBound = fs
      if (i > 0) {
        lowerBound = (steps[i - 1] + steps[i]) / 2
      }
      if (i < steps.length - 1) {
        upperBound = (steps[i + 1] + steps[i]) / 2
      }

      // sum all contribution in the interval
      quantization[i] = {
        magnitude: 0,
        frequency: steps[i]
      }
      for (let j = 0; j < array.length / 2; j++) {
        let frequency = j * fResolution
        if (frequency >= lowerBound && frequency < upperBound) {
          quantization[i].magnitude += array[j]
        }
      }
    }
    return quantization
  }
}
