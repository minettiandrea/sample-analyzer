
export interface Note{
    name: 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
}

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

export const QuarterRythm = new Quarter({ name: 'B' })
