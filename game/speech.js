var BP = BP || {};

BP.SPEECH = BP.SPEECH || {};

BP.SPEECH.RECOG = (function() {

	//WebkitSpeechRecognition object
    var recognition;

   	if ('webkitSpeechRecognition' in window) {
    	recognition = new webkitSpeechRecognition();
    }

    return {
    	getSRObject: function() {
    		return recognition;
    	}
    }

	
})();

BP.SPEECH.DEFAULT = (function(recognition) {

	var getLog = function(msg) {
		return function() {
			console.log(msg);
		}
	}

	if (!recognition) {
		return recognition;
	}

	recognition.onerror = getLog('error');
	recognition.onstart = getLog('start');
	recognition.onend = getLog('end');
	recognition.onspeechstart = getLog('speech start');
	recognition.onspeechend = getLog('speech end');
	recognition.onresult = getLog('result');

	recognition.lang = 'hu_HU';
	recognition.continuous = true;
    recognition.interimResults = false;

    return recognition;
	
})(BP.SPEECH.RECOG.getSRObject());

BP.SPEECH.HTML = (function(info){
	var  showInfo = function(s) {
		if (s) {
			for (var child = info.firstChild; child; child = child.nextSibling) {
				if (child.style) {
					child.style.display = child.id == s ? 'inline' : 'none';
				}
			}
			info.style.visibility = 'visible';
		} else {
			info.style.visibility = 'hidden';
		}
	}

	return { showInfo : showInfo };
	
})(info);

BP.SPEECH.GAME = (function(score, expression) {
	// the good result of the expression
	// user must say it
	var expressionResult;
	var scoreValue = 0;

	function updateScore(addScore) {
	    scoreValue += addScore;
	    score.innerHTML = scoreValue;
	}

	function newTurn() {
	    setExpression();
	}

	function getRandomValue() {
	    return Math.floor((Math.random() * 10) + 1);
	}

	function setExpression() {
	    var a = getRandomValue();
	    var b = getRandomValue();
	    expressionResult = a * b;
	    expression.innerHTML = a + ' * ' + b;
	}

	function getExpressionResult() {
		return expressionResult;
	}

	return {
		newTurn : newTurn,
		updateScore : updateScore,
		getExpressionResult: getExpressionResult
	}

})(score, expression);

BP.SPEECH.SETUP = (function(recognition, game, html) {

    if (!recognition) {
    	return recognition;
    }

    var errorHandler = function(event) {
        if (event.error == 'no-speech') {
          html.showInfo('info_no_speech');
        }
        if (event.error == 'audio-capture') {
          html.showInfo('info_no_microphone');
        }
        if (event.error == 'not-allowed') {
          //if (event.timeStamp - start_timestamp < 100) {
            html.showInfo('info_blocked');
          //} else {
          //  html.showInfo('info_denied');
          //}
        }
    }

    var resultHandler = function(event) {
        console.log('result');
        var interim_transcript = '';
        if (typeof(event.results) == 'undefined') {
          recognition.onend = null;
          recognition.stop();
          html.showInfo('info_upgrade');
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            var transcript = event.results[i][0].transcript;
            var sure = event.results[i].isFinal;
            console.log(sure, transcript, game.getExpressionResult());

            var point = 0;

            if (transcript == game.getExpressionResult()) {
                point = 1;
            }
            else {
                if (sure) {
                    point = -1;
                }
            }
            if (point !== 0) {
                game.updateScore(point);
            }

            if (sure) {
                setTimeout(game.newTurn,100);
            }

        }

    };

    recognition.onresult = resultHandler;
    recognition.onerror = errorHandler;

    return recognition;

})(BP.SPEECH.DEFAULT, BP.SPEECH.GAME, BP.SPEECH.HTML);

