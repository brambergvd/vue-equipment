import type { DraggableOptions } from '../types'
import type { RequireAll } from '@maas/vue-equipment/utils'

type DefaultOptions = RequireAll<DraggableOptions>

const defaultOptions: DefaultOptions = {
  tag: 'div',
  teleport: {
    target: 'body',
    disabled: false,
  },
  threshold: {
    distance: 128,
    momentum: 1,
  },
  animation: {
    snap: {
      duration: 300,
    },
  },
  initial: {
    snapPoint: 'center',
  },
  snapPoints: [],
  disabled: false,
}

export { defaultOptions, type DefaultOptions }
