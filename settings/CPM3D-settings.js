	// simulations settings
	var simsettings = {
		SIMTYPE : "2D",
		NRCELLS : [1],
		BURNIN : 500,
		RUNTIME : 1000,
		CANVASCOLOR : "FFFFFF",
		STROMACOLOR : "AAAAAA",
		CELLCOLOR : ["000000"],
		ACTCOLOR : [false],
		VIEWTRACKS : false,
		TRACKCOLOR : ["FF0000"],
		SHOWBORDERS : true,
		SAVEIMG : false,
		FRAMERATE : 10,
		SAVEPATH : "data/img",
		MCSRATE : 1
	}

if( typeof module !== "undefined" ){
	module.exports = simsettings
}
