<template>
  <v-app id="inspire">
    <loading :active.sync="isLoading"
        :can-cancel="false"
        :is-full-page="true"></loading>

    <v-navigation-drawer v-model="drawer" app clipped>
      <SampleLoader />
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title >Sample analyzer <span v-if="sample">- {{sample.name}}</span></v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-tabs centered grow>
        <v-tabs-slider color="#1976D2"></v-tabs-slider>
        <v-tab
          v-for="tab in tabs"
          v-bind:key="tab"
          v-on:click="currentTab = tab"
        >
          {{ tab }}
        </v-tab>
        <v-tab-item>
          <HarmonicStructure />
        </v-tab-item>
        <v-tab-item>
          <RhythmicStructure />
        </v-tab-item>
      </v-tabs>
    </v-content>

    <v-footer app>
      <span>&copy; 2020</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import SampleLoader from './components/sidebar/SampleLoader.vue'
import HarmonicStructure from './components/harmony/HarmonicStructure.vue'
import RhythmicStructure from './components/rhythm/RhythmicStructure.vue'
// @ts-ignore
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import { inject } from 'inversify-props'
import { REGISTRY } from './ioc/registry'
import { Store, Sample } from './services/store/store'

@Component({
  components: {
    SampleLoader,
    HarmonicStructure,
    RhythmicStructure,
    Loading
  }
})
export default class App extends Vue {
  @inject(REGISTRY.Store) store:Store

  created () {}

  drawer = false;
  isLoading = true;

  sample:Sample | null = null;

  @Prop(String) source: string;

  mounted () {
    this.store.loading().subscribe(x => this.isLoading = x)
    this.store.sample().subscribe(s => this.sample = s)
  }

  data () {
    return {
      currentTab: 'Harmony',
      tabs: ['Harmony', 'Rhythm']
    }
  }
  computed () {}
}
</script>
<style> .v-window__container { height: 100% !important; } </style>
