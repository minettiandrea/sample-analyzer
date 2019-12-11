<template>
<v-container fluid>
     <v-row align="center" justify="center">
      <WaveformPresenter />
    </v-row>
    <v-row align='center' justify='center'>
      <AudioPlayer />
    </v-row>
    <v-row>
      <SchemaPresenter />
    </v-row>
    <v-row>
      <SignaturesPresenter />
      </v-row>

</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import WaveformPresenter from './WaveformPresenter.vue'
import AudioPlayer from './AudioPlayer.vue'
import SchemaPresenter from './SchemaPresenter.vue'
import SignaturesPresenter from './SignaturesPresenter.vue'

@Component({
  components: { WaveformPresenter,
    AudioPlayer,
    SchemaPresenter,
    SignaturesPresenter
  }

})
export default class RhythmicStructure extends Vue {
}
</script>
