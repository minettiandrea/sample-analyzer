<template>
  <v-card class='mx-auto col-12 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Suggested voicing</span>
    </v-card-title>
    <v-card-text>
      Suggested voicing for specific sound loaded
      <ul>
        <li v-for="(voicing,i) in voicings" :key="i">{{voicing.group}} - {{voicing.name}} - {{voicing.chord}}</li>
      </ul>

    </v-card-text>

        <div style="background-color:white" ref="scorevoice"></div>

  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import * as Vex from 'vexflow'

export interface VoicingDefinition{
  group:string
  chord: number[]
  name: string
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
  public DEFAULT_OCTAVE = 4
  private TREBLE:Vex.Flow.Stave
  private BASS:Vex.Flow.Stave
  private ctx:Vex.IRenderContext

  private SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  private definitions = [
    { group: 'min7', chord: [0, 3, 10], name: '1 - b3 - b7 (no fifth)' },
    { group: 'min7', chord: [-9, -2, 0], name: '1st inversion (b3 as bass)' },
    { group: 'min7', chord: [-5, 0, 3, 10], name: '2nd inversion (5th as bass)' },
    { group: 'min7', chord: [-2, 0, 3], name: '3rd inversion (7th as bass)' },
    { group: 'maj7', chord: [0, 4, 10], name: '1 - 3 - 7 (no fifth)' },
    { group: 'maj7', chord: [-8, -1, 0], name: '1st inversion (3 as bass)' },
    { group: 'maj7', chord: [-5, 0, 4, 11], name: ' 2nd inversion (5th as bass)' },
    { group: 'maj7', chord: [-1, 0, 4], name: '3rd inversion (7th as bass)' },
    { group: 'dom7', chord: [0, 4, 10], name: '1 - 3 - b7 (no fifth)' },
    { group: 'dom7', chord: [-8, -2, 0], name: '1st inversion (3 as bass)' },
    { group: 'dom7', chord: [-5, 0, 4, 10], name: '2nd inversion (5th as bass)' },
    { group: 'dom7', chord: [-2, 0, 4], name: '3rd inversion (7th as bass)' }
  ]

  mounted () { // draw the lines
    this.renderer = new Vex.Flow.Renderer(this.scorev, Vex.Flow.Renderer.Backends.SVG)
    this.renderer.resize(1400, 350)
    this.freshSVG()

    this.store.getHCPC().subscribe(hcpc => {
      if (hcpc) {
        this.ctx.clear()
        this.freshSVG()

        // empty all the global variables on new sample loaded
        this.voicings = []
        this.rhRender = []
        this.lhRender = []

        const foundamental = hcpc.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) // find the max index
        const voicings = this.definitions.map(x => {
          return { chord: x, score: x.chord.map(y => hcpc[(y + 12 + foundamental) % 12]).reduce((x, y) => x + y) }
        }).sort((x, y) => y.score - x.score).slice(0, 3)
        this.voicings = voicings.map(x => x.chord)
        this.createChords()
        this.drawChords()
      }
    })
  }

  private toNote (note:number):string { // return a string representation of the note
    let idx = note + this.CENTRAL_NOTE

    if (idx < 0) {
      return this.SCALE[mod(idx, 12)] + '/' + (this.DEFAULT_OCTAVE - 1).toString()// below octave
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
      let notestr:string[] = []

      chord.forEach(note => { // for each note within the chord
        notestr.push(this.toNote(note))
      }) // once got the names of the note in an array of strings add the stavenote object to an array

      const modifiers = chord.map(this.hasModifier)

      let c = new Vex.Flow.StaveNote({ clef: 'treble',
        keys: [...notestr.slice(1)],
        duration: '1' })

      const staveNote = modifiers.slice(1).forEach((hasModifier, i) => {
        if (hasModifier) {
          return c.addAccidental(i, new Vex.Flow.Accidental('#'))
        }
      })

      this.rhRender.push(c)
      this.lhRender.push(new Vex.Flow.StaveNote({ clef: 'bass', keys: [notestr[0]], duration: '1' }))
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
