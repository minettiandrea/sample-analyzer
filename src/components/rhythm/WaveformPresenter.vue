<template>
<v-container class='col-12' >
  <v-row align='center' justify='center'>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <div class='wrapper'
      id='canvas-wrapper'
      @mouseover.native="hover = true"
      @mouseleave.native="hover = false">
      <canvas ref='waveformchild'
      id='waveformchild'
      class='waveform'> </canvas>
      <canvas ref='waveform' class='waveform'>
      </canvas>
    </div>
  </v-card>
  </v-row>
  <v-row align='center' justify='center'>
      <AudioPlayer  v-on:isPlaying='drawPlaying'/>
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

@Component({
  components: { AudioPlayer
  }

})
export default class WaveformPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @Ref('waveform') readonly canvasdom!: HTMLCanvasElement
  @Ref('waveformchild') readonly canvasalpha!: HTMLCanvasElement

  private dataArray : Uint8Array
  private data : number[]
  private context : CanvasRenderingContext2D | null
  public hover : boolean = true
  private GLOBALALPHA : number = 0.5;
  private previousInterval : number
  private previousblock : number = 0

  mounted () { // access canvas
    let canvas : HTMLCanvasElement = this.canvasdom
    let ctx : CanvasRenderingContext2D | null = canvas.getContext('2d')
    this.store.sample().subscribe(s => {
      if (s) {
        this.data = this.filterData(s)
        if (ctx) {
          this.context = ctx
          this.strokeCanvas(ctx)
          this.mouseHandler()
        }
      }
    })
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

  strokeCanvas (ctx : CanvasRenderingContext2D) {
    let canvas : HTMLCanvasElement = this.canvasdom
    this.setUp(canvas, ctx)
    ctx.translate(0, canvas.offsetHeight / 2) // Set Y = 0 to be in the middle of the canvas

    const width = canvas.offsetWidth / this.data.length
    const height = canvas.offsetHeight
    const padding = 10
    for (let i = 0; i < this.data.length; i++) {
      let x = i * width
      let y = this.data[i] * (height / 2) - padding

      this.drawLine(ctx, x, y)
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

  drawPlaying (length : number, sampletime : number, status : boolean) { // status: true playing, false in pause
    // emitted, check in audioplayer play() function

    let ctx = this.canvasalpha.getContext('2d')
    var width = this.canvasalpha.offsetWidth
    let height = this.canvasalpha.offsetHeight

    const blocksize = Math.floor(width / 100)
    if (status) { // TRUE is playing
      if (ctx) {
        this.setUp(this.canvasalpha, ctx)
        ctx.globalAlpha = this.GLOBALALPHA
        ctx.clearRect(0, 0, width, height)
      }
      let it = setInterval(() => {
        if (ctx && this.previousblock < width) {
          ctx.fillStyle = 'orange'
          ctx.beginPath()
          ctx.fillRect(this.previousblock, 0, blocksize, height)

          if (this.previousblock > 0) {
            ctx.clearRect(this.previousblock - blocksize, 0, blocksize, height)
          }
          this.previousblock += blocksize
        } else if (ctx && this.previousblock >= width) {
          clearInterval(it)
        }
      }
      , Math.ceil(length * 1000 / (this.canvasalpha.offsetWidth / Math.floor(this.canvasalpha.offsetWidth / 100))))
      this.previousInterval = it
    } else {
      clearInterval(this.previousInterval)
    }
  }

  setUp (canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) {
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = (canvas.offsetHeight) * dpr
    ctx.scale(dpr, dpr)
  }

  // ANIMATION WITH MOUSE OVER
  mouseHandler () {
    let target = document.getElementById('canvas-wrapper')
    if (target) {
      target.addEventListener('mousemove', this.onMouseMove)
    }
  }

   onMouseMove = (e: MouseEvent) => {
     let canvas = document.getElementById('waveformchild') as HTMLCanvasElement
     let offset = canvas.offsetLeft
     let movement = e.movementX
     if (canvas) {
       let ctx = canvas.getContext('2d')
       if (this.hover && ctx) {
         this.setUp(canvas, ctx)
         ctx.globalAlpha = this.GLOBALALPHA

         let width = canvas.offsetWidth
         let height = canvas.offsetHeight
         let posx = e.offsetX
         const blocksize = Math.floor(width / 500)
         ctx.strokeStyle = 'red'
         ctx.lineWidth = 1.5
         ctx.beginPath()
         ctx.moveTo(posx, 0)
         ctx.lineTo(posx, height)
         ctx.stroke()

         if (movement > blocksize || !this.hover) {
           ctx.clearRect(0, 0, posx, height)
         }
       }
     }
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
