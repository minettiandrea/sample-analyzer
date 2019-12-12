import 'reflect-metadata'
import { shallowMount } from '@vue/test-utils'
import '../../src/ioc'
import SampleLoader from '@/components/sidebar/SampleLoader.vue'
import { container } from 'inversify-props'
import { SpectralExtractor } from '@/services/spectral-extractor/spectral-extractor'
import { REGISTRY } from '@/ioc/registry'
import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

describe('SpectralExtractor', () => {
  it('renders props.msg when passed', () => {
    const se = container.get<SpectralExtractor>(REGISTRY.SpectralExtractor)

    // const msg = se.analyze()
    // const wrapper = shallowMount(SpectrumPresenter)
    // expect(wrapper.text()).toMatch(msg)
  })
})

describe('SampleLoader.vue', () => {
  it('renders props.msg when passed', () => {
    const wrapper = shallowMount(SampleLoader)
    expect(wrapper.text()).toMatch('loader')
  })
})
