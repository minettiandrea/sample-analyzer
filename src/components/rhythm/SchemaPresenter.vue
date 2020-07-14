<template>
  <v-card class='mx-auto col-12 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Rythmic schema</span>
    </v-card-title>
    <div style="background-color:white" ref="score"></div>
    <v-card-text>
      <input v-model.number="r1" placeholder="?" class="text-center"> against :<input v-model.number="r2" placeholder="?" class="text-center">
    <v-btn @click="drawPoly"> Visualize possible polyrhythm </v-btn>
    <v-btn @click="clearPoly"> Clear all </v-btn>
    </v-card-text>

  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'
import * as Vex from 'vexflow'
import { NoteElement, QuarterRythm, Note, Quarter } from '@/model/note'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'

@Component
export default class SchemaPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @Ref('score') score!:HTMLDivElement

  r1 :number = 4;
  r2 :number = 4;
  peaks:number[] = [];
  notes: any[] = [];
  tuplets : any[] = []
  renderer:Vex.Flow.Renderer;
  cvs:Vex.IRenderContext
  polystave:Vex.Flow.Stave

  mounted () {
    this.cvs = this.freshSVG()
    this.store.timeAnalysis().subscribe(ta => {
      if (ta) {
        this.notes = [QuarterRythm] // clear notes with just initial beat
        this.cvs.clear()
        this.renderer.getContext().clear()
        this.peaks = ta.peaks
        this.peaks.forEach(() => this.notes.push(QuarterRythm))

        this.drawRhythm(this.renderer.getContext(), this.notes, 10)
      }
    })
  }

  private freshSVG () {
    let renderers = new Vex.Flow.Renderer(this.score, Vex.Flow.Renderer.Backends.SVG)
    this.renderer = renderers
    // Size our svg:
    this.renderer.resize(1400, 300)
    // And get a drawing context:
    return this.renderer.getContext()
  }

  private drawRhythm (ctx:Vex.IRenderContext, notes:any[], height:number) {
    const bars = this.splitBars(notes)
    const width = 400
    bars.forEach((bar, i) => {
      if (i === 0) {
        this.drawBar(bar, 10, height, ctx, stave => stave.addClef('percussion').addTimeSignature(this.r1.toString() + '/' + this.r1.toString()))
      } else if (i === (bars.length - 1)) {
        this.drawBar(bar, i * width + 10, height, ctx, stave => stave.setEndBarType(Vex.Flow.Barline.type.END))
      } else {
        this.drawBar(bar, i * width + 10, height, ctx)
      }
    })

    this.drawBar([], 410, height, ctx)
  }

  private createPoly () { // create polyrhythmic tuplets
    let lng = this.notes.length
    let poly = this.r2
    let i = 0
    for (i; i < lng; i += poly) {
      let t = new Vex.Flow.Tuplet(this.notes.slice(i, i + poly - 1))
      this.tuplets.push(t)
    }
    // at the end of the cycle i is equal to the rest of the division
    for (i; i < lng; i++) {
      this.tuplets.push(QuarterRythm)
    }
  }

  private drawPoly () {
    let lng = this.peaks.length
    let beat = this.peaks[this.r1 - 1] // 4th peak in 4against... , 3rd peak in 3 against
    let subd = beat / this.r2
    let idx = 0
    let array = []
    let delta4 = this.peaks[1] - this.peaks[0] // separation between beats in any time signature
    while (idx * subd <= delta4 * (lng)) {
      array.push(idx * subd)
      idx++
    }
    this.store.addPolyLine(array)
    this.createPoly()
  }

  private splitBars (notes:NoteElement[]):NoteElement[][] {
    const result:NoteElement[][] = [[]]
    let i = 0
    notes.forEach(note => {
      if (result[i].reduce((sum, x) => sum + (x.duration || 0), 0) >= 1) {
        i++
        result.push([])
      }
      result[i].push(note)
    })
    return result
  }

  private toVexDuration (n:number):string {
    switch (n) {
      case 0.25: return '4d'
      default: return ''
    }
  }

  private drawBar (notes:NoteElement[], left:number, height:number, context: Vex.IRenderContext, modifier: (stave:Vex.Flow.Stave) => void = (() => {})):void {
    var stave = new Vex.Flow.Stave(left, height, 400).setConfigForLines(
      [false, false, true, false, false].map(function (visible) {
        return { visible: visible }
      }))

    modifier(stave)
    // Connect it to the rendering context and draw!
    stave.setContext(context).draw()

    const _notes = notes.map(note => {
      return new Vex.Flow.StaveNote({ clef: 'percussion', keys: ['b/4/x2'], duration: this.toVexDuration(note.duration) })
    })

    var beams = Vex.Flow.Beam.generateBeams(_notes)
    Vex.Flow.Formatter.FormatAndDraw(context, stave, _notes)
    beams.forEach(function (b) { b.setContext(context).draw() })
  }

  private clearPoly ():void{
    this.$root.$emit('clearpoly')
  }
}
</script>
