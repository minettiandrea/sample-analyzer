<template>
<v-container class='col-12' >
  <v-row align='center' justify='center'>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <div class='wrapper'
      ref='canvas-wrapper'
      @mouseover="hover = true"
      @mouseleave="hide()">
      <canvas ref='waveformchild'
      class='waveform'> </canvas>
      <canvas ref='waveform' class='waveform'>
      </canvas>
    </div>
  </v-card>
  </v-row>
  <v-row align='center' justify='center'>
      <AudioPlayer />
  </v-row>
</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import AudioPlayer from './AudioPlayer.vue'

import { Component, Ref } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { AudioContextProvider } from '../../services/providers/context-provider'
import { TimeInterval } from 'rxjs'

export class Line {
  ctx:CanvasRenderingContext2D
  color:string
  id:string
  x: number // expressed in %
  visible: boolean

  constructor (ctx:CanvasRenderingContext2D, color:string, id:string, x: number, visible: boolean) {
    this.ctx = ctx
    this.color = color
    this.id = id
    this.x = x
    this.visible = visible
  }

  draw () {
    if (this.visible) {
      switch (this.id) {
        case ('playing'): {
          this.ctx.clearRect(0, 0, this.ctx.canvas.offsetWidth, this.ctx.canvas.offsetHeight)

          let posX = Math.floor(this.x * this.ctx.canvas.offsetWidth / 100)
          this.ctx.fillStyle = this.color
          if (posX > 0) {
            this.ctx.fillRect(posX, 0, 5, this.ctx.canvas.offsetHeight)
          }
          break
        }

        case ('mouse'): {
          if (this.x > 0) {
            this.ctx.strokeStyle = 'red'
            this.ctx.lineWidth = 1.5
            this.ctx.beginPath()
            this.ctx.moveTo(this.x, 0)
            this.ctx.lineTo(this.x, this.ctx.canvas.offsetHeight)
            this.ctx.stroke()
          }
          break
        }
      }
    }
  }
}

@Component({
  components: { AudioPlayer
  }
})
export default class WaveformPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @Ref('waveform') readonly canvasdom!: HTMLCanvasElement
  @Ref('waveformchild') readonly canvasalpha!: HTMLCanvasElement
  @Ref('canvas-wrapper') readonly canvasWrapper!:HTMLDivElement

  private dataArray : Uint8Array
  private data : number[]
  private context : CanvasRenderingContext2D | null
  private contextAlpha : CanvasRenderingContext2D | null
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
      this.playingCursor = new Line(ctxAlpha, 'orange', 'playing', 0, false)
      this.mouseCursor = new Line(ctxAlpha, 'red', 'mouse', 0, false)
      this.objects = [this.playingCursor, this.mouseCursor] // ho spostato qui perche' viene creato un nuovo "puntatore" con il new, quindi i riferimenti che vi erano in object erano vecchi, funziona?
    }
    this.setUp(canvas, 1)
    this.setUp(this.canvasalpha, this.GLOBALALPHA)
    this.mouseHandler()

    this.store.sample().subscribe(s => {
      if (s) {
        this.data = this.filterData(s) // sempre uguale.
        this.strokeCanvas()
      }
    })

    this.store.playing().subscribe(p => {
      this.playingCursor.x = Math.floor(p.elapsed / p.length * 100)
      this.playingCursor.visible = true
      this.redraw()
    })
  }

  redraw () { // chiamiamolo redraw cosi si distingue dal draw del line
    this.objects.forEach(o => o.draw()) // e' `o` che e' undefined
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
    const data = audiobuffer.getChannelData(0) // left channel? maybe taking the average
    const bars = 12000 // number of bars to plot
    const blocksize = Math.floor(data.length / bars) // how many samples in each block
    var dataf : number [] = [] // initialize the output

    for (let i = 0; i < bars; i++) { // for each bar
      let blockbegins = blocksize * i
      let sum = 0

      for (let j = 0; j < blocksize; j++) { // in each bar I sum up the values of each sample
        sum = sum + Math.abs(data[blockbegins + j])
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
      this.mouseCursor.x = e.offsetX
      this.mouseCursor.visible = true
      this.redraw()
    }
  }

  hide () {
    this.mouseCursor.x = 0
    this.mouseCursor.visible = false
    this.redraw()
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
