/*  Copyright 2012-2016 Sven "underscorediscovery" Bergström

    written by : http://underscorediscovery.ca
    written for : http://buildnewgames.com/real-time-multiplayer/

    MIT Licensed.
*/

	//A window global for our game root variable.
var game = {};

	//When loading, we store references to our
	//drawing canvases, and initiate a game instance.
window.onload = function(){

		//Create our game client instance.
	game = new game_core();

			//Fetch the viewport
		game.viewport = document.getElementById('viewport');

			//Adjust their size
		game.viewport.width = game.world.width;
		game.viewport.height = game.world.height;

		//Babylon JS variables
		game.drawer = {};

		//Helper functions
		game.drawer.mapTo3Dcoords = function(coords, height, dimensions){
			var newCoords = {};
			newCoords.x = coords.x - dimensions.w/2;
			newCoords.z = coords.y*-1 + dimensions.h/2
			newCoords.y = height;
			return newCoords;
		}
		game.drawer.ribbonPaths = function(points, position, height, dimensions){
			var paths = [];
			points.forEach(function(point){
				var coords = game.drawer.mapTo3Dcoords(point, 8, dimensions);
				var path = [];
				path.push(new BABYLON.Vector3(coords.x, coords.y - height/2, coords.z));
				path.push(new BABYLON.Vector3(coords.x, coords.y - height/4, coords.z));
				path.push(new BABYLON.Vector3(coords.x, coords.y + height/4, coords.z));
				path.push(new BABYLON.Vector3(coords.x, coords.y + height/2, coords.z));
				paths.push(path);
			});
			var coords = game.drawer.mapTo3Dcoords(position, 8, dimensions);
			var last = [];
			last.push(new BABYLON.Vector3(coords.x, coords.y - height/2, coords.z));
			last.push(new BABYLON.Vector3(coords.x, coords.y - height/4, coords.z));
			last.push(new BABYLON.Vector3(coords.x, coords.y + height/4, coords.z));
			last.push(new BABYLON.Vector3(coords.x, coords.y + height/2, coords.z));
			paths.push(last);
			return paths;
		}
		game.drawer.createWalls = function(scene, material, wsize, psize){
			var up = BABYLON.Mesh.CreateBox("wu", 1, scene);
			up.scaling.x = wsize.w;
			up.scaling.y = psize;
			up.scaling.z = psize;
			up.position.y = psize/2;
			up.position.z = (wsize.h+psize)/2;
			var right = BABYLON.Mesh.CreateBox("wr", 1, scene);
			right.scaling.x = psize;
			right.scaling.y = .1;
			right.scaling.z = wsize.h;
			right.position.x = (wsize.w+psize)/2 -psize*.9/2
			right.position.y = psize/2;
			right.rotation.z = Math.PI/2;
			var down = BABYLON.Mesh.CreateBox("wd", 1, scene);
			down.scaling.x = wsize.w;
			down.scaling.y = psize;
			down.scaling.z = psize;
			down.position.y = psize/2;
			down.position.z = (-wsize.h-psize)/2 + psize;
			var left = BABYLON.Mesh.CreateBox("wl", 1, scene);
			left.scaling.x = psize;
			left.scaling.y = .1;
			left.scaling.z = wsize.h;
			left.position.x = (-wsize.w-psize)/2 +psize*.9/2;
			left.position.y = psize/2;
			left.rotation.z = -Math.PI/2;

			up.material = material;
			right.material = material;
			down.material = material;
			left.material = material;
		}

		game.drawer.engine = new BABYLON.Engine(game.viewport, true);
		game.drawer.scene = new BABYLON.Scene(game.drawer.engine);
		// create a FreeCamera, and set its position to (x:0, y:5, z:-10)
		game.drawer.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 450,-350), game.drawer.scene);
		// target the camera to scene origin
		game.drawer.camera.setTarget(new BABYLON.Vector3(0,0,-50));
		// attach the camera to the canvas
		//game.drawer.camera.attachControl(game.viewport, false);

		// create a basic light, aiming 0,1,0 - meaning, to the sky
		game.drawer.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,0,1), game.drawer.scene);
		game.drawer.light.intensity = .3;
		// Create Materials
		game.drawer.floorMat = new BABYLON.StandardMaterial('emmissive floor', game.drawer.scene);
		game.drawer.floorMat.alpha = 1;
		game.drawer.floorMat.backFaceCulling = true;
		game.drawer.floorMat.specularPower = 64;
		game.drawer.floorMat.useSpecularOverAlpha = false;
		game.drawer.floorMat.useAlphaFromDiffuseTexture = false;
		// diffuse definitions;
		game.drawer.floorMat.diffuseColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		// emissive definitions;
		game.drawer.floorMat.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		//Texture Parameters ;
		game.drawer.floorMat_emissiveTexture = new BABYLON.Texture('texture/floor.jpg', game.drawer.scene);
		game.drawer.floorMat_emissiveTexture.uScale = game.world.width/(3*16);
		game.drawer.floorMat_emissiveTexture.vScale = game.world.height/(3*16);
		game.drawer.floorMat_emissiveTexture.coordinatesMode = 0;
		game.drawer.floorMat_emissiveTexture.uOffset = 0;
		game.drawer.floorMat_emissiveTexture.vOffset = 0;
		game.drawer.floorMat_emissiveTexture.uAng = 0;
		game.drawer.floorMat_emissiveTexture.vAng = 0;
		game.drawer.floorMat_emissiveTexture.level = .3;
		game.drawer.floorMat_emissiveTexture.coordinatesIndex = 0;
		game.drawer.floorMat_emissiveTexture.hasAlpha = false;
		game.drawer.floorMat_emissiveTexture.getAlphaFromRGB = false;
		game.drawer.floorMat.emissiveTexture = game.drawer.floorMat_emissiveTexture;
		// ambient definitions;
		game.drawer.floorMat.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		// specular definitions;
		game.drawer.floorMat.specularColor = new BABYLON.Color3(1.00, 1.00, 1.00);

		game.drawer.wallMat = new BABYLON.StandardMaterial('Walls', game.drawer.scene);
		game.drawer.wallMat.alpha = 0.99;
		game.drawer.wallMat.backFaceCulling = true;
		game.drawer.wallMat.specularPower = 64;
		game.drawer.wallMat.useSpecularOverAlpha = true;
		game.drawer.wallMat.useAlphaFromDiffuseTexture = false;
		// diffuse definitions;
		game.drawer.wallMat.diffuseColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		// emissive definitions;
		game.drawer.wallMat.emissiveColor = new BABYLON.Color3(0.00, 0.40, 1.00);
		// ambient definitions;
		game.drawer.wallMat.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		// opacity definitions;
		//Texture Parameters ;
		game.drawer.wallMat_opacityTexture = new BABYLON.Texture('texture/hlines.jpg', game.drawer.scene);
		game.drawer.wallMat_opacityTexture.uScale = 0;
		game.drawer.wallMat_opacityTexture.vScale = 1;
		game.drawer.wallMat_opacityTexture.coordinatesMode = 0;
		game.drawer.wallMat_opacityTexture.uOffset = 0;
		game.drawer.wallMat_opacityTexture.vOffset = 0;
		game.drawer.wallMat_opacityTexture.uAng = 0;
		game.drawer.wallMat_opacityTexture.vAng = 0;
		game.drawer.wallMat_opacityTexture.level = 1;
		game.drawer.wallMat_opacityTexture.coordinatesIndex = 0;
		game.drawer.wallMat_opacityTexture.hasAlpha = false;
		game.drawer.wallMat_opacityTexture.getAlphaFromRGB = true;
		game.drawer.wallMat.opacityTexture = game.drawer.wallMat_opacityTexture;
		// specular definitions;
		game.drawer.wallMat.specularColor = new BABYLON.Color3(1.00, 1.00, 1.00);

		game.drawer.red = new BABYLON.StandardMaterial('Emmisive Red', game.drawer.scene);
		game.drawer.red.alpha = 1;
		game.drawer.red.backFaceCulling = true;
		game.drawer.red.specularPower = 64;
		game.drawer.red.useSpecularOverAlpha = true;
		game.drawer.red.useAlphaFromDiffuseTexture = false;
		// diffuse definitions;
		game.drawer.red.diffuseColor = new BABYLON.Color3(1.00, 1.00, 1.00);
		// emissive definitions;
		game.drawer.red.emissiveColor = new BABYLON.Color3(1.00, 0.00, 0.00);
		// ambient definitions;
		game.drawer.red.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		// specular definitions;
		game.drawer.red.specularColor = new BABYLON.Color3(1.00, 1.00, 1.00);

		game.drawer.blue = new BABYLON.StandardMaterial('Emmisive Blue', game.drawer.scene);
		game.drawer.blue.alpha = 1;
		game.drawer.blue.backFaceCulling = true;
		game.drawer.blue.specularPower = 64;
		game.drawer.blue.useSpecularOverAlpha = true;
		game.drawer.blue.useAlphaFromDiffuseTexture = false;
		// diffuse definitions;
		game.drawer.blue.diffuseColor = new BABYLON.Color3(1.00, 1.00, 1.00);
		// emissive definitions;
		game.drawer.blue.emissiveColor = new BABYLON.Color3(0.00, 0.75, 1.00);
		// ambient definitions;
		game.drawer.blue.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		// specular definitions;
		game.drawer.blue.specularColor = new BABYLON.Color3(1.00, 1.00, 1.00);

		game.drawer.black = new BABYLON.StandardMaterial('Main Black', game.drawer.scene);
		game.drawer.black.alpha = 1;
		game.drawer.black.backFaceCulling = true;
		game.drawer.black.specularPower = 64;
		game.drawer.black.useSpecularOverAlpha = true;
		game.drawer.black.useAlphaFromDiffuseTexture = false;
		// diffuse definitions;
		game.drawer.black.diffuseColor = new BABYLON.Color3(0.20, 0.20, 0.20);
		// emissive definitions;
		game.drawer.black.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		// ambient definitions;
		game.drawer.black.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);
		// specular definitions;
		game.drawer.black.specularColor = new BABYLON.Color3(1.00, 1.00, 1.00);
		//Create Scene enviroment
		game.drawer.ground = BABYLON.Mesh.CreateGround('ground1', game.world.width, game.world.height, 2, game.drawer.scene);
		game.drawer.ground.material = game.drawer.floorMat;
		game.drawer.createWalls(game.drawer.scene, game.drawer.wallMat, {w:game.world.width, h:game.world.height}, 16);

		//Player box 1
		game.drawer.boxRed = BABYLON.Mesh.CreateBox("box1", 16.0, game.drawer.scene);
		game.drawer.boxRed.position.x = 100;
		game.drawer.boxRed.position.z = -100;
		game.drawer.boxRed.position.y = 8;
		game.drawer.boxRed.material = game.drawer.black;
		//Add colored line
		var boxLine = BABYLON.Mesh.CreateBox("boxLine1", 16.0, game.drawer.scene);
		boxLine.scaling.x = .2;
		boxLine.scaling.y = 1.1;
		boxLine.scaling.z = 1.1;
		boxLine.material = game.drawer.red;
		boxLine.parent = game.drawer.boxRed;
		//Add light to box
		var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 0), game.drawer.scene);
		light0.parent = game.drawer.boxRed;
		light0.position.y = 8;
		light0.diffuse = new BABYLON.Color3(1, 0, 0);
		light0.specular = new BABYLON.Color3(1, 0, 0);

		//Player box 2
		game.drawer.boxBlue = BABYLON.Mesh.CreateBox("box2", 16.0, game.drawer.scene);
		game.drawer.boxBlue.position.x = -100;
		game.drawer.boxBlue.position.z = 100;
		game.drawer.boxBlue.position.y = 8;
		game.drawer.boxBlue.material = game.drawer.black;
		//Add colored line
		var boxLine = BABYLON.Mesh.CreateBox("boxLine2", 16.0, game.drawer.scene);
		boxLine.scaling.x = .2;
		boxLine.scaling.y = 1.1;
		boxLine.scaling.z = 1.1;
		boxLine.material = game.drawer.blue;
		boxLine.parent = game.drawer.boxBlue;
		//Add light to box
		var light0 = new BABYLON.PointLight("Omni1", new BABYLON.Vector3(0, 0, 0), game.drawer.scene);
		light0.parent = game.drawer.boxBlue;
		light0.position.y = 8;
		light0.diffuse = new BABYLON.Color3(0, .75, 1);
		light0.specular = new BABYLON.Color3(0, .75, 1);

		//placeholder for paths
		game.drawer.redPath = {};
		game.drawer.bluePath = {};
		game.drawer.engine.runRenderLoop(function(){
				game.drawer.scene.render();
		});

		// the canvas/window resize event handler
		window.addEventListener('resize', function(){
				game.drawer.engine.resize();
		});

			//Fetch the rendering contexts
		//game.ctx = game.viewport.getContext('2d');

			//Set the draw style for the font
		//game.ctx.font = '11px "Helvetica"';

		//Finally, start the loop
	game.update( new Date().getTime() );

}; //window.onload
