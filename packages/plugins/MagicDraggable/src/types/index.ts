type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type MagicDraggableCoordinates = {
  x: number
  y: number
}

export type MagicDraggableSnapPoint =
  | [
      Position,
      offset?: {
        x?: number
        y?: number
      }
    ]
  | Position

export interface MagicDraggableOptions {
  tag?: 'dialog' | 'div'
  threshold?: {
    distance?: number
    momentum?: number
    idle?: number
    lock?: number
  }
  animation?: {
    snap?: {
      duration?: number
      easing?: (t: number) => number
    }
  }
  initial?: {
    snapPoint?: MagicDraggableSnapPoint
  }
  snapPoints?: MagicDraggableSnapPoint[]
  disabled?: boolean
}

export interface MagicDraggableState {
  id: string
  dragStart: Date | undefined
  dragging: boolean
  interpolateTo: MagicDraggableCoordinates | undefined
  originX: number
  originY: number
  lastDraggedX: number
  lastDraggedY: number
  intermediateDraggedX: number
  intermediateDraggedY: number
  draggedX: number
  draggedY: number
  elRect: DOMRect | undefined
  wrapperRect: DOMRect | undefined
}
