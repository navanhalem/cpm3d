//function simulation( C, Cim, Cs, outputtype, conf, Ct  ){



function simulation( C, Cim, Cs, conf, Ct  ){

	this.C = C
	this.Cim = Cim
	this.Cs = Cs
	this.conf = conf

	// max x,y,z coordinates in the grid
	this.maxc = [this.C.field_size.x-1, this.C.field_size.y-1 ]
	if( this.C.ndim == 3 ){
		this.maxc[2] = this.C.field_size.z-1
	}

	this.viewtracks = this.conf["VIEWTRACKS"]
	if( this.viewtracks ){
		this.Ct = Ct
	}

	this.save = this.conf["SAVEIMG"]
	this.runtime=this.conf["RUNTIME"]
	this.simtype = this.conf["SIMTYPE"] || "2D"
	
	// to track the time of the actual simulation (no burnin)
	this.time = 0
	this.borderthreshold = 30
}

simulation.prototype = {

	// Seed cells and allow a burnin phase, then start the simulation.
	initialize : function(){

		var nrcells = this.conf["NRCELLS"], burnin = this.conf["BURNIN"]
		var cellkind, i, stromavoxels

		// if the simulation is 1D, set up the microchannel
		// (top and bottom row of pixels in the grid)
		if( this.simtype == "1D" ){
			channelvoxels = this.C.addStromaPlane( [], 1, 0 )
			channelvoxels = this.C.addStromaPlane( channelvoxels, 1, this.C.field_size.y-1 )
			this.C.addStroma( channelvoxels )
		}


		// Seed the right number of cells for each cellkind
		var totalcells = 0
		for( cellkind = 0; cellkind < nrcells.length; cellkind ++ ){
			
			for( i = 0; i < nrcells[cellkind]; i++ ){
				// first cell always at the midpoint. Any other cells
				// randomly.				
				if( totalcells == 0 ){
					this.C.seedCellAt( cellkind+1, this.C.midpoint )
					totalcells++
				} else {
					this.C.seedCell( cellkind+1 )
					totalcells++
				}
			}
		}

		// Simulate the burnin phase
		for( i = 0; i < burnin; i++ ){
			this.C.monteCarloStep()
		}

		// Call timestep to start the real simulation.
		this.timestep()

	},

	// Update the grid and either draw it or print track output
	timestep : function(){
		// Update the grid with one MCS
		this.C.monteCarloStep()
		this.time++
	},

	atBorder : function(){
	
		var cbp = this.C.cellborderpixels
		var i,p,j

		// only check in detail if centroid is within 20px of grid borders
		if( this.nearBorder(this.borderthreshold) ){
			
			// loop over the cellborderpixels, and check if they are at the grid border.
			for( i = 0; i < cbp.length; i++ ){
				p = this.C.i2p( cbp.elements[i] )
				for( j = 0; j < p.length; j++ ){
					if( p[j] == 0 || p[j] == this.maxc[j] ){
						return true
					}
				}
			}

		}
		return false

	},
	nearBorder : function( threshold ){

		// since there is only one cell, this is an array
		// of length 1 containing an object with "id", x,y,z
		// of the cell t = "id".
		// Still, loop for consistency:
		var centroid = this.Cs.getCentroids()
		var i,c


		for( i = 0; i < centroid.length; i++ ){
			c = centroid[i]
			var xmax = this.C.field_size.x - threshold - 1,
				ymax = this.C.field_size.y - threshold -1,
				zmax = this.C.field_size.z-threshold-1			

			if( c.x < threshold || c.x > xmax ){
				return true;
			}
			if( this.simtype != "1D" && ( c.y < threshold || c.y > ymax ) ){
				return true;
			}
			if( this.C.ndim == 3 ){
				if( c.z < threshold || c.z > zmax ){
					return true;
				}
			}
		}		

		return false
	},


	// Draw the grid
	drawCanvas : function(){
		
		var canvascolor=this.conf["CANVASCOLOR"], stromacolor=this.conf["STROMACOLOR"],
			showborders=this.conf["SHOWBORDERS"], 
			cellcolor=this.conf["CELLCOLOR"], actcolor=this.conf["ACTCOLOR"], 
			trackcolor=this.conf["TRACKCOLOR"],
			nrcells=this.conf["NRCELLS"],cellkind

		// Clear canvas and draw stroma border
		this.Cim.clear( canvascolor )
		if( this.simtype == "1D" ){
			this.Cim.drawStroma( stromacolor )
		}

		// Draw each cellkind appropriately
		for( cellkind = 0; cellkind < nrcells.length; cellkind ++ ){
			if( cellcolor[ cellkind ] != -1 ){
				this.Cim.drawCells( cellkind+1, cellcolor[cellkind] )
			}
			if( actcolor[ cellkind ] ){
				this.Cim.drawActivityValues( cellkind + 1 )
			}
			if( showborders[ cellkind ] ){
				this.Cim.drawCellBorders( cellkind+1, "AAAAAA" )
			}
			if( this.viewtracks ){
				if( trackcolor[ cellkind ] != -1 ){
					this.Ct.drawTracks( trackcolor[cellkind], cellkind+1 )
				}
			}

		}

	},

	reset : function(){
		

		// remove all cells from the grid, but keep stroma		
		var cellpix1 = this.C.cellpixelstype, cellpix = Object.keys( cellpix1 ), i
		for( i = 0; i < cellpix.length; i++ ){
			if( cellpix1[i] != 0 ){
				this.C.delpixi( cellpix[i] )
			}
		}
		// Also remove the cellborderpixels
		this.C.cellborderpixels = new DiceSet()
		// call initialize to re-seed cells
		this.initialize()
	}


}


/* This allows using the code in either the browser or with nodejs. */
if( typeof module !== "undefined" ){
	var DiceSet = require("../../cpm/src/DiceSet.js")
	module.exports = simulation
}
