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

