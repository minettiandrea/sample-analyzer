<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app clipped>
      <SampleLoader />
      <v-list dense>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-settings</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-tabs centered grow>
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
      <span>&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import SampleLoader from './components/sidebar/SampleLoader.vue';
import HarmonicStructure from './components/harmony/HarmonicStructure.vue';
import RhythmicStructure from './components/rhythm/RhythmicStructure.vue';

@Component({
  components: {
    SampleLoader,
    HarmonicStructure,
    RhythmicStructure
  }
})
export default class App extends Vue {
  created () {}

  drawer = false;

  @Prop(String) source: string;

  data () {
    return {
      currentTab: 'Harmony',
      tabs: ['Harmony', 'Rhthym']
    }
  }
  computed () {}
}
</script>
