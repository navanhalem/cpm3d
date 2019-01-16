
var container, camera, scene, renderer, controls;
var plane, cube;
var mouse, raycaster, isShiftDown = false;

var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;

var objects = [];

var cellvoxels = [], stromavoxels = [], frcNet

var tcellOnColor = 0xFF0000, tcellOffColor = 0xaaaaaa,
	stromaColor = 0x00aa00, gridColor = 0x8c8c8c,
	cellBasicColor = 0x000000

var frameCaptureSocket

function makevoxel( voxset ){
	if( arguments.length == 0 ) voxset = cellvoxels
	var material = new THREE.MeshLambertMaterial(
		{ color: tcellOffColor, transparent: true, opacity : 0.6 } )
	var cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ),
		material );
	cube.position.x = 0;
	cube.position.y = 0;
	cube.position.z = 0;
	scene.add( cube )
	voxset.push( cube )
}

// Initialize a movie frame of w x h pixels
function init3d( w, h ){
	var i, j, p, draw_grid = ADD_FRCS==0, x2 = C.field_size.x/2,
		y2 = C.field_size.y/2, z2 = C.field_size.z/2

	container = document.getElementById( 'stage' )

	camera = new THREE.PerspectiveCamera( 45, 1, 1, 10000 )
	camera.position.set( x2, y2, z2 + C.field_size.x*1.26 )

	camera.up.set( -1, 0, 0 )

	camera.lookAt( new THREE.Vector3( x2, y2, z2 ) )

	controls = new THREE.TrackballControls( camera, container )

	controls.rotateSpeed = 1.0
	controls.zoomSpeed = 1.2
	controls.panSpeed = 0.8

	controls.noZoom = false
	controls.noPan = false

	controls.staticMoving = true
	controls.dynamicDampingFactor = 0.3

	controls.target.set( x2, y2, z2 )

	controls.keys = [ 65, 83, 68 ];

	scene = new THREE.Scene();

	// grid

	if( draw_grid ){
		var size = field_size, step = 10;
		var geometry = new THREE.Geometry();
		for ( i = 0; i <= size; i += step ) {
			geometry.vertices.push( new THREE.Vector3( 0, 0, i ) );
			geometry.vertices.push( new THREE.Vector3( size, 0, i ) );
			geometry.vertices.push( new THREE.Vector3( i, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( i, 0, size ) );
		}
		var material = new THREE.LineBasicMaterial( { color: gridColor , opacity: 0.4, transparent: true } );
		var line = new THREE.Line( geometry, material, THREE.LinePieces );
		scene.add( line );
		geometry = new THREE.Geometry();
		for ( i = 0; i <= size; i += step ) {
			geometry.vertices.push( new THREE.Vector3( 0, 0, i ) );
			geometry.vertices.push( new THREE.Vector3( 0, size, i ) );
			geometry.vertices.push( new THREE.Vector3( 0, i, 0 ) );
			geometry.vertices.push( new THREE.Vector3( 0, i, size ) );
		}
		material = new THREE.LineBasicMaterial( { color: gridColor, opacity: 0.4, transparent: true } );
		line = new THREE.Line( geometry, material, THREE.LinePieces );
		scene.add( line );
		geometry = new THREE.Geometry();
		for ( i = 0; i <= size; i += step ) {
			geometry.vertices.push( new THREE.Vector3( 0, i, 0 ) );
			geometry.vertices.push( new THREE.Vector3( size, i, 0  ) );
			geometry.vertices.push( new THREE.Vector3( i, 0, 0 ) );
			geometry.vertices.push( new THREE.Vector3( i, size, 0 ) );
		}
		material = new THREE.LineBasicMaterial( { color: gridColor, opacity: 0.4, transparent: true } );
		line = new THREE.Line( geometry, material, THREE.LinePieces );
		scene.add( line );
	}


	// Lights
	var ambientLight = new THREE.AmbientLight( 0x606060 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( .5, .5, 1 ).normalize();
	scene.add( directionalLight );

	controls && controls.update()

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//renderer.setClearColor( 0x000000 );
	renderer.setClearColor( 0xFFFFFF );
	renderer.setPixelRatio( window.devicePixelRatio );
	//renderer.setSize( container.offsetWidth, container.offsetWidth );
	w = w|| container.offsetWidth
	h = h|| w
	renderer.setSize( w, h );
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
	//renderer.setSize( 640, 640 );
	container.appendChild( renderer.domElement );
}

function render3d( max_cells ) {
	var i = 0, t, k
	if( arguments.length == 0 ) max_cells = Infinity

	var cp = C.cellborderpixels.elements
	var con = Cs.cellsOnNetwork()

	while( cellvoxels.length < cp.length /*+ bgborderpixels.length*/  ){
		makevoxel()
	}

	for( ; i < cp.length ; i ++ ){
		t = C.cellpixelstype[cp[i]]; k = C.cellKind(t)
		if( t < max_cells ){
			var p = C.i2p( cp[i] )
			cellvoxels[i].visible = true
			cellvoxels[i].position.x = p[0]
			cellvoxels[i].position.y = p[1]
			cellvoxels[i].position.z = p[2]
		} else {
			cellvoxels[i].visible = false
		}
		if( k == 2 ){
			cellvoxels[i].material.color.setHex( 0x000000 )
			cellvoxels[i].material.opacity=1

		} else {
			cellvoxels[i].material.color.setHex( 0xFF0000 )
			cellvoxels[i].material.opacity=.2
		}

		if( C.conf["MAX_ACT"][1] > 0 ){
			var a = C.pxact(cp[i])/C.conf["MAX_ACT"][1]
			if( a > 0.5 ){
				cellvoxels[i].material.color.setHex( 0xFF0000 + (255*(2-2*a) << 8) )
				// cellvoxels[i].material.color.setHex( "FF"+tohex(2-2*a)+"00" )
			} else if( a > 0 ){
				cellvoxels[i].material.color.setHex( 0x0FF00 + (255*(2*a) << 16) )
			} else {
				cellvoxels[i].material.color.setHex( cellBasicColor )
			}
		} else {
			cellvoxels[i].material.color.setHex( cellBasicColor )
		}
		cellvoxels[i].material.opacity=0.5
		//cellvoxels[i].material.color.setHex( (con[t] || !ADD_FRCS) ?
		//	tcellOnColor : tcellOffColor )
		// cellvoxels[i].material.opacity = con[t] ? .6 : .3
		// 0x00033F << (5*C.cellpixelstype[cp[i]]) + 0x0000FF) % 0xFFFFFF
	}

	/*for( ; i < cp.length + bgborderpixels.length ; i ++ ){
		var p = i2p( bgborderpixels[i-cp.length] )
		cellvoxels[i].visible = true
		cellvoxels[i].position.x = voxel_scale*p[0]
		cellvoxels[i].position.y = voxel_scale*p[1]
		cellvoxels[i].position.z = voxel_scale*p[2]
		cellvoxels[i].material.color.setHex( 0X000000 )
		cellvoxels[i].material.transparent=true
		cellvoxels[i].material.opacity=0.2
	}*/

	for( ; i < cellvoxels.length ; i ++ ){
		cellvoxels[i].visible = false
	}

	// paint stromavoxels
	var sp = Object.keys(C.stromapixelstype)
	while( stromavoxels.length < sp.length ){
		makevoxel(stromavoxels)
	}
	for( let i = 0 ; i < sp.length ; i ++ ){
		var p = C.i2p( sp[i] )
		stromavoxels[i].visible = true
		stromavoxels[i].position.x = p[0]
		stromavoxels[i].position.y = p[1]
		stromavoxels[i].position.z = p[2]
		stromavoxels[i].material.color.setHex( 0x0000FF )
		stromavoxels[i].material.opacity=.2
	}

	renderer.render( scene, camera )
	if( typeof TAKE_SHOT !== "undefined" && TAKE_SHOT==1 ){
		var x = renderer.domElement.toDataURL()
		if( frameCaptureSocket.readyState==1 ){
			frameCaptureSocket.send( x );
		}
		// TAKE_SHOT = 0
	}
}

var ctx, canvas
