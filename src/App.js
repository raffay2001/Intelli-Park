import { Grid, AStarFinder } from "pathfinding"
import { useState } from "react"
import { useDrag } from "react-use-gesture"

function App() {
  const [nodes, setNodes] = useState([])

  const findPath = () => {
    let grid = new Grid(10, 10)
    let finder = new AStarFinder()
    const [startNode, goalNode] = nodes
    let path = finder.findPath(startNode[0], startNode[1], goalNode[0], goalNode[1], grid)
    alert(`The path is: ${JSON.stringify(path)}`)
    // [[0,2],[0,3],[0,4]]
  }

  const nodeHandler = (_, rows, cols) => {
    nodes.length < 2 ? nodes.push([rows, cols]) : alert("Cannot push!!!")
  }

  return (
    <div className="flex flex-col h-screen items-center text-zinc-900">
      <h1 className="font-extrabold m-0 p-0 pt-5 text-5xl">Intelli Park</h1>
      <div className="my-4 flex space-x-2 justify-end w-11/12 border border-solid border-zinc-300 rounded-xl p-2">
        <img src="/assets/car.jpg" alt="car" className="cursor-pointer block w-16" />
        <img src="/assets/car.jpg" alt="car" className="cursor-pointer block w-16" />
        <img src="/assets/car.jpg" alt="car" className="cursor-pointer block w-16" />
      </div>
      <div className="my-2">
        <button
          className="border-none px-5 py-2 rounded-xl bg-zinc-900 text-white cursor-pointer"
          onClick={findPath}
        >
          See Path
        </button>
      </div>
      <div className="my-2 bg-slate-600 text-white">
        {Array(5)
          .fill("0")
          .map((_, rows) => {
            return (
              <div className="flex cursor-pointer">
                {Array(5)
                  .fill("0")
                  .map((_, cols) => (
                    <div
                      className={`w-20 h-20 border border-solid border-white`}
                      onClick={(e, i = rows, j = cols) => nodeHandler(e, i, j)}
                    >
                      ({`${rows},${cols}`})
                    </div>
                  ))}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default App
