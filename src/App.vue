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
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">

            <SpectrumPresenter />

        </v-row>
      </v-container>
    </v-content>

    <v-footer app>
      <span>&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import SampleLoader from './components/sidebar/SampleLoader.vue'
import SpectrumPresenter from './components/harmony/SpectrumPresenter.vue'

@Component({
  components: {
    SampleLoader,
    SpectrumPresenter
  }
})
export default class App extends Vue {
  created () {}

  drawer = false;

  @Prop(String) source: string;
}
</script>
