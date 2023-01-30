import { Grid, AStarFinder, BestFirstFinder, IDAStarFinder, BreadthFirstFinder } from "pathfinding"
import { useState } from "react"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import ElectricCarIcon from "@mui/icons-material/ElectricCar"
import toast, { Toaster } from "react-hot-toast"

// Implemented Algorithms

// 1- A-star:
var Heap = require("heap")
var Util = require("../core/Util")
var Heuristic = require("../core/Heuristic")
var DiagonalMovement = require("../core/DiagonalMovement")

/**
 * A* path-finder. Based upon https://github.com/bgrins/javascript-astar
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 */
function AStarFinder(opt) {
  opt = opt || {}
  this.allowDiagonal = opt.allowDiagonal
  this.dontCrossCorners = opt.dontCrossCorners
  this.heuristic = opt.heuristic || Heuristic.manhattan
  this.weight = opt.weight || 1
  this.diagonalMovement = opt.diagonalMovement

  if (!this.diagonalMovement) {
    if (!this.allowDiagonal) {
      this.diagonalMovement = DiagonalMovement.Never
    } else {
      if (this.dontCrossCorners) {
        this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles
      } else {
        this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle
      }
    }
  }

  // When diagonal movement is allowed the manhattan heuristic is not
  //admissible. It should be octile instead
  if (this.diagonalMovement === DiagonalMovement.Never) {
    this.heuristic = opt.heuristic || Heuristic.manhattan
  } else {
    this.heuristic = opt.heuristic || Heuristic.octile
  }
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
AStarFinder.prototype.findPath = function (startX, startY, endX, endY, grid) {
  var openList = new Heap(function (nodeA, nodeB) {
      return nodeA.f - nodeB.f
    }),
    startNode = grid.getNodeAt(startX, startY),
    endNode = grid.getNodeAt(endX, endY),
    heuristic = this.heuristic,
    diagonalMovement = this.diagonalMovement,
    weight = this.weight,
    abs = Math.abs,
    SQRT2 = Math.SQRT2,
    node,
    neighbors,
    neighbor,
    i,
    l,
    x,
    y,
    ng

  // set the `g` and `f` value of the start node to be 0
  startNode.g = 0
  startNode.f = 0

  // push the start node into the open list
  openList.push(startNode)
  startNode.opened = true

  // while the open list is not empty
  while (!openList.empty()) {
    // pop the position of node which has the minimum `f` value.
    node = openList.pop()
    node.closed = true

    // if reached the end position, construct the path and return it
    if (node === endNode) {
      return Util.backtrace(endNode)
    }

    // get neigbours of the current node
    neighbors = grid.getNeighbors(node, diagonalMovement)
    for (i = 0, l = neighbors.length; i < l; ++i) {
      neighbor = neighbors[i]

      if (neighbor.closed) {
        continue
      }

      x = neighbor.x
      y = neighbor.y

      // get the distance between current node and the neighbor
      // and calculate the next g score
      ng = node.g + (x - node.x === 0 || y - node.y === 0 ? 1 : SQRT2)

      // check if the neighbor has not been inspected yet, or
      // can be reached with smaller cost from the current node
      if (!neighbor.opened || ng < neighbor.g) {
        neighbor.g = ng
        neighbor.h = neighbor.h || weight * heuristic(abs(x - endX), abs(y - endY))
        neighbor.f = neighbor.g + neighbor.h
        neighbor.parent = node

        if (!neighbor.opened) {
          openList.push(neighbor)
          neighbor.opened = true
        } else {
          // the neighbor can be reached with smaller cost.
          // Since its f value has been updated, we have to
          // update its position in the open list
          openList.updateItem(neighbor)
        }
      }
    } // end for each neighbor
  } // end while not open list empty

  // fail to find the path
  return []
}

module.exports = AStarFinder

// 2- Best First Algorithm
var AStarFinder = require("./AStarFinder")

/**
 * Best-First-Search path-finder.
 * @constructor
 * @extends AStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 */
function BestFirstFinder(opt) {
  AStarFinder.call(this, opt)

  var orig = this.heuristic
  this.heuristic = function (dx, dy) {
    return orig(dx, dy) * 1000000
  }
}

BestFirstFinder.prototype = new AStarFinder()
BestFirstFinder.prototype.constructor = BestFirstFinder

module.exports = BestFirstFinder

// 3- BFS:
var Util = require("../core/Util")
var DiagonalMovement = require("../core/DiagonalMovement")

/**
 * Breadth-First-Search path finder.
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
function BreadthFirstFinder(opt) {
  opt = opt || {}
  this.allowDiagonal = opt.allowDiagonal
  this.dontCrossCorners = opt.dontCrossCorners
  this.diagonalMovement = opt.diagonalMovement

  if (!this.diagonalMovement) {
    if (!this.allowDiagonal) {
      this.diagonalMovement = DiagonalMovement.Never
    } else {
      if (this.dontCrossCorners) {
        this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles
      } else {
        this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle
      }
    }
  }
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
BreadthFirstFinder.prototype.findPath = function (startX, startY, endX, endY, grid) {
  var openList = [],
    diagonalMovement = this.diagonalMovement,
    startNode = grid.getNodeAt(startX, startY),
    endNode = grid.getNodeAt(endX, endY),
    neighbors,
    neighbor,
    node,
    i,
    l

  // push the start pos into the queue
  openList.push(startNode)
  startNode.opened = true

  // while the queue is not empty
  while (openList.length) {
    // take the front node from the queue
    node = openList.shift()
    node.closed = true

    // reached the end position
    if (node === endNode) {
      return Util.backtrace(endNode)
    }

    neighbors = grid.getNeighbors(node, diagonalMovement)
    for (i = 0, l = neighbors.length; i < l; ++i) {
      neighbor = neighbors[i]

      // skip this neighbor if it has been inspected before
      if (neighbor.closed || neighbor.opened) {
        continue
      }

      openList.push(neighbor)
      neighbor.opened = true
      neighbor.parent = node
    }
  }

  // fail to find the path
  return []
}

module.exports = BreadthFirstFinder

// 4- IDS
var Util = require("../core/Util")
var Heuristic = require("../core/Heuristic")
var Node = require("../core/Node")
var DiagonalMovement = require("../core/DiagonalMovement")

/**
 * Iterative Deeping A Star (IDA*) path-finder.
 *
 * Recursion based on:
 *   http://www.apl.jhu.edu/~hall/AI-Programming/IDA-Star.html
 *
 * Path retracing based on:
 *  V. Nageshwara Rao, Vipin Kumar and K. Ramesh
 *  "A Parallel Implementation of Iterative-Deeping-A*", January 1987.
 *  ftp://ftp.cs.utexas.edu/.snapshot/hourly.1/pub/AI-Lab/tech-reports/UT-AI-TR-87-46.pdf
 *
 * @author Gerard Meier (www.gerardmeier.com)
 *
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 * @param {boolean} opt.trackRecursion Whether to track recursion for
 *     statistical purposes.
 * @param {number} opt.timeLimit Maximum execution time. Use <= 0 for infinite.
 */
function IDAStarFinder(opt) {
  opt = opt || {}
  this.allowDiagonal = opt.allowDiagonal
  this.dontCrossCorners = opt.dontCrossCorners
  this.diagonalMovement = opt.diagonalMovement
  this.heuristic = opt.heuristic || Heuristic.manhattan
  this.weight = opt.weight || 1
  this.trackRecursion = opt.trackRecursion || false
  this.timeLimit = opt.timeLimit || Infinity // Default: no time limit.

  if (!this.diagonalMovement) {
    if (!this.allowDiagonal) {
      this.diagonalMovement = DiagonalMovement.Never
    } else {
      if (this.dontCrossCorners) {
        this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles
      } else {
        this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle
      }
    }
  }

  // When diagonal movement is allowed the manhattan heuristic is not
  // admissible, it should be octile instead
  if (this.diagonalMovement === DiagonalMovement.Never) {
    this.heuristic = opt.heuristic || Heuristic.manhattan
  } else {
    this.heuristic = opt.heuristic || Heuristic.octile
  }
}

/**
 * Find and return the the path. When an empty array is returned, either
 * no path is possible, or the maximum execution time is reached.
 *
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
IDAStarFinder.prototype.findPath = function (startX, startY, endX, endY, grid) {
  // Used for statistics:
  var nodesVisited = 0

  // Execution time limitation:
  var startTime = new Date().getTime()

  // Heuristic helper:
  var h = function (a, b) {
    return this.heuristic(Math.abs(b.x - a.x), Math.abs(b.y - a.y))
  }.bind(this)

  // Step cost from a to b:
  var cost = function (a, b) {
    return a.x === b.x || a.y === b.y ? 1 : Math.SQRT2
  }

  /**
   * IDA* search implementation.
   *
   * @param {Node} The node currently expanding from.
   * @param {number} Cost to reach the given node.
   * @param {number} Maximum search depth (cut-off value).
   * @param {Array<Array<number>>} The found route.
   * @param {number} Recursion depth.
   *
   * @return {Object} either a number with the new optimal cut-off depth,
   * or a valid node instance, in which case a path was found.
   */
  var search = function (node, g, cutoff, route, depth) {
    nodesVisited++

    // Enforce timelimit:
    if (this.timeLimit > 0 && new Date().getTime() - startTime > this.timeLimit * 1000) {
      // Enforced as "path-not-found".
      return Infinity
    }

    var f = g + h(node, end) * this.weight

    // We've searched too deep for this iteration.
    if (f > cutoff) {
      return f
    }

    if (node == end) {
      route[depth] = [node.x, node.y]
      return node
    }

    var min, t, k, neighbour

    var neighbours = grid.getNeighbors(node, this.diagonalMovement)

    // Sort the neighbours, gives nicer paths. But, this deviates
    // from the original algorithm - so I left it out.
    //neighbours.sort(function(a, b){
    //    return h(a, end) - h(b, end);
    //});

    /*jshint -W084 */ //Disable warning: Expected a conditional expression and instead saw an assignment
    for (k = 0, min = Infinity; (neighbour = neighbours[k]); ++k) {
      /*jshint +W084 */ //Enable warning: Expected a conditional expression and instead saw an assignment
      if (this.trackRecursion) {
        // Retain a copy for visualisation. Due to recursion, this
        // node may be part of other paths too.
        neighbour.retainCount = neighbour.retainCount + 1 || 1

        if (neighbour.tested !== true) {
          neighbour.tested = true
        }
      }

      t = search(neighbour, g + cost(node, neighbour), cutoff, route, depth + 1)

      if (t instanceof Node) {
        route[depth] = [node.x, node.y]

        // For a typical A* linked list, this would work:
        // neighbour.parent = node;
        return t
      }

      // Decrement count, then determine whether it's actually closed.
      if (this.trackRecursion && --neighbour.retainCount === 0) {
        neighbour.tested = false
      }

      if (t < min) {
        min = t
      }
    }

    return min
  }.bind(this)

  // Node instance lookups:
  var start = grid.getNodeAt(startX, startY)
  var end = grid.getNodeAt(endX, endY)

  // Initial search depth, given the typical heuristic contraints,
  // there should be no cheaper route possible.
  var cutOff = h(start, end)

  var j, route, t

  // With an overflow protection.
  for (j = 0; true; ++j) {
    route = []

    // Search till cut-off depth:
    t = search(start, 0, cutOff, route, 0)

    // Route not possible, or not found in time limit.
    if (t === Infinity) {
      return []
    }

    // If t is a node, it's also the end node. Route is now
    // populated with a valid path to the end node.
    if (t instanceof Node) {
      return route
    }

    // Try again, this time with a deeper cut-off. The t score
    // is the closest we got to the end node.
    cutOff = t
  }

  // This _should_ never to be reached.
  return []
}

module.exports = IDAStarFinder

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
  // Objects for searching algorithms.
  const [algo, setAlgo] = useState("A-star")

  // handler for deciding algorithm based on state
  const evalFinder = (algoName) => {
    let finder
    if (algoName === "A-star") {
      finder = new AStarFinder({ allowDiagonal: isDiagonalMovementAllowed })
    } else if (algoName === "Best First") {
      finder = new BestFirstFinder({ allowDiagonal: isDiagonalMovementAllowed })
    } else if (algoName === "IDS") {
      finder = new IDAStarFinder({ allowDiagonal: isDiagonalMovementAllowed })
    } else if (algoName === "BFS") {
      finder = new BreadthFirstFinder({ allowDiagonal: isDiagonalMovementAllowed })
    }
    return finder
  }

  // Path Finding Function
  const findPath = () => {
    let grid = new Grid(size, size)
    const finder = evalFinder(algo)
    for (let item of obstacles) {
      grid.setWalkableAt(item[0], item[1], false)
    }

    // Finding path for level 1 and level
    if (level === 1 || level === 3) {
      if (
        (vehicleOneNodes.length === 0 && obstacles.length !== 0) ||
        vehicleOneNodes.length === 0
      ) {
        notifyError("Please select starting and ending positions.")
        return
      }
      if (vehicleOneNodes.length === 1) {
        notifyError("Please select the ending position.")
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
        resetVehicleOneStates()
        return
      }
      if (vehicleOneFinalPath.length === 0) {
        notifyError("Could not find any path, try re-entering obstacles.")
        return
      }
      setVehicleOnePath(vehicleOneFinalPath)
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

      // For Vehicle 2
      const [vehicle2StartNode, vehicle2GoalNode] = vehicleTwoNodes
      let vehicleTwoFinalPath = finder.findPath(
        vehicle2StartNode[0],
        vehicle2StartNode[1],
        vehicle2GoalNode[0],
        vehicle2GoalNode[1],
        grid
      )

      // For Vehicle 3
      const [vehicle3StartNode, vehicle3GoalNode] = vehicleThreeNodes
      let vehicleThreeFinalPath = finder.findPath(
        vehicle3StartNode[0],
        vehicle3StartNode[1],
        vehicle3GoalNode[0],
        vehicle3GoalNode[1],
        grid
      )

      if (
        vehicleOneFinalPath.length === 2 ||
        vehicleTwoFinalPath.length === 2 ||
        vehicleThreeFinalPath.length === 2
      ) {
        notifyError("Start and end positions should be adjacent atleast by one cell.")
        return
      }
      if (
        vehicleOneFinalPath.length === 0 ||
        vehicleTwoFinalPath.length === 0 ||
        vehicleThreeFinalPath.length === 0
      ) {
        notifyError("Intersecting path not allowed.")
        return
      }
      setVehicleOnePath(vehicleOneFinalPath)
      setVehicleTwoPath(vehicleTwoFinalPath)
      setVehicleThreePath(vehicleThreeFinalPath)
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

  // Handlers for reseting states
  const resetVehicleOneStates = () => {
    setVehicleOneNodes([])
    setVehicleOneStartNode([])
    setVehicleOneGoalNode([])
    setObstacles([])
    setVehicleOnePath([])
  }

  const resetVehicleTwoStates = () => {
    setVehicleTwoNodes([])
    setVehicleTwoStartNode([])
    setVehicleTwoGoalNode([])
    setVehicleTwoPath([])
    setVehicle(1)
  }

  const resetVehicleThreeStates = () => {
    setVehicleThreeNodes([])
    setVehicleThreeStartNode([])
    setVehicleThreeGoalNode([])
    setVehicleThreePath([])
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
        {!!(level === 3 || level === 1) && (
          <div>
            <button
              className="cursor-pointer border-none w-32 h-10 rounded-md bg-zinc-800 text-white"
              onClick={() => {
                resetVehicleOneStates()
                notify("State resetted")
              }}
            >
              Reset State
            </button>
          </div>
        )}
        {!!(level === 2) && (
          <div className="flex space-x-2">
            <button
              className="cursor-pointer border-none w-24 h-10 rounded-md bg-zinc-800 text-white"
              onClick={() => {
                notify("State resetted")
                resetVehicleOneStates()
              }}
            >
              Reset State Vehicle 1
            </button>
            <button
              className="cursor-pointer border-none w-24 h-10 rounded-md bg-zinc-800 text-white"
              onClick={() => {
                resetVehicleTwoStates()
                notify("State resetted")
              }}
            >
              Reset State Vehicle 2
            </button>
            <button
              className="cursor-pointer border-none w-24 h-10 rounded-md bg-zinc-800 text-white"
              onClick={() => {
                resetVehicleThreeStates()
                notify("State resetted")
              }}
            >
              Reset State Vehicle 3
            </button>
          </div>
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
              className="cursor-pointer border-none w-32 h-10 rounded-md bg-zinc-800 text-white"
              onClick={() => {
                setObstacles([])
                notify("Obstacles resetted.")
              }}
            >
              Reset Obstacles
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
        <FormControl className="w-64">
          <InputLabel id="level-label">Level</InputLabel>
          <Select
            labelId="level-label"
            id="level-select"
            value={level}
            label="level"
            onChange={(e) => {
              resetVehicleOneStates()
              resetVehicleTwoStates()
              resetVehicleThreeStates()
              setLevel(e.target.value)
            }}
          >
            <MenuItem value={1}>One</MenuItem>
            <MenuItem value={2}>Two</MenuItem>
            <MenuItem value={3}>Three</MenuItem>
          </Select>
        </FormControl>
        <FormControl className="w-64">
          <InputLabel id="algo-label">Algo.</InputLabel>
          <Select
            labelId="algo-label"
            id="algo-select"
            value={algo}
            label="algo"
            onChange={(e) => {
              setAlgo(e.target.value)
            }}
          >
            <MenuItem value="A-star">A Star</MenuItem>
            <MenuItem value="Best First">Best First</MenuItem>
            <MenuItem value="IDS">IDS</MenuItem>
            <MenuItem value="BFS">Breadth First</MenuItem>
          </Select>
        </FormControl>
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
