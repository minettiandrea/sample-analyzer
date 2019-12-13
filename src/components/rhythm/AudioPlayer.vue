<template>
<v-container>
            <v-row class='col-12 py-0'
          align-content='center'
          justify='center'
          dense
          >
            <v-col cols="1">
                <v-btn text icon color="orange" @click.native='playing ? pause() : play()'>
                <v-icon x-small="" v-if='!playing || paused'>fas fa-play</v-icon>
                <v-icon x-small v-else>fas fa-pause</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="1">
                <v-btn text icon color="orange" @click.native='restart()'>
                <v-icon x-small>fas fa-backward</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="1">
                <v-btn text icon color="orange">
                <v-icon x-small>fas fa-volume-up</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="4">
              <v-slider @change='changeVolume'
              dark dense
              v-model='volume'
              color='orange'
              max='1'
              min='0'
              step='.1'
              ></v-slider>
            </v-col>

          </v-row>
          <v-row justify='center' class='pt-0'>
              <v-progress-linear
                v-model='sampletime'
                color="orange"
                height="10"
                rounded
                >
            </v-progress-linear>
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
    private samplelng : number

    beforeUpdate () {
    }
    private newSample (ab:AudioBuffer | null) {
      if (ab) {
        this.source.buffer = ab
        this.samplelng = ab.length / this.rate
        // this.sampletime = ab.length
      }
    }

    created () {
      this.setup()
    }

    play () {
      this.paused = false
      this.playing = true
      // this.source.loop = true
      this.source.start()
      // let audioElement = new Audio()

      var int = setInterval(() => {
        if (this.sampletime < 100) {
          this.sampletime += 1
        }
        if (this.sampletime >= 100) {
          this.sampletime = 0
          this.playing = false
          this.restore()
          clearInterval(int)
        }
        if (this.paused) {
          this.pause()
          clearInterval(int)
        }
      }, 1000 * this.samplelng / 100) // *1000 in order to get ms

      this.$emit('isPlaying', this.samplelng, this.ctx.currentTime, this.rate)
      // emits event arguments (length of sample in seconds, currenttime of audio context and frequency rate)
    }

    pause () {
      this.paused = !this.paused
      this.source.stop()
    }

    restart () {
      this.paused = false
      this.sampletime = 0
      this.playing = true // changes the model, need to trigger audio
    }

    changeVolume () {
      this.gain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
    }

    restore () {
      this.ctx = new AudioContext()

      this.source = this.ctx.createBufferSource()

      this.setup()
    }

    setup () {
      this.gain = this.ctx.createGain()
      this.gain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
      this.store.sample().subscribe(this.newSample)
      this.source.connect(this.gain)
      this.gain.connect(this.ctx.destination)
    }
}
</script>
