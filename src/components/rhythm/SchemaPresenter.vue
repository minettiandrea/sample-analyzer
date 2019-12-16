<template>
  <v-card class='mx-auto col-12 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Rythmic schema</span>
    </v-card-title>
    <v-card-text>Show rhythmic schema.</v-card-text>
    <div style="background-color:white" ref="score"></div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'
import * as Vex from 'vexflow'
import { NoteElement, QuarterRythm, Note } from '@/model/note'

@Component
export default class SchemaPresenter extends Vue {
  @Ref('score') score!:HTMLDivElement

  mounted () {
    const renderer = new Vex.Flow.Renderer(this.score, Vex.Flow.Renderer.Backends.SVG)

    // Size our svg:
    renderer.resize(1400, 300)

    // And get a drawing context:
    const context = renderer.getContext()

    const notes = [QuarterRythm, QuarterRythm, QuarterRythm, QuarterRythm, QuarterRythm, QuarterRythm]
    const bars = this.splitBars(notes)
    console.log(bars)
    const width = 400
    bars.forEach((bar, i) => {
      if (i === 0) {
        this.drawBar(bar, 10, context, stave => stave.addClef('percussion').addTimeSignature('4/4'))
      } else if (i === (bars.length - 1)) {
        this.drawBar(bar, i * width + 10, context, stave => stave.setEndBarType(Vex.Flow.Barline.type.END))
      } else {
        this.drawBar(bar, i * width + 10, context)
      }
    })

    this.drawBar([], 410, context)
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

  private drawBar (notes:NoteElement[], left:number, context: Vex.IRenderContext, modifier: (stave:Vex.Flow.Stave) => void = (() => {})):void {
    var stave = new Vex.Flow.Stave(left, 40, 400).setConfigForLines(
      [false, false, true, false, false].map(function (visible) {
        return { visible: visible }
      }))

    modifier(stave)

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw()

    const _notes = notes.map(note => {
      console.log((note.duration.toString() + 'd'))
      return new Vex.Flow.StaveNote({ clef: 'percussion', keys: ['b/4/x2'], duration: this.toVexDuration(note.duration) })
    })

    var beams = Vex.Flow.Beam.generateBeams(_notes)
    Vex.Flow.Formatter.FormatAndDraw(context, stave, _notes)
    beams.forEach(function (b) { b.setContext(context).draw() })
  }
}
</script>
