
  var CPMStats = require("./src/CPMStats.js")
  var CPMCanvas = require("./src/CPMCanvas.js")
	var DiceSet = require("./src/DiceSet.js")
	var CPM = require("./src/CPM.js")
	var Cset = require("./settings/CPM3D-template.js")
	var simsettings = require("./settings/CPM3D-settings.js")
	var simulation = require("./src/simulation.js")
	require("./src/viz.js")

	var dim = 3
	// var field_size = Cset.field_size.x
	var mesh_step = 15
	// var n_cells = simsettings["NRCELLS"]

  var l_forceddir = parseInt(process.argv[2]) || 0
  var l_randdir = parseInt(process.argv[3]) || 0
  var l_dir = parseInt(process.argv[4]) || 0
  var n_cells = parseInt(process.argv[5]) || 10
  var field_size = parseInt(process.argv[6]) || 500
  var runtime = parseInt(process.argv[7]) || 2000

	/* Global variables that are not model parameters
		stopit tracks whether the simulation is running.
	*/
	var i,j,k,		// counting variables
		stopit = 0,	// track whether the simulation is running (start/stop button)
		C,Cs,		// for the CPM itself and the CPMStats object
		ADD_FRCS = 0,	// if ADD_FRCS = 0, draw the grid
		frc_rotate = 0,	// used in combination with the "rot" button to rotate camera.
		draw_each = 1,	// Time resolution of drawing the grid (in combi with draw_clock)
		draw_clock = 0	// The drawing clock starts at 0

	/* Load parameters from settings/CPM3D-template.js (which contains the variable Cset) */
  Cset.conf["LAMBDA_FORCEDDIR"][1] = l_forceddir
  Cset.conf["LAMBDA_RANDDIR"][1] = l_randdir
  Cset.conf["LAMBDA_DIR"][1] = l_randdir
	var cpmconf = Cset.conf


	/* Helper function to apply function f to each element in a */
	function each( a, f ){
		for( var i = 0 ; i < a.length ; i ++ ){
			f(a[i])
		}
	}

	/* Initialization of GUI and simulation */
	function runit(){
		// Generate the CPM with the right settings
		if( dim == 3 ){
			C = new CPM( dim, { x:field_size, y:field_size, z:field_size }, cpmconf )
		}
		/*each( ['MAX_ACT', 'LAMBDA_ACT'
			//,'V', 'P', 'LAMBDA_CONNECTIVITY', 'LAMBDA_P',	'LAMBDA_V'
			], function(p){
			addslider( p, C.conf ) } ) */

		// Cim = new CPMCanvas( C ) // dummy
		Cs = new CPMStats( C )
		// var stromacoordinates = []
		// let xsize = Cset.field_size.x
		// let zsize = Cset.field_size.z
		// for ( let i = 0; i < stromadata.length-1; i++ ) {
		// 	if (stromadata[i] > 100) {
		// 		let x = i%xsize
		// 		let y = (i/(xsize*zsize)) >> 0
		// 		let z = ((i%(xsize*zsize))/xsize) >> 0
		// 		console.log(i, [x, y, z])
		// 		stromacoordinates.push([x, y, z])
		// 	}
		// }
		//
		// C.addStroma(stromacoordinates)
		// C.addStromaBorder(-1)

		var stromacoordinates = []
		// for ( let x = 0; x < Cset.field_size.x; x ++ ) {
		// 	for ( let y = 0; y < Cset.field_size.y; y ++ ) {
		// 		for ( let z = 0; z < Cset.field_size.z; z ++ ) {
		// 			if (Math.abs(x - 0.25*Cset.field_size.x) < 2 && Math.abs(z - 0.75*Cset.field_size.z) < 2 || Math.abs(x - 0.75*Cset.field_size.x) < 2 && Math.abs(z - 0.25*Cset.field_size.z) < 2) {
		// 				stromacoordinates.push([x, y, z])
		// 			}
		// 		}
		// 	}
		// }

		// for ( let x = 0; x < Cset.field_size.x; x ++ ) {
		// 	for ( let y = 0; y < Cset.field_size.y; y ++ ) {
		// 		for ( let z = 0; z < Cset.field_size.z; z ++ ) {
		// 			let avg = ( x + y + z ) / 3
		// 			if (Math.abs(x - avg) < 2 && Math.abs(y - avg) < 2 && Math.abs(z - avg) < 2) {
		// 				stromacoordinates.push([x, y, z])
		// 			}
		// 		}
		// 	}
		// }
		// C.addStroma(stromacoordinates)

		sim = new simulation( C, null, Cs, simsettings )
    if ( n_cells == 1 ) {
      C.seedCellAt( 1, [field_size/2,field_size/2,field_size/2] )
    } else {
  		for( var i = 0 ; i < n_cells ; i ++ ){
  			C.seedCell(1)
  		}
    }
		stopit = 0
		// mainloop()
	}

	function reset(){
		C = new CPM( dim, { x:field_size, y:field_size, z:field_size }, cpmconf )
		Cim = new CPMCanvas( C ) // dummy
		Cs = new CPMStats( C )
		sim = new simulation( C, Cim, Cs, simsettings )
		for( var i = 0 ; i < n_cells ; i ++ ){
			C.seedCellAt( 1, [field_size/2,field_size/2,field_size/2] )
		}
		stopit = 1
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
		let UV = []
		for ( let i = 0; i < locations.length; i ++ ) {
			let difference = []
			for ( let j = 0; j < locations[0].length; j ++ ) {
				difference.push(locationsNew[i][j] - locations[i][j])
			}
			differences.push(difference)
			UV.push(C.getUV(difference[0], difference[1], difference[2]))
		}
		return [differences, UV]
	}

	/* The below function executes two monte carlo steps */
	function mainloop(){
		// compute the midpoint of the grid.
    for ( let i = 0;i < runtime; i++) {

      // get cpi for updates
  		let cpi = Cs.cellpixelsi()
      let cpiKeys = Object.keys( cpi )

  		// Converts UV into direction
  		C.updateDir( cpiKeys )

  		// get locations for actual direction
  		let locations = getLocations(cpi)
  		C.monteCarloStep()
  		let locationsNew = getLocations(cpi)
      // recent movement in terms of U an V
  		let didUV = movementDirection(locations, locationsNew)[1]

  		// Change dir (since it has been changed according to the actual movement) to UV and update UV with randomness
  		C.updateForcedUV( cpiKeys, didUV )
  		C.updateRandUV( cpiKeys )

      // to keep track of locations
      Cs.centroids()
    }
	}

	function startanim(){
		frameCaptureSocket = new WebSocket(WS_SERVER)
		frameCaptureSocket.onclose = function(e){
			console.log( e )
		}
		stopit=0
		requestAnimationFrame( mainloop )
	}

	function stopanim(){
		frameCaptureSocket.close()
		stopit=1
	}

	function networkExtents( pad ){
		var x_max = 0, y_max = 0, z_max = 0;
		for( var i = 0 ; i < edges.length ; i ++ ){
			for( var j = 2 ; j < edges[i].length ; j ++ ){
				x_max = Math.max( x_max, edges[i][j][0] )
				y_max = Math.max( y_max, edges[i][j][1] )
				z_max = Math.max( z_max, edges[i][j][2] )
			}
		}
		return { x : Math.ceil(x_max)+pad, y : Math.ceil(y_max)+pad, z : Math.ceil(z_max)+pad }
	}

runit()
mainloop()
