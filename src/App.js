import { Grid, AStarFinder } from "pathfinding"

const findPath = () => {
  let grid = new Grid(10, 10)
  let finder = new AStarFinder()
  let path = finder.findPath(2, 3, 4, 4, grid)
  console.log(path)
}

function App() {
  return (
    <div className="flex h-screen justify-center text-zinc-900">
      <h1 className="font-extrabold m-0 p-0 pt-5 text-5xl">Intelli Park</h1>
      {findPath()}
    </div>
  )
}

export default App
