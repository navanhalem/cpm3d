
var DiceSet = require("./src/DiceSet.js")
var CPM = require("./src/CPM.js")
var CPMStats = require("./src/CPMStats.js")
var CPMCanvas = require("./src/CPMCanvas.js")
var TrackCanvas = require("./src/TrackCanvas.js")

var track_canvas, track_ctx, zoom = 8, C, Cim, Cstat, Ctracks

var l_forceddir = parseInt(process.argv[2]) || 0
var l_randdir = parseInt(process.argv[3]) || 0
var l_dir = parseInt(process.argv[4]) || 0
var density = parseInt(process.argv[5]) || 50
var field_size = parseInt(process.argv[6]) || 100
var runtime = parseInt(process.argv[7]) || 3000
var l_act = parseInt(process.argv[9]) || 0
var m_act = parseInt(process.argv[10]) || 0

function initialize(){
	// CPM object
	C = new CPM( 2, {x: field_size, y:field_size}, {
		LAMBDA_CONNECTIVITY : [0,0],
		LAMBDA_RANDDIR : [0,l_randdir],
		LAMBDA_FORCEDDIR : [0,l_forceddir],
		LAMBDA_DIR : [0,l_dir],
		LAMBDA_CENTER : [0,0],
		LAMBDA_SA : [0,0],
		LAMBDA_P : [0,.5],
		LAMBDA_V : [0,25],
		LAMBDA_ACT : [0,l_act],
		MAX_ACT : [0,m_act],
		P : [0,125],
		V : [0,100],
		J_T_STROMA : [NaN,4],
		J_T_ECM : [NaN,5],
		J_T_T : [ [NaN,NaN], [NaN,10] ],
		T : 20,
		ACT_MEAN : "geometric",
		GRADIENT_TYPE : "custom"
	})
	// C.addStromaBorder()

	locationsList = []

	// Create canvas, stats, and track object
	Cim = new CPMCanvas( C, {zoom:zoom} )
	Cs = new CPMStats( C )


	// Seed the cell
	for ( let i = 0; i < (density/100/*as pergentage*/)*(field_size*field_size/100/*volume parameter*/); i ++ ) {
		C.seedCell( 1 )
	}

	// burnin phase
	for( i = 0 ; i < 10000 ; i ++ ){
		C.monteCarloStep()
	}

  for ( let t = 0; t < runtime; t ++ ) {
		if(t % 10 == 0) {
			Cs.centroids()
		}
    timestep()
  }
}

function getLocations (cpi) {
	let locations = []
	let ids = Object.keys( cpi )
	for ( let i = 0; i < ids.length; i ++ ) {
		locations.push(Cs.getCentroidOf(ids[i], cpi[ids[i]]))
	}
	return locations
}

function movementDirection(locations, locationsNew) {
	let differences = []
	let differencesNorm = []
	for ( let i = 0; i < locations.length; i ++ ) {
		let difference = []
		for ( let j = 0; j < locations[0].length; j ++ ) {
			difference.push(locationsNew[i][j] - locations[i][j])
		}
		differences.push(difference)
		let length_correction = 1/(Math.sqrt(Math.pow(difference[0],2)+Math.pow(difference[1],2)))
		differencesNorm.push([difference[0]*length_correction,difference[1]*length_correction])
	}
	return [differences, differencesNorm]
}

function timestep(){

	let cpi = Cs.cellpixelsi()

	// get locations for actual direction
	locationsList.unshift(getLocations(cpi))
	C.monteCarloStep()
	let locationsNew = getLocations(cpi)
	if ( locationsList.length >= 16 ) {
		let move = movementDirection(locationsList.pop(), locationsNew)
		let moveNorm = move[1]
		move = move[0]

		// Change dir to previous movement and add noise
		C.updateDir(Object.keys( cpi ), moveNorm, "LAMBDA_FORCEDDIR")
		C.updateDir(Object.keys( cpi ), C.randDir(Object(moveNorm).length), "LAMBDA_RANDDIR")
	}

	// Clear canvas (all pixels white, and draw stroma border)
	Cim.clear( "FFFFFF" )
	Cim.drawStroma( "AAAAAA" )

	// Color cells in green and draw their activity values
	Cim.drawCells( 1, "00FF00" )
	Cim.drawCellBorders( 1, "000000" )
	Cim.drawActivityValues( 1 )



}

initialize()
