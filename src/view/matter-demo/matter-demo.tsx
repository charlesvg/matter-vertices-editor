import { useEffect, useRef } from "react"
import { Bodies, Common, Engine, Render, Runner, Vertices, World } from 'matter-js'
import { $loadedFile } from "../../model/store"
import { useStore } from "effector-react"
import { setUpConcaveBody } from "../../utils/set-up-concave-body"
import { tupleToVector } from "../../utils/tuple-to-vector"
import { UtilityBtn } from "../utility-btn/utility-btn"
import { showEmulation } from "../../model/events"

type MatterDemoProps = {
  vertices: [number, number][]
}

const verticesBodyRenderOptions = {
  lineWidth: 1,
  strokeStyle: '#ffffff',
  fillStyle: 'transparent',
}

export const MatterDemo = ({ vertices }: MatterDemoProps) => {
  const scene = useRef() as React.LegacyRef<HTMLDivElement> | undefined
  const engine = useRef(Engine.create())
  const image = useStore($loadedFile)
  
  const cw = document.body.clientWidth
  const ch = document.body.clientHeight

  const addBody = (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let arr = tupleToVector(vertices)

    if (!image) {
      return
    }

    let verticesBody
    let bodyToRender
    
    if (Vertices.isConvex(arr)) {
      if (arr[0].x === arr[arr.length - 1].x && arr[0].y === arr[arr.length - 1].y) {
        arr = arr.slice(0, -1)
      }

      verticesBody = Bodies.fromVertices(e?.pageX ?? cw / 2, e?.pageY ?? ch / 2, [arr], {
        render: {
          ...verticesBodyRenderOptions,
          sprite: {
            texture: image,
            xScale: 1,
            yScale: 1
          }
        },
      })

      bodyToRender = verticesBody
    } else {
      verticesBody = Bodies.fromVertices(e?.pageX ?? cw / 2, e?.pageY ?? ch / 2, [arr], {
        render: { ...verticesBodyRenderOptions }
      })
      bodyToRender = setUpConcaveBody(verticesBody, image)
    }

    World.add(engine.current.world, bodyToRender)
  }

  useEffect(() => {
    // mount

    const sceneRef = scene as React.MutableRefObject<HTMLDivElement>
    
    const render = Render.create({
      element: sceneRef.current,
      engine: engine.current,
      options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: 'transparent'
      }
    })
      
    // boundaries
    World.add(engine.current.world, [
      Bodies.rectangle(cw / 2, -10, cw, 20, { isStatic: true }),
      Bodies.rectangle(-10, ch / 2, 20, ch, { isStatic: true }),
      Bodies.rectangle(cw / 2, ch + 10, cw, 20, { isStatic: true }),
      Bodies.rectangle(cw + 10, ch / 2, 20, ch, { isStatic: true })
    ])
      
    // run the engine
    Runner.run(engine.current)
    Render.run(render)

    addBody()

    // unmount
    return () => {
      // destroy Matter
      Render.stop(render)
      World.clear(engine.current.world, false)
      Engine.clear(engine.current)
      render.canvas.remove()
      // render.canvas = null
      // render.context = null
      render.textures = {}
    }
  }, [])
  
  return (
    <>
      <div ref={scene} style={{ width: '100vw', height: '100vh' }} onMouseDown={addBody} />
      <div className='utility-panel'>
        <UtilityBtn onClick={() => showEmulation(false)} alias='back' />
      </div>
    </>
  )
}