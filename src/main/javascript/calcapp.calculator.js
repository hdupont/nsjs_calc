// ----------------
// class Calculator
// ----------------
// Un Calculator permet d'effectuer des calculs avec les 4 opérations de bases.
calcapp.Calculator = (function() {
	
	function Calculator() {
		// Rien... pour l'instant.
	}
	Calculator.prototype.calculate = function(operand1, operator, operand2) {
		switch (operator) {
			case "+":
				res = operand1 + operand2;
				break;
			case "-":
				res = operand1 - operand2;
				break;
			case "*":
				res = operand1 * operand2;
				break;
			case "/":
				if (operand2 === 0) {
					throw new Error("La division par zéro n'est pas définie...");
				}
				else {
					res = operand1 / operand2;
				}
				break;
			default:
				throw new Error(operator + " est un opérateur inconnu...");
		}
		
		return res;
	}
		
	return {
		createCalculator: function() {
			return new Calculator();
		}
	};
})();