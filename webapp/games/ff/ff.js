window.FF = Ember.Application.create();
// Events
$(document).ready(function() {
    // initEveryThing();
    var game, canvas, canvasId;
    canvasId = 'game-canvas';
    canvas = document.getElementById(canvasId);
    $('.main-canvas').css({
        width : $(window).width() * 0.9,
        height : $(window).height() - 200
    });
    canvas.width = $('.main-canvas').width();
    canvas.height = $('.main-canvas').height();

    console.debug('haha ff');

    game = FF.Game.create({
        gameWidth: canvas.width,
        gameHeight: canvas.height,
        stage: new createjs.Stage(canvasId)
    });
    game.run();
});

FF.Game = Ember.Object.extend({
    unitSize : 20,
    stage : {},
    view : null,
    init : function() {
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.setFPS(30);
        
        var self = this, stage = this.stage, unitSize;
        var minLength = Math.min(this.get('gameWidth'), this.get('gameHeight'));
        var unitSize = Math.floor(Math.min(minLength / 4, 100));
        var xOffset = Math.floor((this.get('gameWidth') - 4 * (unitSize + 2)) / 2);
        var yOffset = Math.floor((this.get('gameHeight') - 5 * (unitSize + 2)) / 2) - 30;
        createjs.Touch.enable(stage);

        self.view = Hrd.View.create({
            stage : stage,
            unitSize : unitSize,
            xOffset : xOffset,
            yOffset : yOffset
        })
    },

    run : function() {
        // this.view.paintBoarder();
        this.view.paint();
    }
});

