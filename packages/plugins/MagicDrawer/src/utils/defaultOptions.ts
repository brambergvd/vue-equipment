import type { DrawerOptions } from '../types'
import type { RequireAllNested } from '@maas/vue-equipment/utils'

const defaultOptions: RequireAllNested<DrawerOptions> = {
  position: 'bottom',
  backdrop: true,
  focusTrap: true,
  scrollLock: true,
  scrollLockPadding: true,
  teleport: {
    target: 'body',
    disabled: false,
  },
  transitions: {
    content: 'magic-drawer--content',
    backdrop: 'magic-drawer--backdrop',
  },
  threshold: {
    distance: 150,
    momentum: 1,
  },
  tag: 'dialog',
  keys: ['Escape'],
}

type DefaultOptions = typeof defaultOptions

export { defaultOptions, type DefaultOptions }
