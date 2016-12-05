// Code dont le but est de proposer à l'utilisateur un simulacre de console
// dans son navigateur web.

// Namespace de l'application.
var consapp = {};

// Module contenant les utilitaires
consapp.utils = {};

// Utilitaire de gestion du clavier.
consapp.utils.keyboard = (function() {
	return {
		isAlpha: function(code) {
			return (65 <= code && code <= 90)   // Majuscule.
				|| (97 <= code && code <= 122); // Minuscule.
		},
		isSpace: function(code) {
			return code === 32;
		},
		isEnter: function(code) {
			return code === 13;
		},
		isArrowLeft: function(code) {
			return code === 37;
		},
		isArrowRight: function(code) {
			return code === 39;
		},
		isBackspace: function(code) {
			return code === 8;
		},
		isEnd: function(code) {
			return code === 35;
		},
		isHome: function(code) {
			return code === 36;
		}
	};
})();

// ---------------
// class Character
// ---------------
// Un Character est un caractère d'une ligne de la console.
consapp.Character = (function() {
	
	// public
	// ------
	
	function Character(character) {
		this._character = character;
		this._isEol = false;
	}
	Character.prototype.getChar = function() {
		return this._character ? this._character: "";
	};
	Character.createChar = function(character) {
		var c = new Character(character);
		return c;
	}
	Character.createEolChar = function() {
		var eol = new Character(); // un espace
		eol._isEol = true;
		return eol;
	}
	
	return Character;	
})();

// -----------------
// class LineDomView
// -----------------
// Une LineDomView une ligne de la console telle qu'elle est vue par l'utilisateur.
consapp.LineDomView = (function() {
	
	// public
	// ------
	
	function LineDomView(domElt) {
		this._domContainer = domElt;
	}

	LineDomView.createDomView = function(domElt) {
		return new LineDomView(domElt);
	};
	LineDomView.createDomViewWithPromt = function(domElt, prompt) {
		var domView = new LineDomView(domElt);
		this._charToPrepend = prompt;
		return domView;
	};
	LineDomView.prototype.updateLine = function(consLine) {
		var chars = consLine._chars;
		var cursorIndex = consLine._cursorIndex;
		
		this._domContainer.innerHTML = consLine._stringToPrepend ? consLine._stringToPrepend : "";
		
		var self = this;
		chars.forEach(function(consChar, index) {
			var c = consChar.getChar();
			if (c === "" || c === " ") {
				c = "&nbsp";
			}
			domElt = buildCharDomElt(self, c, index === cursorIndex && consLine._stringToPrepend);
			self._domContainer.appendChild(domElt);
		});
		this._domContainer.scrollIntoView();
		
	};
	LineDomView.prototype.removeCursor = function(cursorPosition) {
		this._domContainer.children[cursorPosition].style.backgroundColor = "";
	};
	LineDomView.prototype.outputContent = function(content) {
		this._domContainer.innerHTML = content;
	};
	
	// private
	// -------
	
	function buildCharDomElt(that, character, isUnderCursor) {
		var charElt = document.createElement("span");
		charElt.innerHTML = character;
		
		if (isUnderCursor) {
			charElt.style.backgroundColor = "yellow";
		}
		
		return charElt;
	}
	
	return LineDomView;
})();

// -----------------
// class ConsoleLine
// -----------------
// Une ConsoleLine est une ligne de la console.
consapp.ConsoleLine = (function(Character, LineDomView) {
	
	// public
	// ------
	
	function ConsoleLine(stringToPrepend) {
		var eol = Character.createEolChar();
		
		this._chars = [eol];
		this._cursorIndex = 0; // Pointe sur eol.
		this._stringToPrepend = stringToPrepend ? stringToPrepend : "";
		this._domView = null;
	}
	
	ConsoleLine.prototype.setDomContainer = function(domContainer) {
		this._domView = LineDomView.createDomView(domContainer);
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.addChar = function(character) {
		this._chars.splice(this._cursorIndex, 0, Character.createChar(character));
		this._cursorIndex++;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.read = function() {
		this._domView.removeCursor(this._cursorIndex);
		return this._chars.map(function(consChar) {
			return consChar.getChar();
		}).join("");
	};
	ConsoleLine.prototype.output = function(content) {
		clearChars(this);
		for (var i = 0; i < content.length; i++) {
			this.addChar(content[i]);
		}
	};
	ConsoleLine.prototype.moveCursorLeft = function() {
		if (this._cursorIndex === 0) {
			return;
		}
		this._cursorIndex--;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.moveCursorRight = function() {
		if (this._cursorIndex === this._chars.length - 1) {
			return;
		}
		this._cursorIndex++;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.removeChar = function() {
		if (this._cursorIndex === 0) {
			return;
		}
		this._chars.splice(this._cursorIndex - 1, 1);
		this._cursorIndex--;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.moveCursorToEnd = function() {
		this._cursorIndex = this._chars.length - 1;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.moveCursorToBeginning = function() {
		this._cursorIndex = 0;
		this._domView.updateLine(this);
	};
	ConsoleLine.prototype.onCursorUpdate = function(character) {
		// TODO
		// plutot que d'appeller directement la vue dans addChar,
		// on l'inscrit ici à l'événement addChar
	};
	
	// private
	// -------
	
	function clearChars(self) {
		while(self.length > 1) {
			self._chars.shift();
		}
	}
	
	return ConsoleLine;	
})(consapp.Character, consapp.LineDomView);

consapp.Command = (function() {
	
	function Command(name, handler) {
		this._name = name;
		this._handler = handler;
		this._args = null;
		this._inputString = null;
	}
	Command.createCommand = function(name, handler) {
		return new Command(name, handler);
	}
	Command.prototype.getName = function() {
		return this._name;
	};
	Command.prototype.execute = function() {
		return this._handler(this._args, createApi(this));
	};
	Command.prototype.setArgs = function(args) {
		return this._args = args;
	};
	Command.prototype.setInputString = function(inputString) {
		this._inputString = inputString;
	};
	
	function createApi(self) {
		return {
			/**
			 *  Retourne ce qui suit le nom de la commande sous forme de string,
			 *  en supprimant les espaces au début et à la fin.
			 *  Par exemple, pour la commande cmd suivante
			 *  > cmd    ab c d   
			 *  getStringParam retournera "ab c d"
			 */
			cmdArgsToString: function() {
				return self._inputString.substring(self._name.length).trim();
			}
		}
	}
	
	function lineWithoutCmdName() {
		return 
	}
	
	return Command;
})();

consapp.Commands = (function(Command) {
	
	function Commands() {
		this._commands = [];
	}
	Commands.createCommands = function() {
		return new Commands();
	};
	Commands.prototype.add = function(name, handler) {
		this._commands.push(Command.createCommand(name, handler));
	};
	Commands.prototype.get = function(name) {
		var res = null;
		for (var i = 0; i < this._commands.length; i++) {
			var currentCommand = this._commands[i];
			if (currentCommand.getName() === name) {
				res = currentCommand;
				break;
			}
		}
		return res;
	};
	
	return Commands;
})(consapp.Command);

consapp.InputLine = (function() {
	
	// public
	// ------
	
	function InputLine(line) {
		this._line = line;
	}
	InputLine.createInputLine = function(line) {
		return new InputLine(line);
	};
	InputLine.prototype.getCommandName = function() {
		return this._line.split(" ")[0];
	};
	InputLine.prototype.parseArgs = function() {
		return this._line.split(" ").map(function(x) {
			return x.trim();
		});
	};
	InputLine.prototype.getInputString = function() {
		return this._line;
	};
	
	return InputLine;
})();

// --------------
// class Console
// --------------
// Une Console est un simulacre de console.
consapp.Console = (function(ConsoleLine, keyboard, InputLine, Commands) {
	
	// public
	// ------

	function Console() {
		this._domElt = null; // Un singleton.
		this._commands = Commands.createCommands();
		this._promptLine = null;
	}
	
	Console.prototype.getDomElt = function() {
		if (this._domElt !== null) {
			return this._domElt;
		}
		
		// On créer l'élément dom de la console
		this._domElt = buildJConsoleDomElt(this);
		
		// On lui ajoute une ligne
		addPromptLine(this);
		
		addKeyboadListener(this);
		
		return this._domElt;
	};
	Console.prototype.moveCursorLeft = function() {
		this._promptLine.moveLeft();
	};
	Console.prototype.moveCursorRight = function() {
		this._promptLine.moveRight();
	};
	Console.prototype.deleteCharFromLine = function() {
		this._promptLine.deleteChar();
	};
	
	Console.prototype.addCommand = function(name, handler) {
		this._commands.add(name, handler);
	};
	
	// private
	// -------
	
	function processLine(self) {
		var line = self._promptLine.read();
		var inputLine = InputLine.createInputLine(line);
		var commandName = inputLine.getCommandName();
		var command = self._commands.get(commandName);
		var output = "";
		if (command === null) {
			output = commandName + "... WTF?!"
		}
		else {
			command.setArgs(inputLine.parseArgs());
			command.setInputString(inputLine.getInputString());
			output = command.execute();
		}
		outputLine(self, output);
		
		addPromptLine(self);
	}
	function outputLine(self, content) {
		var line = addLine(self);
		line.output(content);
	}
	function addPromptLine(that) {
		return addLine(that, "> ");
	}
	function addLine(self, prompt) {
		var line = new ConsoleLine(prompt ? prompt : "");
		if (prompt) {
			self._promptLine = line
		}
		var lineDomElt = document.createElement("div");
		line.setDomContainer(lineDomElt);
		
		self._domElt.appendChild(lineDomElt);
		
		return line;
	}
	function buildJConsoleDomElt(that) {
		var outputElt = document.createElement("div");
		outputElt.setAttribute("id", "consapp");
		
		// Pour écouter les keypress, le div doit d’abord pouvoir recevoir le focus
		outputElt.tabIndex = "1";  // Permet au div de pouvoir recevoir le focus
		
		outputElt.style.fontFamily = "courier";
		outputElt.style.backgroundColor = "lightgrey";
		outputElt.style.width = "100%";
		outputElt.style.height = "20em";
		outputElt.style.overflow = "scroll";
		
		return outputElt;
	}
	function parse(line) {
		return line.split(" ");
	}
	function addKeyboadListener(that) {
		that._domElt.addEventListener("keydown", function(event) {
			if (keyboard.isAlpha(event.keyCode) || keyboard.isSpace(event.keyCode)) {
				that._promptLine.addChar(event.key);
			}
			else if (keyboard.isEnter(event.keyCode)) {
				processLine(that);
			}
			else if (keyboard.isArrowLeft(event.keyCode)) {
				that._promptLine.moveCursorLeft();
			}
			else if (keyboard.isArrowRight(event.keyCode)) {
				that._promptLine.moveCursorRight();
			}
			else if (keyboard.isBackspace(event.keyCode)) {
				that._promptLine.removeChar();
			}
			else if (keyboard.isEnd(event.keyCode)) {
				that._promptLine.moveCursorToEnd();
			}
			else if (keyboard.isHome(event.keyCode)) {
				that._promptLine.moveCursorToBeginning();
			}
		});
	}
	
	return Console;
})(consapp.ConsoleLine, consapp.utils.keyboard, consapp.InputLine, consapp.Commands);

// API
consapp = (function(Console) {
	return {
		/**
		 * Ajoute une console dans l'élément dont l'ID est passé en paramètre.
		 * @returns {JConsole} La console qui vient d'être ajoutée au DOM.
		 */
		appendTo: function(id) {
			var container = document.getElementById(id);
			
			var jcons = new Console();
			jconsDomElt = jcons.getDomElt();
			container.appendChild(jconsDomElt);
			jconsDomElt.focus();
			
			jcons.addCommand("args", function(args) {
				var argsStr = "";
				for (var i = 1; i < args.length; i++) {
					argsStr += args[i] + " ";
				}
				
				return argsStr;
			});
			
			return jcons;
		}
	}
})(consapp.Console);
