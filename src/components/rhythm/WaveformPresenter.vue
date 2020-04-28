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
import { DrawToolkit, Panel } from '../../services/providers/draw-toolkit'
import { Line } from '@/drawables/line'
import { Waveform } from '@/drawables/waveform'
import { Axis } from '@/drawables/axis'
import { DummyTimeExtractor } from '@/services/time-extractor/dummy-time-extractor'
import { Quantizer } from '../../services/providers/quantizer'

@Component({
  components: { AudioPlayer,
    Legend
  }
})
export default class WaveformPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @inject(REGISTRY.TimeExtractor) extractor:DummyTimeExtractor
  @inject(REGISTRY.DrawToolkit) drawtoolkit:DrawToolkit
  @inject(REGISTRY.Quantizer) quantizer:Quantizer
  @Ref('waveform') readonly canvasdom!: HTMLCanvasElement
  @Ref('waveformchild') readonly canvasalpha!: HTMLCanvasElement
  @Ref('canvas-wrapper') readonly canvasWrapper!:HTMLDivElement

  private dialog:boolean = false
  private dataArray : Uint8Array
  private data : number[]
  private samplerate:number
  public hover : boolean
  private GLOBALALPHA : number = 0.7;
  private bars = 800 // number of bars to plot
  private previousInterval : NodeJS.Timeout
  private previousblock : number = 0
  private playingCursor:Line
  private mouseCursor:Line
  private mainPanel:Panel
  private infoPanel:Panel

  mounted () { // access canvas
    this.mainPanel = this.drawtoolkit.setUp(this.canvasdom, 1)
    this.infoPanel = this.drawtoolkit.setUp(this.canvasalpha, this.GLOBALALPHA)

    this.playingCursor = new Line('orange', 3, 0, false)
    this.mouseCursor = new Line('red', 3, 0, false)
    this.infoPanel.add(this.playingCursor)
    this.infoPanel.add(this.mouseCursor)
    this.mouseHandler()

    this.store.sample().subscribe(s => {
      this.mainPanel.reset()
      if (s) {
        let channel = s.getChannelData(0)
        for (let j = 1; j < s.numberOfChannels; j++) {
          let d = s.getChannelData(j)
          channel.map((a, b) => (a + d[b]) / s.numberOfChannels)
        }

        this.data = this.quantizer.lin(Array.from(channel), this.bars)
        this.samplerate = s.sampleRate
        this.extractor.analyze(s).then(te => {
          te.peaks.forEach(peak => {
            let xpos = (peak / this.samplerate) / s.duration
            let o = new Line('green', 2, xpos, true)
            this.infoPanel.add(o)
          })
        })
        let waveform = new Waveform(this.data)
        this.mainPanel.add(waveform)
        this.mainPanel.redraw()
      }
    })

    this.store.playing().subscribe(p => {
      this.playingCursor.x = p.elapsed / p.length
      this.playingCursor.visible = true
      this.infoPanel.redraw()
    })

    this.store.skipped().subscribe(p => {
      if (p) {
        if (this.canvasalpha) {
          this.playingCursor.visible = true
          this.playingCursor.x = p / 100
        }
      }
    })
  }
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
      this.infoPanel.redraw()
    }
  }

  hide () {
    this.mouseCursor.x = 0
    this.mouseCursor.visible = false
    this.infoPanel.redraw()
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
