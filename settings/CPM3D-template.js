var Cset = {
	// used by node only
	ndim : 3,
	field_size : {x: 50, y:50, z:50 },
	// used by html
	conf : {
		LAMBDA_CONNECTIVITY : [0,0],
		LAMBDA_RANDDIR : [0,0],
		LAMBDA_FORCEDDIR : [0,0],
		LAMBDA_DIR : [0,0],
		LAMBDA_CENTER : [0,0],
		LAMBDA_SA : [0,0],
		LAMBDA_P : [0,.2],
		LAMBDA_V : [0,25],
		LAMBDA_ACT : [0,2000],
		MAX_ACT : [0,80],
		P : [0,5400],
		V : [0,1000],
		J_T_STROMA : [NaN,4],
		J_T_ECM : [NaN,5],
		J_T_T : [ [NaN,NaN], [NaN,10] ],
		T : 20,
		ACT_MEAN : "geometric",
		GRADIENT_TYPE : "custom"
	}
}

if( typeof module !== "undefined" ){
	module.exports = Cset
}
