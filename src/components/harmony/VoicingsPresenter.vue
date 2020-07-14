<template>
  <v-card class='mx-auto col-10 mt-5 space-around'>
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
  public voicings:VoicingDefinition[] = []
  public voicingsRender:Vex.Flow.StaveNote[] = []
  public CENTRAL_NOTE = 0
  public DEFAULT_OCTAVE = 4
  private TREBLE:Vex.Flow.Stave
  private ALTO:Vex.Flow.Stave
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
    const renderer = new Vex.Flow.Renderer(this.scorev, Vex.Flow.Renderer.Backends.SVG)
    renderer.resize(1400, 350)
    this.ctx = renderer.getContext()
    this.TREBLE = new Vex.Flow.Stave(10, 40, 800)
    this.TREBLE.addClef('treble')
    this.TREBLE.setContext(this.ctx).draw()
    this.ALTO = new Vex.Flow.Stave(10, 120, 800)
    this.ALTO.addClef('alto')
    this.ALTO.setContext(this.ctx).draw()

    this.store.getHCPC().subscribe(hcpc => {
      if (hcpc) {
        const foundamental = hcpc.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) // find the max index
        const voicings = this.definitions.map(x => {
          return { chord: x, score: x.chord.map(y => hcpc[(y + 12 + foundamental) % 12]).reduce((x, y) => x + y) }
        }).sort((x, y) => y.score - x.score).slice(0, 3)
        this.voicings = voicings.map(x => x.chord)
        this.createChords()
        console.log(this.voicingsRender)
        this.drawChords()
      }
    })
  }

  private toNote (note:number):string { // return a string representation of the note
    let idx = note + this.CENTRAL_NOTE

    if (idx < 0) {
      return this.SCALE[mod(idx, 12)] + '/' + (this.DEFAULT_OCTAVE - 1).toString()// below octave
    } if (idx > 12) {
      return this.SCALE[mod(idx, 12)] + '/' + (this.DEFAULT_OCTAVE + 1).toString() // octave above
    } else {
      return this.SCALE[mod(idx, 12)] + '/' + (this.DEFAULT_OCTAVE).toString() // same octave
    }
  }

  private createChords () { // all the notes within the chord in semitone distances
    let chords = this.voicings.map(a => a.chord)
    chords.forEach(chord => { // for each chord
      let notestr:string[] = []

      chord.forEach(note => { // for each note within the chord
        notestr.push(this.toNote(note))
      }) // once got the names of the note in an array of strings add the stavenote object to an array
      let c = new Vex.Flow.StaveNote({ keys: [notestr.join(',')], duration: 'q' })
      console.log(c)
      this.voicingsRender.push(c)
    })
  }

  private drawChords () {
    // Create a voice in 4/4 and add the notes from above
    var voice = new Vex.Flow.Voice({ num_beats: 3, beat_value: 4 }).setMode(2)
    voice.addTickables(this.voicingsRender)

    // Format and justify the notes to 400 pixels.
    var formatter = new Vex.Flow.Formatter().format([voice], 400)

    // Render voice
    voice.draw(this.ctx, this.TREBLE)
  }
}

function mod (n:number, m:number) {
  return ((n % m) + m) % m
}
</script>
