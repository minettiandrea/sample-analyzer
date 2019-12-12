<template>
      <v-card flat class='col-10 mt-5' style='text-align: center'>
          <v-row>
              <v-progress-linear
                v-model='sampletime'
                color="dark orange"
                height="20"
                >
            </v-progress-linear> {{ sampletime }}
          </v-row>
          <v-row align='center' justify='center' class='col-12'>
            <v-col cols="2">
                <v-btn text icon color="orange" @click.native='playing ? pause() : play()'>
                <v-icon v-if='!playing || paused'>fas fa-play</v-icon>
                <v-icon v-else>fas fa-pause</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="2">
                <v-btn text icon color="orange" @click.native='stop()'>
                <v-icon>fas fa-stop</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="2">
                <v-btn text icon color="orange" @click.native='restart()'>
                <v-icon>fas fa-backward</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="4">
              <v-slider @change='changeVolume' dark
              v-model='volume'
              color='orange'
              class='mt-2'
              max='1'
              min='0'
              step='.1'
              ></v-slider>
            </v-col>

          </v-row>
    </v-card>
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
    @inject(REGISTRY.AudioContextProvider) ctx:AudioContextProvider
    private source : AudioBufferSourceNode = this.ctx.context().createBufferSource()
    private gain : GainNode = this.ctx.context().createGain()

    private newSample (ab:AudioBuffer | null) {
      if (ab) {
        this.source.buffer = ab
        this.sampletime = ab.length
      }
    }

    created () {
      this.gain.gain.setValueAtTime(this.volume, this.ctx.context().currentTime)
      this.store.sample().subscribe(this.newSample)
      this.source.connect(this.gain)
      this.gain.connect(this.ctx.context().destination)
    }

    play () {
      this.paused = false
      this.playing = true
      // this.source.loop = true
      this.source.start()
    }

    pause () {
      this.paused = !this.paused
      this.source.stop()
    }

    stop () {
      this.paused = this.playing = false
    }

    restart () {
      this.paused = false
      this.sampletime = 0
      this.playing = true // changes the model, need to trigger audio
    }

    changeVolume () {
      this.gain.gain.setValueAtTime(this.volume, this.ctx.context().currentTime)
    }
}
</script>
