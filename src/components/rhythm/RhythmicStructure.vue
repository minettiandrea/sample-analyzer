<template>
<v-container fluid>
     <v-row align="center" justify="center">

            <WaveformPresenter />
            <AudioPlayer />
    </v-row>
</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import WaveformPresenter from './WaveformPresenter.vue'
import AudioPlayer from './AudioPlayer.vue'

@Component({
  components: { WaveformPresenter,
    AudioPlayer
  }

})
export default class RhythmicStructure extends Vue {
}
</script>
