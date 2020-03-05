<template>
<v-container>
            <v-row class='col-12 py-0'
          align-content='center'
          justify='center'
          dense
          >
            <v-col cols="1">
                <v-btn text icon color="#1976D2" @click='playing ? pause() : play()'>
                <v-icon x-small="" v-if='!playing || paused'>fas fa-play</v-icon>
                <v-icon x-small v-else>fas fa-pause</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="1">
                <v-btn text icon color="#1976D2" @click='restart()'>
                <v-icon x-small>fas fa-backward</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="1">
                <v-btn text icon color="#1976D2" @click ='mute()'>
                <v-icon x-small>fas fa-volume-up</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="4">
              <v-slider @change='changeVolume'
              dark dense
              v-model='volume'
              color='#1976D2'
              max='1'
              min='0'
              step='.1'
              ></v-slider>
            </v-col>

          </v-row>
          <v-row justify='center' class='pt-0'>
              <v-slider
                v-model='sampletime'
                color="#1976D2"
                @click='skip'
                :label=" (sampletime * samplelng / 100).toFixed(3)  + ' : ' +  samplelng.toFixed(3)"
              >
            </v-slider>
          </v-row>

</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { AudioContextProvider } from '../../services/providers/context-provider'

@Component
export default class AudioPlayer extends Vue {
    private playing: boolean = false
    private paused: boolean = true
    private volume: number = 1
    private sampletime: number = 0 // is going to change according to sample length (in ms?)

    @inject(REGISTRY.Store) store:Store
    @inject(REGISTRY.AudioContextProvider) ctxprovider:AudioContextProvider
    private ctx = this.ctxprovider.context()
    private source : AudioBufferSourceNode = this.ctx.createBufferSource()
    private rate : number = this.ctx.sampleRate
    private gain : GainNode
    private samplelng : number = 0

    private sample:AudioBuffer

    private startplayingtime = 0;
    private pausedAt = 0;
    private interval:NodeJS.Timeout

    mounted () {
      this.store.skipped().subscribe(p => {
        if (p) {
          if (this.playing) {
            this.onEnd()
            this.sampletime = p
            this.pausedAt = this.samplelng * p / 100
            this.play()
          } else {
            this.sampletime = p
            this.pausedAt = this.samplelng * p / 100
            this.store.nextPlayEvent({ status: false, elapsed: this.pausedAt, length: this.samplelng })
          }
        }
      })
    }
    private newSample (ab:AudioBuffer | null) {
      if (ab) {
        this.sample = ab
        this.source.buffer = ab
        this.samplelng = ab.length / this.rate
      }
    }

    created () {
      this.setup()
    }

    onEnd () {
      this.playing = false
      clearInterval(this.interval)
      this.restore()
    }

    play () {
      this.paused = false
      this.playing = true

      this.startplayingtime = this.ctxprovider.context().currentTime
      if (this.sampletime === 0) {
        this.source.start()
      }
      if (this.sampletime > 0) {
        this.source.start(0, this.pausedAt)
      }

      this.interval = setInterval(() => {
        const elapsed = this.ctxprovider.context().currentTime - this.startplayingtime + this.pausedAt
        this.sampletime = Math.ceil(elapsed / this.samplelng * 100)
        this.store.nextPlayEvent({ status: this.playing, length: this.samplelng, elapsed: elapsed })
        if (elapsed > this.samplelng) {
          this.onEnd()
          this.pausedAt = 0
          this.sampletime = 0
          this.store.nextPlayEvent({ status: false, elapsed: 0, length: this.samplelng })
        }
      }, 50)
    }

    pause () {
      clearInterval(this.interval)
      this.paused = true
      this.playing = false
      this.source.stop()
      this.pausedAt = this.ctxprovider.context().currentTime - this.startplayingtime + this.pausedAt
      this.store.nextPlayEvent({ length: this.samplelng, status: false, elapsed: this.pausedAt })

      this.restore()
    }

    restart () {
      this.pausedAt = 0
      this.source.stop()
      this.sampletime = 0
      this.restore()
      this.paused = false
      this.play()
    }

    mute () {
      if (this.volume !== 0) {
        this.volume = 0
        this.gain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
      } else {
        this.volume = 0.25
        this.gain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
      }
    }

    changeVolume () {
      this.gain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
    }

    restore () {
      this.source = this.ctx.createBufferSource()
      this.source.buffer = this.sample
      this.source.connect(this.gain)
    }

    setup () {
      this.gain = this.ctx.createGain()
      this.gain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
      this.store.sample().subscribe(this.newSample)
      this.source.connect(this.gain)
      this.gain.connect(this.ctx.destination)
    }

    skip () {
      let pos = this.sampletime
      this.store.nextSkipped(pos)
    }
}
</script>
