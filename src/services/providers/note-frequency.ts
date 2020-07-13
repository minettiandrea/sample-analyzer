import { injectable } from 'inversify-props'
import { Note, Notes } from '@/model/note'

export interface NoteWeigth{
  note:Note
  magnitude: number
}

export interface NoteFrequencyProvider {
    allNotes():Note[];
    freqToNote(f:number):String;
}

@injectable()
export class NoteFrequencyProviderImpl implements NoteFrequencyProvider {
  private f0 = 440;
  private NOTE = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

  private minNote = -60 // correspond to 13.75 Hz
  private maxNote = 65 // 19 ~kHz

  private noteFrequency (step:number):number {
    return this.f0 * Math.pow(2, step / 12)
  }

  freqToNote (freq:number):String {
    let deltacents = Math.floor(1200 * Math.log(freq / this.f0) / Math.log(2)) // cents formula
    let deltanote = Math.floor(deltacents / 100) // 100 cents = 1 semitone
    if (deltanote % 100 > 50) { deltanote++ }

    let note = deltanote + 48 // count semitones starting from c0 - 16.35Hz
    let octave = Math.ceil(note / 12)

    let idx = (note + 1) % 12
    return (this.NOTE[idx] + octave.toString())
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
}
