<template>
<v-container class='col-12'>
    <v-row align='center' justify='center'>

      <v-card class="mx-auto col-10 mb-5 center">
        <v-card-title>
          <v-icon large left color='orange darken-2'>fab fa-itunes-note</v-icon>
          <span class="title font-weight-light">Overtones presenter</span>
        </v-card-title>
        <v-card-text>This is going to draw a pentagram with the overtones of the sound loaded.</v-card-text>
        <v-row align='center' justify='center'>
          <div style="background-color:white;" ref="scoreh"></div>
        </v-row>
      </v-card>
    </v-row>
</v-container>
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
    private ctx:Vex.IRenderContext
    private renderer:Vex.Flow.Renderer

    mounted () {
      this.renderer = new Vex.Flow.Renderer(this.score, Vex.Flow.Renderer.Backends.SVG)
      this.renderer.resize(662, 350)
      this.freshSVG()

      this.store.getSpectralPeaks().subscribe(peaks => {
        if (peaks) {
          this.ctx.clear()
          this.freshSVG()
          this.notes = [] // empty the global variable

          this.notes = peaks.map(a => this.notemgt.freqToNote(a))
          this.drawTones(this.ctx)
        }
      })
    }

    drawTones (ctx:Vex.IRenderContext) {
      var notesBASS:Vex.Flow.StaveNote[] = []
      var notesTREBLE:Vex.Flow.StaveNote[] = []
      var notesALTO:Vex.Flow.StaveNote[] = []

      this.notes.forEach(n => {
        let oct = n.substring(n.length - 1) // octave 4-5-6
        let val = n.substring(0,1) // note value C-D-E
        let myclef = this.clefS(oct) // string of the clef
        let clefref = this.clefRef(oct)

          const vexNote = val + '/' + oct
          var vexn = new Vex.Flow.StaveNote({ clef: myclef, keys: [vexNote], duration: 'q' })

          if(n.includes('#')) {
            vexn.addAccidental(0,new Vex.Flow.Accidental('#'))
          }

          switch (myclef) {
            case ('alto') : notesALTO.push(vexn); break
            case ('treble') : notesTREBLE.push(vexn); break
            default: notesBASS.push(vexn)
          }
      })

      const vexNotes = [notesTREBLE,notesALTO,notesBASS]
      const vexContexts = [this.TREBLE,this.ALTO,this.BASS]
      
      const vexVoice = vexNotes.filter(x => x.length > 0).map(x => {
        return new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 }).setMode(2).addTickables(x)
      })
      let formatter = new Vex.Flow.Formatter().format(vexVoice, 400)

      vexNotes.forEach((x,i) => {
        if(x.length > 0)
          vexVoice[i].draw(ctx,vexContexts[i])
      })

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

    freshSVG () {
      this.ctx = this.renderer.getContext()

      this.TREBLE = new Vex.Flow.Stave(10, 40, 650)
      this.TREBLE.addClef('treble')
      this.TREBLE.setContext(this.ctx).draw()
      this.ALTO = new Vex.Flow.Stave(10, 120, 650)
      this.ALTO.addClef('alto')
      this.ALTO.setContext(this.ctx).draw()
      this.BASS = new Vex.Flow.Stave(10, 200, 650)
      this.BASS.addClef('bass')
      this.BASS.setContext(this.ctx).draw()

      return this.renderer.getContext()
    }
}
</script>
