<template>
<v-card class='mx-auto col-12'>
    <v-card-title>
      <v-icon large left color='orange darken-2'>fab fa-itunes-note</v-icon>
      <span class="title font-weight-light">Overtones presenter</span>
    </v-card-title>
    <v-card-text>This is going to draw a pentagram with the overtones of the sound loaded.</v-card-text>
    <div style="background-color:white" ref="scoreh"></div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import * as Vex from 'vexflow'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { NoteFrequencyProvider } from '../../services/providers/note-frequency'
import { Component, Ref } from 'vue-property-decorator'
import { EssentiaSpectralExtractor } from '@/services/spectral-extractor/essentia-spectral-extractor'

@Component
export default class OvertonesPresenter extends Vue {
    @Ref('scoreh') score!:HTMLDivElement
    @inject(REGISTRY.Store) store:Store
    @inject(REGISTRY.NoteFrequencyProvider) notemgt:NoteFrequencyProvider
    @inject(REGISTRY.SpectralExtractor) spectralExtractor: EssentiaSpectralExtractor;

    private notes:String[]
    private TREBLE:Vex.Flow.Stave
    private ALTO:Vex.Flow.Stave
    private BASS:Vex.Flow.Stave

    mounted () {
      const renderer = new Vex.Flow.Renderer(this.score, Vex.Flow.Renderer.Backends.SVG)
      renderer.resize(1400, 350)
      const context = renderer.getContext()
      this.TREBLE = new Vex.Flow.Stave(10, 40, 800)
      this.TREBLE.addClef('treble')
      this.TREBLE.setContext(context).draw()
      this.ALTO = new Vex.Flow.Stave(10, 120, 800)
      this.ALTO.addClef('alto')
      this.ALTO.setContext(context).draw()
      this.BASS = new Vex.Flow.Stave(10, 200, 800)
      this.BASS.addClef('bass')
      this.BASS.setContext(context).draw()

      this.store.getSpectralPeaks().subscribe(peaks => {
        if (peaks) {
          this.notes = peaks.map(a => this.notemgt.freqToNote(a))
          this.drawTones(context)
        }
      })
    }

    drawTones (ctx:Vex.IRenderContext) {
      var notesBASS:Vex.Flow.StaveNote[] = []
      var notesTREBLE:Vex.Flow.StaveNote[] = []
      var notesALTO:Vex.Flow.StaveNote[] = []

      this.notes.forEach(n => {
        let oct = n.substring(n.length - 1) // octave 4-5-6
        let val = n.substring(0, n.length - 1) // note value C-D-E
        let myclef = this.clefS(oct) // string of the clef
        let clefref = this.clefRef(oct)
        var vexn = new Vex.Flow.StaveNote({ clef: myclef, keys: [val + '/' + oct], duration: '1' })

        switch (myclef) {
          case ('alto') : notesALTO.push(vexn); break
          case ('treble') : notesTREBLE.push(vexn); break
          default: notesBASS.push(vexn)
        }
      })

      let voiceB = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 }).setMode(2).addTickables(notesBASS)
      let voiceT = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 }).setMode(2).addTickables(notesTREBLE)
      let voiceA = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 }).setMode(2).addTickables(notesALTO)
      let formatter = new Vex.Flow.Formatter().format([voiceB, voiceT, voiceA], 250)
      voiceB.draw(ctx, this.BASS)
      voiceT.draw(ctx, this.TREBLE)
      voiceA.draw(ctx, this.ALTO)
    }

    clefS (oct:string):string {
      switch (oct) {
        case '5': case '6': return 'treble'
        case '4': case '3': return 'alto'
        default: return 'bass'
      }
    }

    clefRef (oct:string):Vex.Flow.Stave {
      switch (oct) {
        case '5': case '6': return this.TREBLE
        case '4': case '3': return this.ALTO
        default: return this.BASS
      }
    }
}
</script>
