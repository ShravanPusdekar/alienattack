function CInterface(iGoal){
    var _oAudioToggle;
    var _oButRestart;
    
    var _oHelpPanel=null;
    
    var _pStartPosAudio;
    var _pStartPosRestart;
    
    var _oScoreTextStroke;
    var _oScoreText;
    var _oScorePos          = {x: CANVAS_WIDTH/2-225, y: 60};
    
    this._init = function(iGoal){                
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width/2) - 10, y: (oSprite.height/2) + 10};
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);    
        }
        
        _oScoreTextStroke = new createjs.Text("SCORE: 0"," 40px "+FONT, "#410701");
        _oScoreTextStroke.x = _oScorePos.x+2;
        _oScoreTextStroke.y = _oScorePos.y+2;
        _oScoreTextStroke.textAlign = "left";
        _oScoreTextStroke.textBaseline = "alphabetic";
        _oScoreTextStroke.lineWidth = 400;     
        s_oStage.addChild(_oScoreTextStroke);
                
        _oScoreText = new createjs.Text("SCORE: 0"," 40px "+FONT, "#ffb400");
        _oScoreText.x = _oScorePos.x;
        _oScoreText.y = _oScorePos.y;
        _oScoreText.textAlign = "left";
        _oScoreText.textBaseline = "alphabetic";
        _oScoreText.lineWidth = 400;     
        s_oStage.addChild(_oScoreText);
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    };
    
    this.refreshScore = function(iScore, iGoal){
        _oScoreTextStroke.text = "SCORE: "+iScore;
        _oScoreText.text = "SCORE: "+iScore;
    }
    
    this.unload = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if(_oHelpPanel!==null){
            _oHelpPanel.unload();
        }
        s_oInterface = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX,iNewY + _pStartPosAudio.y);
        }        
        _oScoreTextStroke.y = _oScorePos.y+iNewY;
        _oScoreText.y = _oScorePos.y+iNewY;
    };

    this._onButHelpRelease = function(){
        _oHelpPanel = new CHelpPanel();
    };
    
    this.onExitFromHelp = function(){
        _oHelpPanel.unload();
    };
    
    this._onAudioToggle = function(){
        createjs.Sound.setMute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onRestart = function(){
        s_oGame.onRestart();  
    };
    
    s_oInterface = this;
    
    this._init(iGoal);
    
    return this;
}

var s_oInterface = null;