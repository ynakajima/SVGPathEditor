 /*!
 * SVGPathEditor 
 * https://github.com/ynakajima/SVGPathEditor/
 *
 * Copyright (c) 2011, ynakajima <yuhta.nakajima@gmail.com>.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *  
 */

(function (global) {

	var ynakajima = {};
	
	/**
	 * クロスブラウザ用ゲッターセッター関数
	 * @param {Object} obj ゲッターセッターを設定したいオブジェクト
	 * @param {String} name ゲッターセッタープロパティ名
	 * @param {Object} setterGetter セッター関数とゲッター関数を含んだオブジェクト
	 */
	ynakajima.defineSetterGetter = function(obj, name, setterGetter) {

		//__defineSetter__が未定義かつObject.definePropertyが有効な場合
		if (!Object.prototype.__defineSetter__ && Object.defineProperty({},"x",{get: function(){return true}}).x) {

			Object.defineProperty(obj,name, {
					set: setterGetter.setter,
					get: setterGetter.getter 
			});

		} else if(Object.prototype.__defineSetter__) {
		
			obj.__defineSetter__(name, setterGetter.setter);
			obj.__defineGetter__(name, setterGetter.getter);
		
		}

	};
	

	//グローバルオブジェクトとして登録				
	if (typeof global.ynakajima === 'undefined') {
		
		global.ynakajima = ynakajima;
		
	}
				
})(this);

(function (global) {

    /**
     * PathSeg
     */
    var PathSeg = function (pathSeg, pathSegList, index, svgPathSegList, option) {
		
		if (typeof option === 'undefined') {
		
			option = {
				
				isAbs : true,
				isFollowNode : true
				
			};	
			
		}
		
		this.pathSeg = pathSeg;
		this.origPathSeg = pathSeg;
		this.pathSegList = pathSegList;
		this.index = index;
		this.sameNode = null;
		this.type = pathSeg.pathSegTypeAsLetter;
		this.isAbs = (option.isAbs)? true : (this.type.match(/^[A-Z]$/) !== null);
		this.isFollowNode = option.isFollowNode;
		this.svgPathSegList = svgPathSegList;
		this.x = null;
		this.y = null;
		this.x1 = null;
		this.y1 = null;
		this.x2 = null;
		this.y2 = null;
	
		this.init();
    
    };
    
    PathSeg.prototype.init = function () {
	
		var pathSeg = this.pathSeg;
		var prev = (this.index - 1 < 0)? {x: 0, y: 0, type: ""} : this.pathSegList[this.index - 1];
		
		//１つ前の要素を取得（１つ前が[Zz]だった場合は遡って取得）
		if (prev.type.match(/^[Z]$/i)) {
		
			for (var i = 2; this.index - i >= 0; i++) {
			
				prev = this.pathSegList[this.index - i];
				if (this.index - i -1 >= 0 && this.pathSegList[this.index - i - 1]["origPathSeg"].pathSegTypeAsLetter.match(/^[Z]$/i)) {
					break;
				}
			}
		
		}
		
		var type = this.type;
		var _isAbs = (this.type.match(/^[A-Z]$/) !== null);
	
		if (type.match(/^[MLHVCSQT]$/i)) {	
		
			this.x = (typeof pathSeg.x === "number")? (_isAbs)? pathSeg.x : prev.x + pathSeg.x : prev.x;
			this.y = (typeof pathSeg.y === "number")? (_isAbs)? pathSeg.y : prev.y + pathSeg.y : prev.y;
			this.x1 = (typeof pathSeg.x1 === "number")? (_isAbs)? pathSeg.x1 : prev.x + pathSeg.x1 : null;
			this.y1 = (typeof pathSeg.y1 === "number")? (_isAbs)? pathSeg.y1 : prev.y + pathSeg.y1 : null;
			this.x2 = (typeof pathSeg.x2 === "number")? (_isAbs)? pathSeg.x2 : prev.x + pathSeg.x2 : null;
			this.y2 = (typeof pathSeg.y2 === "number")? (_isAbs)? pathSeg.y2 : prev.y + pathSeg.y2 : null;
		
		}
	
		if (type.match(/^[S]$/i)) {
	
			this.x1 = (prev.type.match(/^[CS]$/i))? prev.x + (prev.x - prev.x2) : prev.x; 
			this.y1 = (prev.type.match(/^[CS]$/i))? prev.y + (prev.y - prev.y2) : prev.y;
			
		} else if (type.match(/^[T]$/i)) {
			
			this.x1 = (prev.type.match(/^[QT]$/i))? prev.x + (prev.x - prev.x1) : prev.x; 
			this.y1 = (prev.type.match(/^[QT]$/i))? prev.y + (prev.y - prev.y1) : prev.y;
		
		}
		
		//絶対座標への変換
		if (this.isAbs && !_isAbs) {
			
			var _path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			var _pathSeg = null;
			
			switch (this.type) {
			
				case "m" :
					_pathSeg = _path.createSVGPathSegMovetoAbs(this.x, this.y);
					break;
					
				case "l" :
					_pathSeg = _path.createSVGPathSegLinetoAbs(this.x, this.y);
					break;
				
				case "h" :
					_pathSeg = _path.createSVGPathSegLinetoHorizontalAbs(this.x);
					break;
					
				case "v" :
					_pathSeg = _path.createSVGPathSegLinetoVerticalAbs(this.y);
					break;
				
				case "c" :
					_pathSeg = _path.createSVGPathSegCurvetoCubicAbs(this.x, this.y, this.x1, this.y1, this.x2, this.y2);
					break;
					
				case "s" :
					_pathSeg = _path.createSVGPathSegCurvetoCubicSmoothAbs(this.x, this.y, this.x2, this.y2);
					break;
					
				case "q" :
					_pathSeg = _path.createSVGPathSegCurvetoQuadraticAbs(this.x, this.y, this.x1, this.y1);
					break;
					
				case "t" :
					_pathSeg = _path.createSVGPathSegCurvetoQuadraticSmoothAbs(this.x, this.y);
					break;
					
				default :
					_pathSeg = null;
			}
			
			if (_pathSeg != null) {
				
				this.pathSeg = this.svgPathSegList.replaceItem(_pathSeg, this.index);
				this.type = this.pathSeg.pathSegTypeAsLetter;
				
			}
			
		}
			    
    };

	PathSeg.prototype.setX = function (x) {
	
		if (typeof this.pathSeg.x === "number") {
			
			var origX = this.pathSeg.x;
			this.pathSeg.x = x;
			
			//コントロールポイントを追随させる
			if (this.isFollowNode) { 
				
				var delta = x - origX;
				var next = (this.index == this.pathSegList.length - 1)? false : this.pathSegList[this.index + 1];
				if (next && next.x1 != null) {
				
					next.setX1(next.pathSeg.x1 + delta);
				
				}
				
				if (this.x2 != null) {
					
					this.pathSeg.x2 += delta;
					
				}	
				
			}
			
			this.init();
			 
		}
	
	};
	
	PathSeg.prototype.setY = function (y) {
	
		if (typeof this.pathSeg.y === "number") {
			
			var origY = this.pathSeg.y;
			this.pathSeg.y = y;
			
			//コントロールポイントを追随させる
			if (this.isFollowNode) { 
				
				var delta = y - origY;
				var next = (this.index == this.pathSegList.length - 1)? false : this.pathSegList[this.index + 1];
				if (next && next.y1 != null) {
				
					next.setY1(next.pathSeg.y1 + delta);
				
				}
				
				if (this.y2 != null) {
					
					this.pathSeg.y2 += delta;
					
				}
				
			}

			this.init();
			
		}
	
	};
	
	PathSeg.prototype.setX1 = function (x) {
	
		if (typeof this.pathSeg.x1 === "number") {
			
			this.pathSeg.x1 = x;
			this.init();
			
		}
	
	};
	
	PathSeg.prototype.setY1 = function (y) {
	
		if (typeof this.pathSeg.y1 === "number") {
			
			this.pathSeg.y1 = y;
			this.init();
			
		}
	
	};
	
	PathSeg.prototype.setX2 = function (x) {
	
		if (typeof this.pathSeg.x2 === "number") {
			
			this.pathSeg.x2 = x;
			this.init();
			
		}
	
	};
	
	PathSeg.prototype.setY2 = function (y) {
	
		if (typeof this.pathSeg.y2 === "number") {
			
			this.pathSeg.y2 = y;
			this.init();
			
		}
	
	};

    //グローバルオブジェクトに
    if (!global.ynakajima) {

        global.ynakajima = {};
    
    }
    
    if (!global.ynakajima.svg) {
        
        global.ynakajima.svg = {};
        
    }
    
    global.ynakajima.svg.PathSeg = PathSeg;


})(window);
(function(global){
    
    var SVGNS = "http://www.w3.org/2000/svg";
    
    /**
     * ドラッグ可能な制御点
     */
    var DraggableControlPoint = function (pathSeg, targetCTM, propNum) {
    
    	if (typeof propNum !== "number") {
    		propNum = "";
    	}
    	
    	this._x = null;
    	this._y = null;
    	this.pathSeg = pathSeg;
    	this.targetCTM = targetCTM;
    	this.xPropName = "x" + propNum;
    	this.yPropName = "y" + propNum;
    	this.origX = null;
    	this.origY = null;
    	this.origPageX = null;
    	this.origPageY = null;
    	this._isSelected = false;
    	this.isSelected = this._isSelected;
    
    };
    
	/**
     * isSelected Setter/Getter
     */
	ynakajima.defineSetterGetter(DraggableControlPoint.prototype, "isSelected", {
	
		setter : function (isSelected) {
			
			this._isSelected = (isSelected === true);
				
		},
		getter : function () {
		
			return this._isSelected;
		
		}
	
	});
    
   	/**
   	 * DraggableControlPointの初期化
   	 */
	DraggableControlPoint.prototype.init = function () {
	
	};
	
	/**
   	 * Dragの開始
   	 */
   	DraggableControlPoint.prototype.startDrag = function (e) {
		//console.log(this.pathSeg, this.pathSeg.index);
		this.origX = this.pathSeg.pathSeg[this.xPropName];
		this.origY = this.pathSeg.pathSeg[this.yPropName];
		
		//座標の変換
		var point = (document.createElementNS(SVGNS, "svg")).createSVGPoint();
		point.x = e.pageX;
		point.y = e.pageY;
		point = point.matrixTransform(this.targetCTM.inverse());
		
		this.origPageX = point.x;
		this.origPageY = point.y;
		
	};
	
	/**
	 * Dragの実行
	 */
	DraggableControlPoint.prototype.drag = function (e) {
		
		//座標の変換
		var point = (document.createElementNS(SVGNS, "svg")).createSVGPoint();
		point.x = e.pageX;
		point.y = e.pageY;
		point = point.matrixTransform(this.targetCTM.inverse());
	
		//座標の設定
		var x = this.origX + (point.x - this.origPageX);
		var y = this.origY + (point.y - this.origPageY);
		this._setX(x);
		this._setY(y);
		
	};
	
	/**
   	 * Dragの停止
   	 */
   	DraggableControlPoint.prototype.stopDrag = function () {
		
		this.origX = null;
		this.origY = null;
		this.origPageX = null;
		this.origPageY = null;
		
	};
	
	/**
   	 * X座標の設定
   	 */
   	DraggableControlPoint.prototype._setX = function (x) {
		
		if (this.xPropName === "x") {
		
			this.pathSeg.setX(x);
			
		} else if (this.xPropName === "x1") {
		
			this.pathSeg.setX1(x);
		
		} else if (this.xPropName === "x2") {
		
			this.pathSeg.setX2(x);
		
		}
		
	};
	
	/**
   	 * Y座標の設定
   	 */
   	DraggableControlPoint.prototype._setY = function (y) {
		
		if (this.yPropName === "y") {
		
			this.pathSeg.setY(y);
			
		} else if (this.yPropName === "y1") {
		
			this.pathSeg.setY1(y);
		
		} else if (this.yPropName === "y2") {
		
			this.pathSeg.setY2(y);
		
		}
		
	};
	
	    
    //グローバルオブジェクトに
    if (!global.ynakajima) {
        global.ynakajima = {};
    }
    
    if (!global.ynakajima.svg) {
        global.ynakajima.svg = {};
    }
    
    global.ynakajima.svg.DraggableControlPoint = DraggableControlPoint;


})(window);
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
				isFollowNode	: true,
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
		        
        //レイヤーの初期化
        var editingRootLayer = document.createElementNS(SVGNS, "g");
        editingRootLayer.setAttribute("class", "SVGPathEditor");
        this.ownerSVGElement.appendChild(editingRootLayer);
        this.editingRootLayer = editingRootLayer;
        
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
