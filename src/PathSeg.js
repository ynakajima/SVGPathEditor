(function (global) {

    /**
     * PathSeg
     */
    var PathSeg = function (pathSeg, pathSegList, index, referencePoint) {
		
		this.pathSeg = pathSeg;
		this.pathSegList = pathSegList;
		this.index = index;
		this.referencePoint = (referencePoint == null)? {x: 0, y: 0, type: "", referrer: []} : referencePoint;
		this.referrer = [];
		this.type = pathSeg.pathSegTypeAsLetter;
		this.isAbs = (this.type.match(/^[A-Z]$/) !== null);
		this.x = null;
		this.y = null;
		this.x1 = null;
		this.y1 = null;
		this.x2 = null;
		this.y2 = null;
	
		//相対座標だった場合基準点に参照ノードとして登録
		if (!this.isAbs) {
			this.referencePoint.referrer.push(this);
		}
	
		this.init();
    
    };
    
    PathSeg.prototype.init = function () {
	
		var pathSeg = this.pathSeg;
		var prev = this.referencePoint;
		var type = this.type;
		var isAbs = this.isAbs;
	
		if (type.match(/^[MLHVCSQT]$/i)) {	
		
			this.x = (typeof pathSeg.x === "number")? (isAbs)? pathSeg.x : prev.x + pathSeg.x : prev.x;
			this.y = (typeof pathSeg.y === "number")? (isAbs)? pathSeg.y : prev.y + pathSeg.y : prev.y;
			this.x1 = (typeof pathSeg.x1 === "number")? (isAbs)? pathSeg.x1 : prev.x + pathSeg.x1 : null;
			this.y1 = (typeof pathSeg.y1 === "number")? (isAbs)? pathSeg.y1 : prev.y + pathSeg.y1 : null;
			this.x2 = (typeof pathSeg.x2 === "number")? (isAbs)? pathSeg.x2 : prev.x + pathSeg.x2 : null;
			this.y2 = (typeof pathSeg.y2 === "number")? (isAbs)? pathSeg.y2 : prev.y + pathSeg.y2 : null;
		
		}
	
		if (type.match(/^[S]$/i)) {
	
			this.x1 = (prev.type.match(/^[CS]$/i))? prev.x + (prev.x - prev.x2) : prev.x; 
			this.y1 = (prev.type.match(/^[CS]$/i))? prev.y + (prev.y - prev.y2) : prev.y;
			
		} else if (type.match(/^[T]$/i)) {
			
			this.x1 = (prev.type.match(/^[QT]$/i))? prev.x + (prev.x - prev.x1) : prev.x; 
			this.y1 = (prev.type.match(/^[QT]$/i))? prev.y + (prev.y - prev.y1) : prev.y;
		
		}
			    
    };

	PathSeg.prototype.setX = function (x) {
	
		if (typeof this.pathSeg.x === "number") {
			
			var origX = this.pathSeg.x;
			this.pathSeg.x = x;
			this.init();
			
			//参照ノードに対して移動量を相殺する（選択したポイントのみ移動）
			for (var i = 0, iMax = this.referrer.length; i < iMax; i++) {
				
				var referrer = this.referrer[i];
				
				if (!referrer.isAbs && referrer.type.match(/^[Z]$/i) == null) {
					
					var delta = origX - x;
					
					if (typeof referrer.pathSeg.x === "number") {
						referrer.pathSeg.x += delta;
					}
					
					if (typeof referrer.pathSeg.x1 === "number") {
						referrer.pathSeg.x1 += delta;
					}
					
					if (typeof referrer.pathSeg.x2 === "number") {
						referrer.pathSeg.x2 += delta;
					}
					referrer.init();
					
				}
				
			}
			 
			
			
		}
	
	};
	
	PathSeg.prototype.setY = function (y) {
	
		if (typeof this.pathSeg.y === "number") {
			
			var origY = this.pathSeg.y;
			this.pathSeg.y = y;
			this.init();
			
			//参照ノードに対して移動量を相殺する（選択したポイントのみ移動）
			for (var i = 0, iMax = this.referrer.length; i < iMax; i++) {
				
				var referrer = this.referrer[i];
				
				if (!referrer.isAbs && referrer.type.match(/^[Z]$/i) == null) {
					
					var delta = origY - y;
					
					if (typeof referrer.pathSeg.y === "number") {
						referrer.pathSeg.y += delta;
					}
					
					if (typeof referrer.pathSeg.y1 === "number") {
						referrer.pathSeg.y1 += delta;
					}
					
					if (typeof referrer.pathSeg.y2 === "number") {
						referrer.pathSeg.y2 += delta;
					}
					referrer.init();
				}
							
			}
						
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
