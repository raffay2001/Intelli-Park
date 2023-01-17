import { Grid, AStarFinder } from "pathfinding"
import { useState } from "react"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import ElectricCarIcon from "@mui/icons-material/ElectricCar"
import toast, { Toaster } from "react-hot-toast"

// Helper function to check if the element exists in the array or not
const isArrayItemExists = (arr, item) => {
  for (let i = 0; i < arr.length; i++) {
    if (JSON.stringify(arr[i]) === JSON.stringify(item)) {
      return true
    }
  }
}

// Toast message notifiers
const notify = (message) => toast.success(message)
const notifyError = (message) => toast.error(message)

// Main Component
function App() {
  // reactive varible for storing nodes.
  // No. of Vehicles
  const [vehicle, setVehicle] = useState(1)
  // Vehicle related states.
  // For Vehicle One
  const [vehicleOneNodes, setVehicleOneNodes] = useState([])
  const [vehicleOneStartNode, setVehicleOneStartNode] = useState([])
  const [vehicleOneGoalNode, setVehicleOneGoalNode] = useState([])
  const [vehicleOnePath, setVehicleOnePath] = useState([])
  // For Vehicle Two
  const [vehicleTwoNodes, setVehicleTwoNodes] = useState([])
  const [vehicleTwoStartNode, setVehicleTwoStartNode] = useState([])
  const [vehicleTwoGoalNode, setVehicleTwoGoalNode] = useState([])
  const [vehicleTwoPath, setVehicleTwoPath] = useState([])
  // For Vehicle Three
  const [vehicleThreeNodes, setVehicleThreeNodes] = useState([])
  const [vehicleThreeStartNode, setVehicleThreeStartNode] = useState([])
  const [vehicleThreeGoalNode, setVehicleThreeGoalNode] = useState([])
  const [vehicleThreePath, setVehicleThreePath] = useState([])

  // Obstacles related states
  const [isObstacleState, setIsObstacleState] = useState(false)
  const [obstacles, setObstacles] = useState([])

  // General game related states
  const [size, setSize] = useState(8)
  const [level, setLevel] = useState(1)
  const [isDiagonalMovementAllowed, setIsDiagonalMovementAllowed] = useState(false)

  // Path Finding Function
  const findPath = () => {
    let grid = new Grid(size, size)
    for (let item of obstacles) {
      grid.setWalkableAt(item[0], item[1], false)
    }
    let finder = new AStarFinder({ allowDiagonal: isDiagonalMovementAllowed })

    // Finding path for level 1 and level
    if (level === 1 || level === 3) {
      if (vehicleOneNodes.length === 0) {
        notifyError("Could not find path.")
        return
      }
      const [vehicle1StartNode, vehicle1GoalNode] = vehicleOneNodes
      let vehicleOneFinalPath = finder.findPath(
        vehicle1StartNode[0],
        vehicle1StartNode[1],
        vehicle1GoalNode[0],
        vehicle1GoalNode[1],
        grid
      )
      if (vehicleOneFinalPath.length === 2) {
        notifyError("Start and end positions should be adjacent atleast by one cell.")
        setVehicleOneNodes([])
        setVehicleOneStartNode([])
        setVehicleOneGoalNode([])
        return
      }
      setVehicleOnePath(vehicleOneFinalPath)
      return
    }

    // Finding paths for other vehicles for level 2
    if (level === 2) {
      // Exception check
      if (
        vehicleOneNodes.length === 0 ||
        vehicleTwoNodes.length === 0 ||
        vehicleThreeNodes.length === 0
      ) {
        notifyError("Please give starting and ending positions of all the vehicles.")
        return
      }

      // For Vehicle 1
      const [vehicle1StartNode, vehicle1GoalNode] = vehicleOneNodes
      let vehicleOneFinalPath = finder.findPath(
        vehicle1StartNode[0],
        vehicle1StartNode[1],
        vehicle1GoalNode[0],
        vehicle1GoalNode[1],
        grid
      )
      setVehicleOnePath(vehicleOneFinalPath)

      // For Vehicle 2
      const [vehicle2StartNode, vehicle2GoalNode] = vehicleTwoNodes
      let vehicleTwoFinalPath = finder.findPath(
        vehicle2StartNode[0],
        vehicle2StartNode[1],
        vehicle2GoalNode[0],
        vehicle2GoalNode[1],
        grid
      )
      setVehicleTwoPath(vehicleTwoFinalPath)

      // For Vehicle 3
      const [vehicle3StartNode, vehicle3GoalNode] = vehicleThreeNodes
      let vehicleThreeFinalPath = finder.findPath(
        vehicle3StartNode[0],
        vehicle3StartNode[1],
        vehicle3GoalNode[0],
        vehicle3GoalNode[1],
        grid
      )
      setVehicleThreePath(vehicleThreeFinalPath)
      if (vehicleTwoFinalPath.length === 2 || vehicleThreeFinalPath.length === 2) {
        notifyError("Start and end positions should be adjacent atleast by one cell.")
        return
      }
    }

    notify("Path Found 🚀")
    return
  }

  // Handlers for setting start and goal nodes for vehicles
  // For Vehicle One
  const vehicleOneNodeHandler = (_, rows, cols) => {
    if (vehicleOneNodes.length < 2) {
      vehicleOneNodes.length === 0 && setVehicleOneStartNode([rows, cols])
      vehicleOneNodes.length === 1 && setVehicleOneGoalNode([rows, cols])
      vehicleOneNodes.push([rows, cols])
    } else {
      alert("Cannot push")
    }
  }

  // For Vehicle Two
  const vehicleTwoNodeHandler = (_, rows, cols) => {
    if (vehicleTwoNodes.length < 2) {
      vehicleTwoNodes.length === 0 && setVehicleTwoStartNode([rows, cols])
      vehicleTwoNodes.length === 1 && setVehicleTwoGoalNode([rows, cols])
      vehicleTwoNodes.push([rows, cols])
    } else {
      alert("Cannot push")
    }
  }

  // For Vehicle Three
  const vehicleThreeNodeHandler = (_, rows, cols) => {
    if (vehicleThreeNodes.length < 2) {
      vehicleThreeNodes.length === 0 && setVehicleThreeStartNode([rows, cols])
      vehicleThreeNodes.length === 1 && setVehicleThreeGoalNode([rows, cols])
      vehicleThreeNodes.push([rows, cols])
    } else {
      alert("Cannot push")
    }
  }

  // Handler for adding obstacles
  const obstacleHandler = (_, rows, cols) => {
    if (!isArrayItemExists(obstacles, [rows, cols]))
      setObstacles((prevObstacles) => [...prevObstacles, [rows, cols]])
  }

  return (
    <div className="flex flex-col h-screen items-center text-zinc-900">
      <Toaster
        position="top-right"
        toastOptions={{
          // Define default options
          className: "",
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },

          // Default options for specific types
          success: {
            duration: 2000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
      <h1 className="font-extrabold m-0 p-0 pt-5 text-5xl">
        Intelli Park <ElectricCarIcon className="text-5xl" />
      </h1>
      <div className="max-w-7xl my-8 w-full flex justify-evenly items-center space-x-3">
        <button
          className="cursor-pointer border-none w-32 h-10 rounded-md bg-zinc-800 text-white"
          onClick={() => {
            findPath()
          }}
        >
          See Path
        </button>
        <FormControl className="w-64">
          <InputLabel id="size-label">Size</InputLabel>
          <Select
            labelId="size-label"
            id="size-select"
            value={size}
            label="size"
            onChange={(e) => setSize(e.target.value)}
          >
            <MenuItem value={8}>Eight</MenuItem>
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>
        <FormControl className="w-64">
          <InputLabel id="level-label">Level</InputLabel>
          <Select
            labelId="level-label"
            id="level-select"
            value={level}
            label="level"
            onChange={(e) => setLevel(e.target.value)}
          >
            <MenuItem value={1}>One</MenuItem>
            <MenuItem value={2}>Two</MenuItem>
            <MenuItem value={3}>Three</MenuItem>
          </Select>
        </FormControl>
        {!!(level === 2) && (
          <FormControl className="w-64">
            <InputLabel id="vehicle-label">Vehicle</InputLabel>
            <Select
              labelId="vehicle-label"
              id="vehicle-select"
              value={vehicle}
              label="vehicle"
              onChange={(e) => setVehicle(e.target.value)}
            >
              <MenuItem value={1}>One</MenuItem>
              <MenuItem value={2}>Two</MenuItem>
              <MenuItem value={3}>Three</MenuItem>
            </Select>
          </FormControl>
        )}
        {!!(level === 3) && (
          <div>
            <button
              className="cursor-pointer border-none w-32 h-10 rounded-md bg-zinc-800 text-white"
              onClick={() => {
                if (isObstacleState) notify("Obstacles Feature Disabled")
                else if (!isObstacleState) notify("Obstacles Feature Enabled")
                setIsObstacleState((prevState) => !prevState)
              }}
            >
              {isObstacleState ? "Disable Obstacles" : "Enable Obstacles"}
            </button>
          </div>
        )}
        {!!(level === 3) && (
          <div>
            <button
              className="cursor-pointer border-none w-52 h-10 rounded-md bg-zinc-800 text-white"
              onClick={() => {
                if (isDiagonalMovementAllowed) notify("Diagonal Movement Disabled")
                else if (!isDiagonalMovementAllowed) notify("Diagonal Movement Enabled")
                setIsDiagonalMovementAllowed((prevState) => !prevState)
              }}
            >
              {isDiagonalMovementAllowed ? "Disable Diagonal Movement" : "Enable Diagonal Movement"}
            </button>
          </div>
        )}
      </div>
      <div className="my-2 pb-5 flex">
        <div>
          {Array(size)
            .fill("0")
            .map((_, rows) => {
              return (
                <div className="flex cursor-pointer" key={`cell-${rows}`}>
                  {Array(size)
                    .fill("0")
                    .map((_, cols) => (
                      <div
                        key={`cell-${cols}`}
                        className={`w-20 h-20 border border-solid border-zinc-900 flex justify-center items-center
                        ${
                          vehicleOneStartNode[0] === rows && vehicleOneStartNode[1] === cols
                            ? "bg-gray-600"
                            : ""
                        }
                        ${
                          vehicleOneGoalNode[0] === rows && vehicleOneGoalNode[1] === cols
                            ? "bg-gray-600"
                            : ""
                        }

                        ${
                          vehicleTwoStartNode[0] === rows && vehicleTwoStartNode[1] === cols
                            ? "bg-green-600"
                            : ""
                        }
                        ${
                          vehicleTwoGoalNode[0] === rows && vehicleTwoGoalNode[1] === cols
                            ? "bg-green-600"
                            : ""
                        }

                        ${
                          vehicleThreeStartNode[0] === rows && vehicleThreeStartNode[1] === cols
                            ? "bg-cyan-600"
                            : ""
                        }
                        ${
                          vehicleThreeGoalNode[0] === rows && vehicleThreeGoalNode[1] === cols
                            ? "bg-cyan-600"
                            : ""
                        }

                        ${obstacles
                          .map((node) => (node[0] === rows && node[1] === cols ? "bg-red-600" : ""))
                          .join("")}`}
                        onClick={(e, i = rows, j = cols) => {
                          if (isObstacleState) {
                            obstacleHandler(e, i, j)
                          } else if (vehicle === 1) {
                            vehicleOneNodeHandler(e, i, j)
                          } else if (vehicle === 2) {
                            vehicleTwoNodeHandler(e, i, j)
                          } else if (vehicle === 3) {
                            vehicleThreeNodeHandler(e, i, j)
                          }
                        }}
                      >
                        {/* ({`${rows},${cols}`})  */}
                        {!!vehicleOnePath.length && (
                          <img
                            src="/assets/car.jpg"
                            alt="car"
                            className={`w-16 ${
                              isArrayItemExists(
                                vehicleOnePath.slice(1, vehicleOnePath.length - 1),
                                [rows, cols]
                              )
                                ? "block"
                                : "hidden"
                            }`}
                          />
                        )}
                        {!!vehicleTwoPath.length && (
                          <img
                            src="/assets/car.jpg"
                            alt="car"
                            className={`w-16 ${
                              isArrayItemExists(
                                vehicleTwoPath.slice(1, vehicleTwoPath.length - 1),
                                [rows, cols]
                              )
                                ? "block"
                                : "hidden"
                            }`}
                          />
                        )}
                        {!!vehicleThreePath.length && (
                          <img
                            src="/assets/car.jpg"
                            alt="car"
                            className={`w-16 ${
                              isArrayItemExists(
                                vehicleThreePath.slice(1, vehicleThreePath.length - 1),
                                [rows, cols]
                              )
                                ? "block"
                                : "hidden"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default App
