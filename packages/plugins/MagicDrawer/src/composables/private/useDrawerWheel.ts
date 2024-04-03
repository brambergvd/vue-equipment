import {
  ref,
  computed,
  watch,
  toValue,
  nextTick,
  onMounted,
  type Ref,
  type MaybeRef,
  type WritableComputedRef,
} from 'vue'
import {
  unrefElement,
  useScrollLock,
  useResizeObserver,
  useThrottleFn,
} from '@vueuse/core'
import { useDrawerSnap } from './useDrawerSnap'
import { useDrawerGuards } from './useDrawerGuards'
import { useDrawerUtils } from './useDrawerUtils'
import { useDrawerState } from './useDrawerState'
// import { useDrawerEmitter } from '../useDrawerEmitter'

// import type { DrawerEvents } from '../../types'
import { type DefaultOptions } from '../../utils/defaultOptions'

type UseDrawerWheelArgs = {
  id: MaybeRef<string>
  isActive: MaybeRef<boolean>
  elRef: Ref<HTMLElement | undefined>
  wrapperRef: Ref<HTMLDivElement | undefined>
  position: MaybeRef<DefaultOptions['position']>
  threshold: MaybeRef<DefaultOptions['threshold']>
  snap: MaybeRef<DefaultOptions['snap']>
  canClose: MaybeRef<DefaultOptions['canClose']>
  overshoot: MaybeRef<number>
  close: () => void
}

export function useDrawerWheel(args: UseDrawerWheelArgs) {
  const {
    id,
    isActive,
    elRef,
    wrapperRef,
    position,
    overshoot,
    threshold,
    snap,
    canClose,
    close,
  } = args

  // Private state
  const {
    dragStart,
    dragging,
    shouldClose,
    interpolateTo,
    lastDraggedX,
    lastDraggedY,
    draggedX,
    draggedY,
    relDirectionX,
    relDirectionY,
    absDirectionX,
    absDirectionY,
    wrapperRect,
    hasDragged,
  } = useDrawerState({ threshold })

  let scrollLock: WritableComputedRef<boolean> | undefined = undefined
  let wheelendId: NodeJS.Timeout | undefined = undefined

  const duration = computed(() => toValue(snap)?.duration)

  // Snap logic
  const {
    snappedY,
    snappedX,
    activeSnapPoint,
    snapPointsMap,
    interpolateDragged,
    findClosestSnapPoint,
    drawerHeight,
    drawerWidth,
  } = useDrawerSnap({
    id,
    wrapperRect,
    snap,
    canClose,
    position,
    overshoot,
    draggedY,
    draggedX,
  })

  const { canInterpolate, lockScroll } = useDrawerGuards({
    elRef,
    absDirectionX,
    absDirectionY,
    position,
    activeSnapPoint,
  })

  const { clamp } = useDrawerUtils()

  // Private functions
  async function checkPosition({ x, y }: { x: number; y: number }) {
    const distanceX = Math.abs(x - lastDraggedX.value)
    const distanceY = Math.abs(y - lastDraggedY.value)

    switch (position) {
      case 'bottom':
      case 'top':
        if (distanceY > toValue(threshold).distance) {
          const snapPointY = await findClosestSnapPoint({
            draggedX: 0,
            draggedY,
            direction: relDirectionY.value,
          })

          // Close if last snap point is reached
          if (snapPointY === drawerHeight.value) {
            shouldClose.value = true
          } else {
            // Snap to next snap point
            interpolateTo.value = snapPointY
          }
        }

        break

      case 'right':
      case 'left':
        if (distanceX > toValue(threshold).distance) {
          const snapPointX = await findClosestSnapPoint({
            draggedX,
            draggedY: 0,
            direction: relDirectionX.value,
          })

          // Close if last snap point is reached
          if (snapPointX === drawerWidth.value) {
            shouldClose.value = true
          } else {
            // Snap to next snap point
            interpolateTo.value = snapPointX
          }
        }
        break
    }
  }

  async function checkMomentum({ x, y }: { x: number; y: number }) {
    const elapsed = Date.now() - dragStart.value!.getTime()

    const distanceX = Math.abs(x - lastDraggedX.value)
    const distanceY = Math.abs(y - lastDraggedY.value)

    const velocityX = elapsed && distanceX ? distanceX / elapsed : 0
    const velocityY = elapsed && distanceY ? distanceY / elapsed : 0

    switch (position) {
      case 'bottom':
      case 'top':
        if (velocityY > toValue(threshold).momentum) {
          const snapPointB = await findClosestSnapPoint({
            draggedX: 0,
            draggedY,
            direction: relDirectionY.value,
          })
          // Close if last snap point is reached
          if (snapPointB === drawerHeight.value) {
            shouldClose.value = true
          } else {
            // Snap to next snap point
            interpolateTo.value = snapPointB
          }
        }
        break

      case 'right':
      case 'left':
        if (velocityX > toValue(threshold).momentum) {
          const snapPointR = await findClosestSnapPoint({
            draggedX,
            draggedY,
            direction: relDirectionX.value,
          })

          // Close if last snap point is reached
          if (snapPointR === drawerWidth.value) {
            shouldClose.value = true
          } else {
            // Snap to next snap point
            interpolateTo.value = snapPointR
          }
        }
        break
    }
  }

  function setDragged({ x, y }: { x: number; y: number }) {
    switch (position) {
      case 'bottom':
        const newDraggedB = clamp(y, 0, toValue(overshoot) * -1)
        relDirectionY.value = newDraggedB < draggedY.value ? 'below' : 'above'
        draggedY.value = newDraggedB

        break

      case 'top':
        const newDraggedT = clamp(y, 0, toValue(overshoot))
        relDirectionY.value = newDraggedT < draggedY.value ? 'below' : 'above'
        draggedY.value = newDraggedT
        break

      case 'right':
        const newDraggedR = clamp(x, 0, toValue(overshoot) * -1)
        relDirectionX.value = newDraggedR < draggedX.value ? 'below' : 'above'
        draggedX.value = newDraggedR
        break

      case 'left':
        const newDraggedL = clamp(x, 0, toValue(overshoot))
        relDirectionX.value = newDraggedL < draggedX.value ? 'below' : 'above'
        draggedX.value = newDraggedL
        break
    }
  }

  function resetStateAndListeners() {
    dragging.value = false
    shouldClose.value = false
    interpolateTo.value = undefined
  }

  function resetScrollLock() {
    if (scrollLock?.value) {
      scrollLock.value = false
    }

    scrollLock = undefined
  }

  function onWheelend(e: WheelEvent) {
    if (shouldClose.value) {
      close()
    } else if (interpolateTo.value || interpolateTo.value === 0) {
      // If scroll is locked, interpolate to snap point
      // Scroll should only be locked at one end!
      if ((scrollLock && scrollLock.value) || canInterpolate(e.target!)) {
        interpolateDragged({
          to: interpolateTo.value,
          duration: duration.value,
        })
      }

      // Save the snap point we’re snapping to
      // both the input value, as well as the actual pixel value
      activeSnapPoint.value = snapPointsMap.value[interpolateTo.value]

      switch (position) {
        case 'bottom':
        case 'top':
          snappedY.value = interpolateTo.value
          break

        case 'right':
        case 'left':
          snappedX.value = interpolateTo.value
          break
      }
    } else if (hasDragged.value) {
      switch (position) {
        case 'bottom':
        case 'top':
          interpolateDragged({
            to: snappedY.value,
            duration: duration.value,
          })
          break

        case 'right':
        case 'left':
          interpolateDragged({
            to: snappedX.value,
            duration: duration.value,
          })
          break
      }
    }

    // Reset state
    resetStateAndListeners()
    resetScrollLock()
  }

  function onWheelstart(e: WheelEvent) {
    if (dragging.value) {
      return
    } else {
      dragging.value = true

      if (!scrollLock) {
        const target = lockScroll(e.target!)
        if (target) {
          scrollLock = useScrollLock(target)
          scrollLock.value = true
        }
      }
    }

    // Save last dragged position,
    // used later to check if click event should propagate
    lastDraggedX.value = draggedX.value
    lastDraggedY.value = draggedY.value

    // Save start time
    dragStart.value = new Date()
  }

  // Public functions
  function onWheel(args: { e: WheelEvent; id: MaybeRef<string> }) {
    console.log('e:', args.e)

    // Only listen to events from the current instance
    if (toValue(args.id) !== toValue(id)) {
      return
    }

    // Clear wheelend event, if the user is still scrolling
    if (wheelendId) {
      clearTimeout(wheelendId)
    }

    const { e } = args
    onWheelstart(e)

    // Reset shouldClose before checking
    shouldClose.value = false

    const newX = draggedX.value - e.deltaX
    const newY = draggedY.value - e.deltaY

    //Check if we should close or snap based on momentum
    checkMomentum({ x: newX, y: newY })

    // Save dragged value
    setDragged({ x: newX, y: newY })

    // Check if we should close based on distance
    checkPosition({ x: newX, y: newY })

    if (hasDragged.value) {
      e.stopPropagation()
    }

    wheelendId = setTimeout(() => onWheelend(e), 50)
  }

  return {
    onWheel,
  }
}
