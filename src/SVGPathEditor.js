(function(global){
    
    var SVGNS = "http://www.w3.org/2000/svg";
    
    /**
     * SVGを編集するツールを作成
     */
    var SVGPathEditor = function (targetElement, option) {   
	
		if (typeof option != "object") {
			
			option = {
				isAbs			: true,
				editable		: true,
				isFollowNode            : true,
				targetRootLayer		: null,
				editingRootLayer	: null,
				pointLayer		: null,
				lineLayer		: null,
				editingPathStrokeColor	: null,
				editingPointStrokeColor : null,
				editingPointStrokeWidth : null,
				editingPointFillColor	: null
			};
			
		}
	
        this.targetElement = targetElement;
        this.ownerSVGElement = targetElement.ownerSVGElement;
        this._editable = true;
        this.editable = (typeof option.editable == "boolean")? option.editable : true;
        this.isAbs = (typeof option.isAbs == "boolean")? option.isAbs : true;
        this._isFollowNode = true;
        this.isFollowNode = (typeof option.isFollowNode == "boolean")? option.isFollowNode : true;
        this.CTM = null;
        this.editingPath = null;
        this.pathSegList = null;
        this.editingRootLayer = null;
        this.pointLayer = null;
        this.lineLayer = null;
        this.draggableControlPoints = null;
        this.selectedPoint = null;

	//レイヤーの初期化
        var editingRootLayer = document.createElementNS(SVGNS, "g");
        editingRootLayer.setAttribute("class", "SVGPathEditor");
        this.ownerSVGElement.appendChild(editingRootLayer);
        this.editingRootLayer = editingRootLayer;
        
        //初期化
        this.init();
	
	//制御点の描画
        this.renderControlPoints();
    
    };
    
    /**
     * Editable Setter/Getter
     */
	ynakajima.defineSetterGetter(SVGPathEditor.prototype, "editable", {
	
		setter : function (editable) { this._editable = (editable === true); },
		getter : function () { return this._editable; }
	
	});
	
	/**
     * isFollowNode Setter/Getter
     */
	ynakajima.defineSetterGetter(SVGPathEditor.prototype, "isFollowNode", {
	
		setter : function (isFollowNode) {
		
			this._isFollowNode = (isFollowNode === true);
			
			if (this.pathSegList != null) {
			
				for (var i = 0, iMax = this.pathSegList.length; i < iMax; i++) {
				
					this.pathSegList[i].isFollowNode = this._isFollowNode;	
				
				}
			
			}
				
		},
		getter : function () { return this._isFollowNode; }
	
	});
    
    /**
     * 初期化
     */
    SVGPathEditor.prototype.init = function () {

		//CTM
		this.CTM = this.targetElement.getCTM();

		//編集用パス
		var editingPath = document.createElementNS(SVGNS, "path");
		editingPath.setAttribute("d", this.targetElement.getAttribute("d"));
		editingPath.setAttribute("fill", "none");
		editingPath.setAttribute("stroke", "#00f");
		editingPath.setAttribute("stroke-width", .5 / Math.max(this.CTM.a, this.CTM.d));
		editingPath.transform.baseVal.appendItem(editingPath.transform.baseVal.createSVGTransformFromMatrix(this.CTM));
		this.editingPath = editingPath;
			 
		//pathSegListの初期化
		this.initPathSegList();
		        
        //ポイントのドラッグ
		var that = this;
		this.editingRootLayer.addEventListener ("mousedown", function (e) {
			
			that._startDragHandler(e);
		
		}, false);
		
		this.ownerSVGElement.addEventListener ("mousemove", function (e) {
			
			that._dragHandler(e);

		}, false);
		
		this.ownerSVGElement.addEventListener ("mouseup", function (e) {
			
			that._stopDragHandler(e);

		}, false);
		
		//hover
		this.editingRootLayer.addEventListener ( "mouseover", function (e) {
			
			if (that.editable && e.target.draggableControlPoint) {
				
				e.target.setAttribute("fill", "#f00");
				
			}
			
		}, false);
		
		this.editingRootLayer.addEventListener ( "mouseout", function (e) {
			
			if (that.editable && e.target.draggableControlPoint) {
				
				that.renderControlPoints();
				
			}
			
		}, false);
        
    };
    
    /**
     * Drag開始
     */
    SVGPathEditor.prototype._startDragHandler = function (e) {
			
		if (this.editable && e.target.draggableControlPoint) {
			
			e.target.draggableControlPoint.isSelected = true;
			this.selectedPoint = e.target.draggableControlPoint;
			this.selectedPoint.startDrag(e);
			
			this.renderControlPoints();

		}

    };
    
    /**
     * Drag処理
     */
	SVGPathEditor.prototype._dragHandler = function (e) {
    	
    	if (this.editable && this.selectedPoint !== null) {
			
			this.selectedPoint.drag(e);
			this.updatePathSegList();
			this.renderControlPoints();
			
		}
		
	};
	
	/**
     * Drag終了
     */
	SVGPathEditor.prototype._stopDragHandler = function (e) {
    	
		if (this.editable && this.selectedPoint !== null) {
			
			this.selectedPoint.isSelected = false;
			this.selectedPoint.stopDrag();
			this.selectedPoint = null
			this.targetElement.setAttribute("d", this.editingPath.getAttribute("d"));
			this.renderControlPoints();
		
		}
		
	}; 
    
    /**
     * pathSegListの初期化
     */
    SVGPathEditor.prototype.initPathSegList = function () {
	
		//pathSegListの初期化
		this.pathSegList = [];
		var svgPathSegList = this.editingPath.pathSegList;
        var pathSegOption = {
			isAbs: this.isAbs, 
			isFollowNode: this.isFollowNode        
        };
        
        for (var i = 0, iMax = svgPathSegList.numberOfItems; i < svgPathSegList.numberOfItems; i++) {
        
			var pathSeg = new ynakajima.svg.PathSeg(
				svgPathSegList.getItem(i),
				this.pathSegList,
				i,
				svgPathSegList,
				pathSegOption
			); 
			this.pathSegList.push(pathSeg);
			
		}
		
		this.targetElement.setAttribute("d", this.editingPath.getAttribute("d"));
		
	};

 	/**
     * pathSegListの更新
     */
    SVGPathEditor.prototype.updatePathSegList = function () {
	
		//pathSegListの更新
        for (var i = 0, iMax = this.pathSegList.length; i < iMax; i++) {
			
			this.pathSegList[i].init();
			
		}
		
	};

    /**
     * 制御点の表示
     */
    SVGPathEditor.prototype.renderControlPoints = function () {
		
		//draggableControlPointsの初期化
		if (this.draggableControlPoints == null) {
			
			this.draggableControlPoints = [];		
			
		}
			
		//CTMを取得
        var CTM = this.CTM;
        
        //制御ポイント表示用のレイヤーを作成
        var lineLayer = document.createElementNS(SVGNS, "g");
        lineLayer.setAttribute("class", "lineLayer");
        var pointLayer = document.createElementNS(SVGNS, "g");
        pointLayer.setAttribute("class", "pointLayer");

		//表示
		lineLayer.appendChild(this.editingPath );
		var pathSegList = this.pathSegList;
	
		for (var i = 0, iMax = pathSegList.length; i < iMax; i++) {
			
			//pathSeq取得	
			var pathSeg = pathSegList[i];
			var next = (i + 1 < iMax) ? pathSegList[i+1] : null;
			var prev = (i !== 0) ? pathSegList[i-1] : {x: 0, y: 0};
			
			if (pathSeg.type.match(/^[Z]$/i)) {
				continue;
			}
			
			
			//isSelected
			var isInited = (typeof this.draggableControlPoints[i] != "undefined");
			var nodeIsSelected = (isInited && this.draggableControlPoints[i].node.isSelected);
			var c1IsSelected = (isInited && this.draggableControlPoints[i].c1 && this.draggableControlPoints[i].c1.isSelected);
			var c2IsSelected = (isInited && this.draggableControlPoints[i].c2 && this.draggableControlPoints[i].c2.isSelected);
			
			//色
			var fillColor = (nodeIsSelected) ? "#f00" : "#fff";
			var c1FillColor = (c1IsSelected) ? "#f00" : "#33f";
			var c2FillColor = (c2IsSelected) ? "#f00" : "#33f";
			
			//pathSegとCTMから座標を算出
			var point = this.ownerSVGElement.createSVGPoint();
			point.x = pathSeg.x;
			point.y = pathSeg.y;
			point = point.matrixTransform(CTM);
			
			//１つまえのポイント
			var prevPoint = this.ownerSVGElement.createSVGPoint();
			prevPoint.x = prev.x;
			prevPoint.y = prev.y;
			prevPoint = prevPoint.matrixTransform(CTM);
						
			//ポイント
			var rect = document.createElementNS(SVGNS, "rect");
			rect.setAttribute("x", point.x - 3);
			rect.setAttribute("y", point.y - 3);
			rect.setAttribute("width", 6);
			rect.setAttribute("height", 6);
			rect.setAttribute("fill", fillColor);
			rect.setAttribute("stroke", "#000");
			rect.setAttribute("stroke-width", "1");
			rect.setAttribute("opacity", 1);
			if (next && next.type.match(/^[ST]$/i)) {
				rect.setAttribute("transform", "rotate(45," + (point.x) + "," + (point.y) +")");
			}
			
			var draggableControlPoint;
			if (typeof this.draggableControlPoints[i] == "undefined") { 
				
				draggableControlPoint = new ynakajima.svg.DraggableControlPoint(pathSeg, CTM, "");
				this.draggableControlPoints[i] = {
					node : draggableControlPoint
				};
				
			} else {
				
				draggableControlPoint = this.draggableControlPoints[i].node;
			
			}
			
			rect.draggableControlPoint = draggableControlPoint;
			
			//制御ポイント１
			if (pathSeg.x1 !== null && pathSeg.y1 !== null) {
				
				var point1 = this.ownerSVGElement.createSVGPoint();
				point1.x = pathSeg.x1;
				point1.y = pathSeg.y1;
				point1 = point1.matrixTransform(CTM);
		
				var c1 = document.createElementNS(SVGNS, "circle");
				c1.setAttribute("cx", point1.x);
				c1.setAttribute("cy", point1.y);
				c1.setAttribute("r", 3);
				c1.setAttribute("fill", c1FillColor);
				c1.setAttribute("stroke", "#fff");
				c1.setAttribute("stroke-width", "1");
				
				//略式・滑ベジェだった場合
				if (pathSeg.type.match(/^[ST]$/i)) {
					c1.setAttribute("r", 1);
					c1.setAttribute("fill", "#000");
				}
		
				pointLayer.appendChild(c1);
		
				if (pathSeg.x2 == null && pathSeg.y2 == null) {
			
					var line = document.createElementNS(SVGNS, "path");
					line.setAttribute("d", 
					"M " + prevPoint.x + "," + prevPoint.y + 
					" L " + point1.x + "," + point1.y + " " + point.x + "," + point.y
					);
					line.setAttribute("stroke", "#00f");
					line.setAttribute("stroke-width", 0.5); 
					line.setAttribute("fill", "none");
					 
					lineLayer.appendChild(line);
			
				}
				
				var draggableControlPoint1;
				if (typeof this.draggableControlPoints[i].c1 == "undefined") { 
				
					draggableControlPoint1 = new ynakajima.svg.DraggableControlPoint(pathSeg, CTM, 1);
					this.draggableControlPoints[i].c1 = draggableControlPoint1;
				
				} else {
				
					draggableControlPoint1 = this.draggableControlPoints[i].c1;
			
				}
				
				c1.draggableControlPoint = draggableControlPoint1;
		
			}
			
			//制御ポイント2
			if (pathSeg.x1 !== null && pathSeg.y1 !== null && pathSeg.x2 !== null && pathSeg.y2 !== null) {
				
				var point2 = this.ownerSVGElement.createSVGPoint();
				point2.x = pathSeg.x2;
				point2.y = pathSeg.y2;
				point2 = point2.matrixTransform(CTM);
				
				var c2 = document.createElementNS(SVGNS, "circle");
				c2.setAttribute("cx", point2.x);
				c2.setAttribute("cy", point2.y);
				c2.setAttribute("r", 3);
				c2.setAttribute("fill", c2FillColor);
				c2.setAttribute("stroke", "#fff");
				c2.setAttribute("stroke-width", 1);
				
				pointLayer.appendChild(c2);
			
				var line = document.createElementNS(SVGNS, "path");
				line.setAttribute("d", 
					"M " + prevPoint.x + " " + prevPoint.y + 
					" L " + point1.x + " " + point1.y + 
					" M " + point2.x + " " + point2.y +
					" L " + point.x + " " + point.y
				);
				line.setAttribute("stroke", "#00f"); 
				line.setAttribute("stroke-width", 0.5);
				line.setAttribute("fill", "none");
					 
				lineLayer.appendChild(line);
				
				var draggableControlPoint2;
				if (typeof this.draggableControlPoints[i].c2 == "undefined") { 
				
					draggableControlPoint2 = new ynakajima.svg.DraggableControlPoint(pathSeg, CTM, 2);
					this.draggableControlPoints[i].c2 = draggableControlPoint2;
				
				} else {
				
					draggableControlPoint2 = this.draggableControlPoints[i].c2;
			
				}
				
				c2.draggableControlPoint = draggableControlPoint2;
					
			}
									
			pointLayer.appendChild(rect);
			
		}
	
		this.clearControlPoints();
	
		this.editingRootLayer.appendChild(lineLayer);
		this.editingRootLayer.appendChild(pointLayer);
		this.lineLayer = lineLayer;
		this.pointLayer = pointLayer;

    };
    
	/**
     * 制御点の非表示
     */
    SVGPathEditor.prototype.clearControlPoints = function() {
		
		var lineLayer = document.createElementNS(SVGNS, "g");
        lineLayer.setAttribute("class", "lineLayer");
        var pointLayer = document.createElementNS(SVGNS, "g");
        pointLayer.setAttribute("class", "pointLayer");
		
		if (this.lineLayer && this.lineLayer.parentNode) {
			this.lineLayer.parentNode.removeChild(this.lineLayer);
		}
	
		if (this.pointLayer && this.pointLayer.parentNode) {
			this.pointLayer.parentNode.removeChild(this.pointLayer);
		}
		
		this.lineLayer = lineLayer;
		this.pointLayer = pointLayer;
		
	};
	
	
    //グローバルオブジェクトに
    if (!global.ynakajima) {
        global.ynakajima = {};
    }
    
    if (!global.ynakajima.svg) {
        global.ynakajima.svg = {};
    }
    
    global.ynakajima.svg.SVGPathEditor = SVGPathEditor;

})(window);
