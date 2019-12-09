<template>
<v-container id="harmonic-structure" class="fill-height" fluid>
     <v-row align="center" justify="center">

            <SpectrumPresenter />
            <OvertonesPresenter />
    </v-row>
<VoicingsPresenter />
</v-container>

</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import SpectrumPresenter from './SpectrumPresenter.vue'
import OvertonesPresenter from './OvertonesPresenter.vue'
import VoicingsPresenter from './VoicingsPresenter.vue'

@Component({
  components: {
    SpectrumPresenter,
    OvertonesPresenter,
    VoicingsPresenter
  }
})
export default class HarmonicStructure extends Vue {
}
</script>
