import { injectable } from 'inversify-props'
import { Note, Notes } from '@/model/note'

export interface NoteFrequencyProvider {
    allNotes():Note[];
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
        name: Notes[(12*10 + n) % 12]
      })
    }
    console.log(notes)
    return notes
  }
}
