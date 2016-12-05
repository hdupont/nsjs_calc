// Where the magic happens.
(function(consapp, Calculator) {
	
	var cons = consapp.appendTo("calcapp");
	cons.addCommand("calc", function(args, api) {
		
		function parseExpression(exprStr) {
			var exprRegExp = /(.+)(\+|\-|\*|\/)(.+)/;
			var match = exprRegExp.exec(exprStr);
			if (match === null) {
				throw new Error("Expression non reconnue: " + exprRegExp);
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
				throw new Error("arg " + (index+1) + ": " + str + " n'est pas un nombre...");
			}
			else {
				return num;
			}
		}
		
		var res = "";
		var exprStr = api.cmdArgsToString();
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
	});
})(consapp, calcapp.Calculator);
