// Where the magic happens.
(function(consapp, Calculator) {
	
	var cons = consapp.appendTo("calcapp");
	
	/**
	 * 
	 * @param {string} expr La string représentant le calcul a effectuer.
	 * @returns
	 */
	function calc(exprStr) {
		function parseExpression(exprStr) {
			var exprRegExp = /(.+)(\+|\-|\*|\/)(.+)/;
			var match = exprRegExp.exec(exprStr);
			if (match === null) {
				throw new Error("Expression non reconnue: " + exprStr);
			}

			match = match.map(function(exprPart) {
				return exprPart.trim();
			});
			
			var operand1 = match[1];
			var operator = match[2];
			var operand2 = match[3];
			
			return [operand1, operator, operand2];
		}
		
		function parseNum(str, index) {
			var num = parseFloat(str);
			if (isNaN(num)) {
				throw new Error("Arg " + (index+1) + " (" + str + ") n'est pas un nombre...");
			}
			else {
				return num;
			}
		}
		
		var res = "";
		var calculator = Calculator.createCalculator();
		try {
			var exprComponents = parseExpression(exprStr)
			var operand1 = parseNum(exprComponents[0]);
			var operand2 = parseNum(exprComponents[2]);
			var operator = exprComponents[1];
			res = calculator.calculate(operand1, operator, operand2)
		}
		catch(e) {
			res = e;
		}
	
		return "" + res;
	}
	
	cons.addInteractiveCommand("calci", function(api) {
		return calc(api.argsString());
	});

	cons.addCommand("calc", function(api) {
		return calc(api.argsString());
	});
})(webcons, calcapp.Calculator);
