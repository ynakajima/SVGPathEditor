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
