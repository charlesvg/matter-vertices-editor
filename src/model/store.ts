import { guard, sample } from "effector"
import { domain } from "./domain"
import { fillAutoLine, resetLineAction, setFileLoaded, setLineCoords, setShapeSettings, setToolChain, setZoom, showEmulation } from "./events"

export type ShapeSettings = {
  xScale: number,
  yScale: number,
  xOffset: number,
  yOffset: number
}

export const DEFAULT_SHAPE_SETTINGS: ShapeSettings = {
  xScale: 1,
  yScale: 1,
  xOffset: 0.5,
  yOffset: 0.5
}

export const $toolChain = domain.createStore<[string | null, string]>([null, 'line'])
export const $loadedFile = domain.createStore<string | null>(null)
export const $lineCoords = domain.createStore<Array<{x: number, y: number}>>([])
export const $zoomValue = domain.createStore<number>(100)
export const $emulationZone = domain.createStore<boolean>(false)
export const $shapeSettings = domain.createStore<ShapeSettings>(DEFAULT_SHAPE_SETTINGS)

$toolChain.on(setToolChain, (state, payload) => [state[1], payload])
$loadedFile.on(setFileLoaded, (_, payload) => payload)

$lineCoords.on(setLineCoords, (state, payload) => [...state, payload])
$lineCoords.on(fillAutoLine, (_, payload) => payload)

$zoomValue.on(setZoom, (_, payload) => payload)
$emulationZone.on(showEmulation, (_, payload) => payload)
$shapeSettings.on(setShapeSettings, (state, payload) => {
  return {
    ...state,
    ...payload
  }
})

sample({
  clock: resetLineAction,
  source: $lineCoords,
  fn: (store) => {
    return store.slice(0, -1)
  },
  target: $lineCoords
})

guard({
  clock: setFileLoaded,
  filter: (_, clock) => {
    return clock === null
  },
  source: [],
  target: $lineCoords
})

$shapeSettings.watch(store => console.log(store))