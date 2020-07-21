<template>
<v-container class='col-12'>
    <v-row align='center' justify='center'>

      <v-card class="mx-auto col-10 mb-5 center">
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Suggested voicing</span>
    </v-card-title>

    <v-card-text>
      Suggested voicing for specific sound loaded
      <v-col class='d-flex' cols='6'>
      <v-select
        col-2
        label="Select chord tones"
        :items='chordTypes'
        @change="chordSelected"
        >
      </v-select>
      </v-col>

      <ul>
        <li v-for="(voicing,i) in voicings" :key="i">{{voicing.name}}</li>
      </ul>

    </v-card-text>
    <v-row align='center' justify='center'>
      <div style="background-color:white" ref="scorevoice"></div>
    </v-row>

  </v-card>
    </v-row>
</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import * as Vex from 'vexflow'

export interface VoicingDefinition{
  name:string
  chord: number[]
}

export interface ChordTones{
  type:string
  chord:number[]
}

@Component
export default class VoicingsPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @Ref('scorevoice') scorev:HTMLDivElement
  public renderer:Vex.Flow.Renderer
  public voicings:VoicingDefinition[] = []
  public rhRender:Vex.Flow.StaveNote[] = [] // right hand voicing
  public lhRender:Vex.Flow.StaveNote[] = [] // left hand voicing
  public CENTRAL_NOTE = 0
  public DEFAULT_OCTAVE = 3
  private TREBLE:Vex.Flow.Stave
  private BASS:Vex.Flow.Stave
  private ctx:Vex.IRenderContext
  private ACTUAL_CHORD:string = ''
  private HPCP:number[]

  public chordTypes:string[] = ['maj6', 'maj7', 'dom7', 'm7', 'dim7']
  public CHORD_TONES = [
    { type: 'maj6', chord: [4, 9] },
    { type: 'maj7', chord: [4, 11] },
    { type: 'dom7', chord: [4, 10] },
    { type: 'm7', chord: [3, 10] },
    { type: 'dim7', chord: [3, 6, 9] }
  ]

  private SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  private methods = [ // methods for chord inversion (growing order accomplished adding +10)
    { type: '1st inversion', order: [2, 13, 14, 11] },
    { type: '2nd inversion', order: [3, 14, 11, 12] },
    { type: '3rd inversion', order: [4, 11, 12, 13] }
  ]

  mounted () { // draw the lines
    this.renderer = new Vex.Flow.Renderer(this.scorev, Vex.Flow.Renderer.Backends.SVG)
    this.renderer.resize(630, 400)
    this.freshSVG()

    this.store.getHCPC().subscribe(hcpc => {
      if (hcpc) {
        this.HPCP = hcpc
      }
    })
  }

  private chordSelected (chord:string) {
    let filtered = this.CHORD_TONES.filter(x => x.type === (chord))[0] // select type of chord with its guide tones
    this.ctx.clear()
    this.freshSVG()

    // empty all the global variables on new sample loaded
    this.rhRender = []
    this.lhRender = []

    const notes = [...filtered.chord, 0, 7].sort((a, b) => a - b) // add root and 5th, sort them in increasing order

    const fundamental = this.HPCP.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) // find the max index
    const voicings = this.methods.map(x => { // iterate on all possible moves
      let moves = x.order // how to move the note according to voicing rule
      let name = x.type
      let voicing = [] // preallocate rearrenged chord
      for (let i = 0; i < moves.length; i++) {
        let m = moves[i]
        if (m > 0 && m < 10) { // no octave spacing m <10
          voicing.push(notes[m - 1])
        }
        if (m > 0 && m > 10) { // octave spacing m>10
          voicing.push(notes[m - 10 - 1] + 12) // one octave above
        }
        if (m < 0) {
          voicing.push(notes[-m - 1] - 12) // one octave below
        }
      }

      return { name: name,
        chord: voicing,
        score: voicing.map((y, i) => {
          const positionalCoef:number = i === 0 ? 0.9 : 1 - i * 0.01
          return positionalCoef * this.HPCP[(y + 12 + fundamental) % 12]
        })
          .reduce((x, y) => x + y) }
    })
      .sort((x, y) => y.score - x.score).slice(0, 3)
    this.voicings = voicings.map(x => { return { name: x.name, chord: x.chord } })
    this.createChords()
    this.drawChords()
  }

  private toNote (note:number):string { // return a string representation of the note
    let idx = note + this.CENTRAL_NOTE
    console.log(idx)
    if (idx < 0) {
      return this.SCALE[mod(idx, 12)] + '/' + (this.DEFAULT_OCTAVE).toString()// below octave
    } if (idx >= 12) {
      return this.SCALE[mod(idx, 12)] + '/' + (this.DEFAULT_OCTAVE + 1).toString() // octave above
    } else {
      return this.SCALE[mod(idx, 12)] + '/' + (this.DEFAULT_OCTAVE).toString() // same octave
    }
  }

  private hasModifier (note:number):boolean { // return a string representation of the note
    let idx = note + this.CENTRAL_NOTE
    return this.SCALE[mod(idx, 12)].length > 1
  }

  private createChords () { // all the notes within the chord in semitone distances
    let chords = this.voicings.map(a => a.chord)

    chords.forEach(chord => { // for each chord
      let noteLefthand:string[] = []
      let noteRighthand:string[] = []
      chord.forEach(note => { // for each note within the chord
        let nota = this.toNote(note)
        let oct = nota.slice(-1)
        if (parseInt(oct) > 3) { noteRighthand.push(nota) } else { noteLefthand.push(nota) }
      }) // once got the names of the note in an array of strings add the stavenote object to an array (octave splitting bw octaves)

      console.log(noteRighthand)
      console.log(noteLefthand)
      const modifiers = chord.map(this.hasModifier)
      let staveright = new Vex.Flow.StaveNote({ clef: 'treble',
        keys: [...noteRighthand],
        duration: '1' })

      const staveNote = modifiers.slice(1).forEach((hasModifier, i) => {
        if (hasModifier) {
          return staveright.addAccidental(i, new Vex.Flow.Accidental('#'))
        }
      })

      let staveleft = new Vex.Flow.StaveNote({ clef: 'bass', keys: [...noteLefthand], duration: '1' })
      const staveNote2 = modifiers.slice(0, 1).forEach((hasModifier, i) => {
        if (hasModifier) {
          return staveleft.addAccidental(i, new Vex.Flow.Accidental('#'))
        }
      })
      this.rhRender.push(staveright)
      this.lhRender.push(staveleft)
    })
  }

  private drawChords () {
    // Create a voice in free mode and add the notes from above
    let voiceT = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 }).setMode(2)
    voiceT.addTickables(this.rhRender)
    let voiceA = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 }).setMode(2)
    voiceA.addTickables(this.lhRender)

    // Format and justify the notes to 400 pixels.
    var formatter = new Vex.Flow.Formatter().joinVoices([voiceT]).format([voiceT, voiceA], 400)

    // Render voice
    voiceA.draw(this.ctx, this.BASS)
    voiceT.draw(this.ctx, this.TREBLE)
  }

  private freshSVG () {
    this.ctx = this.renderer.getContext()
    this.TREBLE = new Vex.Flow.Stave(25, 0, 600)
    this.TREBLE.addClef('treble')
    this.TREBLE.setContext(this.ctx).draw()
    this.BASS = new Vex.Flow.Stave(25, 120, 600)
    this.BASS.addClef('bass')
    this.BASS.setContext(this.ctx).draw()

    new Vex.Flow.StaveConnector(this.TREBLE, this.BASS).setType(3).setContext(this.ctx).draw() // 3 = brace
    new Vex.Flow.StaveConnector(this.TREBLE, this.BASS).setType(1).setContext(this.ctx).draw()
    new Vex.Flow.StaveConnector(this.TREBLE, this.BASS).setType(6).setContext(this.ctx).draw()

    return this.renderer.getContext()
  }

  private redrawStave () {
    this.renderer.getContext().clear()
    this.freshSVG()
    this.rhRender = []
    this.lhRender = []

    this.createChords()
    this.drawChords()
  }
}

function mod (n:number, m:number) {
  return ((n % m) + m) % m
}
</script>
