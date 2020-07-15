<template>
  <v-card class='mx-auto col-12 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Rythmic schema</span>
    </v-card-title>
    <div style="background-color:white" ref="score"></div>

    <div class='mb-6 col-12 d-flex justify-space-around'>
      <v-chip
      v-for="i in (this.r1*this.r2)"
      :key=' i'
      :color="colorMask(color1,mask1[i-1])"
      >x</v-chip>
    </div>

    <div class='mb-6 col-12 d-flex justify-space-around'>
      <v-chip
      v-for="i in (this.r1*this.r2)"
      :key='i+10'
      :color="colorMask(color2,mask2[i-1])"
       > x</v-chip>
    </div>

    <v-card-text>
      <input v-model.number="r1" placeholder="?" class="text-center"> against :<input v-model.number="r2" placeholder="?" class="text-center">
    <v-btn @click="drawPoly" @change='clearPoly'> Visualize possible polyrhythm </v-btn>
    <v-btn @click="clearPoly" @change='clearPoly'> Clear all </v-btn>
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
import { Color } from 'vuetify/lib/util/colors'

@Component
export default class SchemaPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @Ref('score') score!:HTMLDivElement

  r1 :number = 4;
  r2 :number = 3;
  peaks:number[] = [];
  notes: any[] = [];
  tuplets : any[] = []
  renderer:Vex.Flow.Renderer;
  ctx:Vex.IRenderContext
  polystave:Vex.Flow.Stave
  mask1:boolean[] = []
  mask2:boolean[] = []
  color1:string = 'green'
  color2:string = 'yellow'
  POLYACTIVE:boolean = false

  mounted () {
    this.createMask()
    this.ctx = this.freshSVG()
    this.store.timeAnalysis().subscribe(ta => {
      if (ta) {
        this.notes = [QuarterRythm] // clear notes with just initial beat
        this.ctx.clear()
        this.renderer.getContext().clear()
        this.peaks = ta.peaks
        this.peaks.forEach(() => this.notes.push(QuarterRythm))

        this.drawRhythm(this.renderer.getContext(), this.notes, 10, this.r1.toString())
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

  private drawRhythm (ctx:Vex.IRenderContext, notes:any[], height:number, signature:string) {
    const bars = this.splitBars(notes)
    const width = 400
    bars.forEach((bar, i) => {
      if (i === 0) {
        this.drawBar(bar, 10, height, ctx, stave => stave.addClef('percussion').addTimeSignature(signature + '/' + 4))
      } else if (i === (bars.length - 1)) {
        this.drawBar(bar, i * width + 10, height, ctx, stave => stave.setEndBarType(Vex.Flow.Barline.type.END))
      } else {
        this.drawBar(bar, i * width + 10, height, ctx)
      }
    })

    this.drawBar([], 410, height, ctx)
  }

  private drawPoly () {
    if (this.r1 % this.r2 === 0 || this.r2 % this.r1 === 0) return alert('This is not possible...')
    if (this.r1 * this.r2 > 100) return alert('Tigran... is that you?')
    this.POLYACTIVE = true
    this.mask1 = []
    this.mask2 = []
    this.createMask()
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
    this.drawRhythm(this.ctx, this.notes, 120, this.r2.toString())
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

  private createMask () {
    this.mask1 = []
    this.mask2 = []

    let mcm = this.r1 * this.r2

    for (let i = 0; i < mcm; i++) {
      if (i % this.r2 === 0 || i === 0) {
        this.mask1.push(true)
      } else { this.mask1.push(false) }
    }

    for (let i = 0; i < mcm; i++) {
      if (i % this.r1 === 0 || i === 0) {
        this.mask2.push(true)
      } else { this.mask2.push(false) }
    }
    console.log(this.mask1)
    console.log(this.mask2)
  }

  colorMask (color:string, mask:boolean) {
    if (this.POLYACTIVE) {
      if (mask) return color
      else return 'grey'
    } else return 'grey'
  }

  deactivatePoly () {
    this.POLYACTIVE = false
  }
}
</script>
