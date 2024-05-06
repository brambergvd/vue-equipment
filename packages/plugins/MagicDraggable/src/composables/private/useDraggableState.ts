import { ref, reactive, toRefs, toValue, type Ref, type MaybeRef } from 'vue'
import type { DraggableState } from '../../types/index'

const drawerStateStore: Ref<DraggableState[]> = ref([])

export function useDraggableState(id: MaybeRef<string>) {
  function createState(id: string) {
    const state: DraggableState = {
      id: id,
      dragStart: undefined,
      dragging: false,
      interpolateTo: undefined,
      originX: 0,
      originY: 0,
      lastDraggedX: 0,
      lastDraggedY: 0,
      intermediateDraggedX: 0,
      intermediateDraggedY: 0,
      draggedX: 0,
      draggedY: 0,
      elRect: undefined,
      wrapperRect: undefined,
    }

    return reactive(state)
  }

  function addState(id: string) {
    const instance = createState(id)
    drawerStateStore.value = [...drawerStateStore.value, instance]

    return instance
  }

  function findState() {
    let instance = drawerStateStore.value.find((instance) => {
      return instance.id === id
    })

    if (!instance) instance = addState(toValue(id))
    return toRefs(instance)
  }

  function deleteState() {
    drawerStateStore.value = drawerStateStore.value.filter(
      (x: DraggableState) => x.id !== id
    )
  }

  return {
    addState,
    findState,
    deleteState,
  }
}
