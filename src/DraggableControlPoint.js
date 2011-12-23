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
    
    };
    
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
