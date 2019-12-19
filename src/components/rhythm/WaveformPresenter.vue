<template>
<v-container class='col-12' >
  <v-row align='center' justify='center'>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <div class='wrapper'
      ref='canvas-wrapper'
      @mouseover="hover = true"
      @mouseleave="hide"
      @click='skip'>
      <canvas ref='waveform' class='waveform'>
      </canvas>
      <canvas ref='waveformchild'
      class='waveform'> </canvas>

    </div>
  </v-card>
  </v-row>
  <v-row align='center' justify='center'>
      <AudioPlayer />
      <Legend />
  </v-row>
</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import AudioPlayer from './AudioPlayer.vue'
import Legend from './Legend.vue'

import { Component, Ref } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { AudioContextProvider } from '../../services/providers/context-provider'
import { TimeInterval } from 'rxjs'
import { DummyTimeExtractor } from '@/services/time-extractor/dummy-time-extractor'

export class Line {
  ctx:CanvasRenderingContext2D
  color:string
  width:number
  x: number // expressed in %
  visible: boolean

  constructor (ctx:CanvasRenderingContext2D, color:string, width:number, x: number, visible: boolean) {
    this.ctx = ctx
    this.color = color
    this.width = width
    this.x = x
    this.visible = visible
  }

  draw () {
    if (this.visible) {
      this.ctx.strokeStyle = this.color
      this.ctx.lineWidth = this.width
      this.ctx.beginPath()
      let posx = this.ctx.canvas.offsetWidth * this.x
      this.ctx.moveTo(posx, 0)
      this.ctx.lineTo(posx, this.ctx.canvas.offsetHeight)
      this.ctx.stroke()
    }
  }
}

@Component({
  components: { AudioPlayer,
    Legend
  }
})
export default class WaveformPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @inject(REGISTRY.TimeExtractor) extractor:DummyTimeExtractor
  @Ref('waveform') readonly canvasdom!: HTMLCanvasElement
  @Ref('waveformchild') readonly canvasalpha!: HTMLCanvasElement
  @Ref('canvas-wrapper') readonly canvasWrapper!:HTMLDivElement

  private dialog:boolean = false
  private dataArray : Uint8Array
  private data : number[]
  private samplerate:number
  private context : CanvasRenderingContext2D | null
  public hover : boolean
  private GLOBALALPHA : number = 0.7;
  private previousInterval : NodeJS.Timeout
  private previousblock : number = 0

  private playingCursor:Line
  private mouseCursor:Line
  private objects:Line[]

  mounted () { // access canvas
    let canvas : HTMLCanvasElement = this.canvasdom
    let ctx : CanvasRenderingContext2D | null = canvas.getContext('2d')
    let canvasAlpha = this.canvasalpha
    let ctxAlpha = canvasAlpha.getContext('2d')
    if (ctx && ctxAlpha) {
      this.context = ctx // ho cambiato perché le linee le disegni sul ctx alpha (quello trasparente)
      this.playingCursor = new Line(ctxAlpha, 'orange', 3, 0, false)
      this.mouseCursor = new Line(ctxAlpha, 'red', 3, 0, false)
      this.objects = [this.playingCursor, this.mouseCursor] // ho spostato qui perche' viene creato un nuovo "puntatore" con il new, quindi i riferimenti che vi erano in object erano vecchi, funziona?
    }
    this.setUp(canvas, 1)
    this.setUp(this.canvasalpha, this.GLOBALALPHA)
    this.mouseHandler()

    this.store.sample().subscribe(s => {
      if (s) {
        this.data = this.filterData(s)
        this.samplerate = s.sampleRate
        this.extractor.analyze(s).then(te => {
          te.peaks.forEach(peak => {
            if (ctxAlpha) {
              let xpos = (peak / this.samplerate) / s.duration
              let o = new Line(ctxAlpha, 'blue', 2, xpos, true)
              this.objects.push(o)
            }
          })
        })
        this.strokeCanvas()
      }
    })

    this.store.playing().subscribe(p => {
      this.playingCursor.x = p.elapsed / p.length
      this.playingCursor.visible = true
      this.redraw()
    })

    this.store.skipped().subscribe(p => {
      if (p) {
        if (this.canvasalpha) {
          this.playingCursor.x = p * this.canvasalpha.offsetWidth
        }
      }
    })
  }

  redraw () { // chiamiamolo redraw cosi si distingue dal draw del line
    let ctx = this.canvasalpha.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, this.canvasalpha.offsetWidth, this.canvasalpha.offsetHeight)
      this.objects.forEach(o => o.draw())
    }
  }

  // setup canvas for dpi and transparency
  setUp (canvas : HTMLCanvasElement, alpha : number) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = (canvas.offsetHeight) * dpr
      ctx.scale(dpr, dpr)
      ctx.globalAlpha = alpha
    }
  }

  filterData (audiobuffer : AudioBuffer) : number[] { // something like sampling again
    const i = audiobuffer.numberOfChannels
    var channel = audiobuffer.getChannelData(0) // first channel in order to initialize channel variable

    for (let j = 1; j < i; j++) {
      var d = audiobuffer.getChannelData(j)
      channel.map((a, b) => (a + d[b]) / i)
    }
    const bars = 12000 // number of bars to plot
    const blocksize = Math.floor(channel.length / bars) // how many samples in each block
    var dataf : number [] = [] // initialize the output

    for (let i = 0; i < bars; i++) { // for each bar
      let blockbegins = blocksize * i
      let sum = 0

      for (let j = 0; j < blocksize; j++) { // in each bar I sum up the values of each sample
        sum = sum + Math.abs(channel[blockbegins + j])
        // sum
      }
      dataf.push(sum / blocksize) // pushes the average of each block into an array
    }
    const factor = Math.max(...dataf)
    dataf = dataf.map(n => n * (1 / factor)) // average respect to the max
    return dataf
  }

  strokeCanvas () {
    if (this.context) {
      let canvas : HTMLCanvasElement = this.canvasdom

      this.context.translate(0, canvas.offsetHeight / 2) // Set Y = 0 to be in the middle of the canvas

      const width = canvas.offsetWidth / this.data.length
      const height = canvas.offsetHeight
      const padding = 10
      for (let i = 0; i < this.data.length; i++) {
        let x = i * width
        let y = this.data[i] * (height / 2) - padding

        this.drawLine(this.context, x, y)
      }
    }
  }

  drawLine (ctx : CanvasRenderingContext2D, x : number, y : number) {
    ctx.lineWidth = 0.5
    ctx.strokeStyle = 'orange'
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, -y)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  /// /////////////

  // ANIMATION WITH MOUSE OVER
  mouseHandler () {
    if (this.canvasWrapper) {
      this.canvasWrapper.addEventListener('mousemove', this.onMouseMove)
    }
  }

  onMouseMove (e: MouseEvent) {
    if (this.hover) {
      this.mouseCursor.x = e.offsetX / this.canvasalpha.offsetWidth
      this.mouseCursor.visible = true
      this.redraw()
    }
  }

  hide () {
    this.mouseCursor.x = 0
    this.mouseCursor.visible = false
    this.redraw()
  }

  // click event managing, skips to another sample
  skip (e: MouseEvent) {
    let pos = Math.floor(e.offsetX / this.canvasalpha.offsetWidth * 100)
    this.store.nextSkipped(pos)
  }
}

</script>

<style lang="scss" scoped>

  .wrapper {
   height: 275px;
   position: relative; /* add */
}

.waveform{
  width:100%;
  height:275px;
  position:absolute;
  left: 0;
  top: 0;
}

</style>
