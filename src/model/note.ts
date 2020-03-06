
type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export interface Note{
    name: NoteName;
    octave: number;
    frequency: number;
}

export const Notes:NoteName[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

export interface NoteElement{
    duration:number
    note?:Note
    pause:boolean
}

export class Quarter implements NoteElement {
  constructor (n:Note) {
    this.note = n
  }
    duration = 0.25
    note:Note
    pause = false
}

export class QuarterPause implements NoteElement {
    duration = 0.25
    pause = true
}

export const ConstNote:Note = { name: 'B', octave: 0, frequency: 0 }

export const QuarterRythm = new Quarter(ConstNote)
