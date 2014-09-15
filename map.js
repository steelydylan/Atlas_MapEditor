Atlas();
Atlas.extendClass(Thing,{
	keyDown:function(key){
		this.space = key.space;
	},
	keyUp:function(){
		this.space = false;
	},
	setInput:function(x,y){
		this.inputX = x;
		this.inputY = y; 
	},
	touchStart : function(e){
		this.Ex = e.x;
		this.Ey = e.y;
		this.touched = true;		
	},
	touchMove : function(e){
		if(this.touched === true && this.space){
			this.x += e.x - this.Ex;
			this.y += e.y - this.Ey;
			this.Ex = e.x;
			this.Ey = e.y;
		}		
	},
	touchEnd : function(e){
		this.touched = false;
	}
});
Atlas.extendClass(Layer,{
	makeGrid:function(width,height){
		var x = $(this.inputX).val();
		var y = $(this.inputY).val();
		var diffX = width / x;
		var diffY =  height / y;
		for(var i = 0; i <= x; i++){
			var box = new Shape.Box("white",1,height);
			box.x = diffX * i;
			box.eventEnable = false;
			this.addChild(box);
		}
		for(var i = 0; i <= y; i++){
			var box = new Shape.Box("white",width,1);
			box.y = diffY * i;
			box.eventEnable = false;
			this.addChild(box);
		}
	},
});
Atlas.extendClass(Map,{
	setDrawDataBySize:function(sizex,sizey){
		var x = $(this.inputX).val();
		var y = $(this.inputY).val();
		var drawData = [];
		for(var i = 0; i < y; i++){
			var arr = [];
			for(var t = 0; t < x; t++){
				arr.push(-1);
			}
			drawData.push(arr)
		}
		this.drawData = drawData;
	},
	fillChip:function(e){
		var obj = this.getImageSize();
		var splitX = $(this.inputX).val();
		var splitY = $(this.inputY).val();
		var gridX = obj.width / splitX;
		var gridY = obj.height / splitY;
		var x = Math.floor((e.x - this.x) / gridX);
		var y = Math.floor((e.y - this.y) / gridY);
		this.drawData[y][x] = this.chip;
	},
	touchStart:function(e){
		this.touched = true;
		if(!this.space)
			this.fillChip(e);
		else{
			this.Ex = e.x;
			this.Ey = e.y;
		}
	},
	touchMove:function(e){
		if(this.touched){
			if(!this.space){
				this.fillChip(e);
			}else{
				this.x += e.x - this.Ex;
				this.y += e.y - this.Ey;
				this.Ex = e.x;
				this.Ey = e.y;
			}
		}
	},
	touchEnd:function(e){
		this.touched = false;
	}
});
Atlas.main(function(){
	var app = new App("map");
	app.load(["map.png","map"]);
	var dest = new App("dest");
	dest.setSize(400,400);
	dest.setQuality(400,400);
	dest.setColor("black");
	app.splitX = 30;
	app.splitY = 16;
	var layer = new Layer();
	layer.setInput("#splitX","#splitY");
	layer.makeGrid(512,384);
	var destLayer = new Layer();
	destLayer.setInput("#destSplitX","#destSplitY");
	destLayer.makeGrid(512,384);
	var map = new Map("map",16,16);
	//destLayer.addChild(map);
	map.setInput("#destSplitX","#destSplitY");
	map.setDrawDataBySize(512,384);
	var sprite = new Sprite("map",512,384);
	sprite.name = "map";
	app.setSize(400,400);
	app.setQuality(400,400);
	app.setColor("black");
	var box = new Shape.Box("rgba(255,0,0,0.5)",0,0);
	box.name = "focus";
	app.touchStart = function(e){
		var sprite = this.getChild({name:"map"});
		var splitX = $("#splitX").val();
		var splitY = $("#splitY").val();
		var gridX = sprite.width / splitX;
		var gridY = sprite.height / splitY;
		box.width = gridX;
		box.height = gridY;
		var numberX = Math.floor((e.x - sprite.x) / gridX);
		var numberY = Math.floor((e.y - sprite.y) / gridY);
		map.chip = numberY * splitX + numberX;
		box.x = numberX * gridX + sprite.x;
		box.y = numberY * gridY + sprite.y;
	}
	$("#imgUpload").change(function(){
		var file = $(this).prop("files")[0];
		var fr = new FileReader();
		fr.onload = function(){
			app.load([fr.result,"map"]);
			sprite.setImage("map");
			var image = new Image();
			image.src = fr.result;
			image.onload = function(){
				sprite.setSpriteSize(image.width,image.height);
				sprite.setSize(image.width,image.height);
				layer.removeAll();
				var sizeX = image.width/$(map.inputX).val();
				var sizeY = image.height/$(map.inputY).val();
				map.setImage("map",sizeX,sizeY);
				map.setSize(sizeX,sizeY);
				destLayer.removeAll();
				destLayer.makeGrid(image.width,image.height);
				layer.removeAll();
				layer.makeGrid(image.width,image.height)
			}
		}
		fr.readAsDataURL(file); 
	});
	$("#dl").click(function(){
		dest.getCanvasImage();
	})
	app.addChildren(sprite,layer,box);
	app.start();

	dest.addChildren(destLayer,map);
	dest.start();
});