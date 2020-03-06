import { injectable } from 'inversify-props'
import { Note, Notes } from '@/model/note'

export interface NoteFrequencyProvider {
    allNotes():Note[];

    spectrumQuantize(fs: number, fft: number[]):number[];
}

@injectable()
export class NoteFrequencyProviderImpl implements NoteFrequencyProvider {
  private f0 = 440;
  private minNote = -60 // correspond to 13.75 Hz
  private maxNote = 65 // 19 ~kHz

  private noteFrequency (step:number):number {
    return this.f0 * Math.pow(2, step / 12)
  }

  allNotes () {
    let notes:Note[] = []
    for (let n = this.minNote; n < this.maxNote; n++) {
      notes.push({
        frequency: this.noteFrequency(n),
        octave: Math.floor((n - 3) / 12) + 5,
        name: Notes[(12 * 10 + n) % 12]
      })
    }
    return notes
  }

  spectrumQuantize (fs:number, fft: number[]): number[] {
    let notes = this.allNotes()
    let fStep = fs / fft.length
    let quantization = []

    for (let note = 1; note < notes.length; note++) {
      let lowerBound = (notes[note - 1].frequency + notes[note].frequency) / 2
      let upperBound = (notes[note + 1].frequency + notes[note].frequency) / 2
      quantization[note] = 0

      for (let j = 0; j < fs / 2; j++) {
        let frequency = j * fStep
        if (frequency >= lowerBound && frequency < upperBound) {
          quantization[note] += fft[j]
        }
      }
    }
    return quantization
  }
}
