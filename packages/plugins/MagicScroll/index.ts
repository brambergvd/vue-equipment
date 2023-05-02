import { App, Plugin } from 'vue'

import MagicScrollProvider from './src/components/MagicScrollProvider.vue'
import MagicScrollScene from './src/components/MagicScrollScene.vue'
import MagicScrollTransform from './src/components/MagicScrollTransform.vue'
import MagicScrollAnime from './src/components/MagicScrollAnime.vue'
import MagicScrollCollision from './src/components/MagicScrollCollision.vue'

import { magicScrollStore } from './src/store'
import { magicScrollEmit } from './src/utils'

export * from './src/types'

const MagicScroll: Plugin = {
  install: (app: App) => {
    app.component('MagicScrollProvider', MagicScrollProvider)
    app.component('MagicScrollScene', MagicScrollScene)
    app.component('MagicScrollTransform', MagicScrollTransform)
    app.component('MagicScrollAnime', MagicScrollAnime)
    app.component('MagicScrollCollision', MagicScrollCollision)

    app.provide('magicScrollEmit', magicScrollEmit)
    app.provide('magicScrollStore', magicScrollStore)
  },
}

export default MagicScroll
