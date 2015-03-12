Hrd.Cube = Ember.Object.extend({
    width : null,
    height : null,
    widthUnit : null,
    heightUnit : null,
    top : null,
    left : null,
    canvasObj : null,
    type : 'o',
    name : null,
    init : function() {
        var widthUnit = this.get('widthUnit'), heightUnit = this.get('heightUnit'), width = this
                .get('width'), height = this.get('height'), top = this.get('top'), left = this
                .get('left');
        var rect = new fabric.Rect({
            left : left,
            top : top,
            fill : mapSizeToColor(widthUnit, heightUnit),
            width : width,
            height : height,
            strokeWidth : 2,
            stroke : mapSizeToBorderColor(widthUnit, heightUnit),
            hasControls : false,
            hasRotatingPoint: false,
            lockScalingX : true,
            lockScalingY : true,
            lockRotation : true
        });
        this.set('canvasObj', rect);

        function mapSizeToColor(w, h) {
            if (w === 1 && h === 1) {
                return '#FF0000';
            } else if (w === 1 && h === 2) {
                return '#00FF00';
            } else if (w === 2 && h === 1) {
                return '#0000FF';
            } else if (w === 2 && h === 2) {
                return '#00FFFF'
            }
        }
        function mapSizeToBorderColor(w, h) {
            if (w === 1 && h === 1) {
                return '#880000';
            } else if (w === 1 && h === 2) {
                return '#008800';
            } else if (w === 2 && h === 1) {
                return '#000088';
            } else if (w === 2 && h === 2) {
                return '#008888';
            }
        }
    }
});

Hrd.Board = Ember.Object.extend({
    sample : [ [ 2, 2, 1, 0, 'c' ], [ 1, 2, 0, 0, 'b1' ], [ 1, 2, 0, 2, 'b2' ], [ 1, 2, 3, 0, 'b3' ],
            [ 1, 2, 3, 2, 'b4' ], [ 2, 1, 1, 2, 'd' ], [ 1, 1, 0, 4, 'e1' ], [ 1, 1, 1, 4, 'e2' ],
            [ 1, 1, 2, 4, 'e3' ], [ 1, 1, 3, 4, 'e4' ] ],
    xOffset : null,
    yOffset : null,
    unitSize : null,
    allCubes : [],
    boardGrid : [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
    init : function() {
        var self = this, i, cube,
        	allCubes = [],
        	sample = this.get('sample'),
        	unitSize = this.get('unitSize'),
        	canvas = this.get('canvas');
        var xOffset = this.get('xOffset'), yOffset = this.get('yOffset');

        for (i = 0; i < sample.length; ++i) {
            allCubes.push(__createCube(sample[i]));
            __setBoardGrid(sample[i]);
        }
        this.set('allCubes', allCubes);

        function __createCube(cubeDefine) {
            var w = cubeDefine[0], h = cubeDefine[1], x = cubeDefine[2], y = cubeDefine[3];
            cube = Hrd.Cube.create({
                type : sample[i][4],
                widthUnit : w,
                heightUnit : h,
                width : w * unitSize,
                height : h * unitSize,
                left : x * (unitSize + 2) + xOffset,
                top : y * (unitSize + 2) + yOffset
            });
            var rect = cube.get('canvasObj');
            rect.on('modified', checkMoving);
            return cube;
        }
        function checkMoving(options) {
            var allCubes = self.get('allCubes'), i, rect;
            var isOverlap = false;
            __moveRectByUnit(this);
            for (i = 0; i < allCubes.length; ++i) {
                rect = allCubes[i].get('canvasObj');
                if (__isSameRect(this, rect) === false && __isOverlap(this, rect)) {
                    isOverlap = true;
                }
            }
            if (isOverlap) {
                this.set({
                    left :this.originalState.left,
                    top  :this.originalState.top
                });
            }else {
                var origin = this.originalState;
                origin.left = this.left;
                origin.top = this.top;
                this.set({originalState: origin});
            }
            canvas.renderAll();
            // console.debug(this);

            function __isOverlap(r1, r2) {
                var left = Math.max(r1.left, r2.left);
                var right = Math.min(r1.left + r1.width, r2.left + r2.width);
                var top = Math.max(r1.top, r2.top);
                var bottom = Math.min(r1.top + r1.height, r2.top + r2.height);
                if (left > right || top > bottom) {
                    return false;
                }
                return true;
            }
            function __isSameRect(r1, r2) {
                if (r1.left === r2.left && r1.top === r2.top && r1.width === r2.width
                        && r1.height === r2.height) {
                    return true;
                }
                return false;
            }
            function __moveRectByUnit(rect) {
            	var unitSize = self.get('unitSize')+2;
            	var left = Math.round( (rect.left-rect.originalState.left)/unitSize );
            	var top = Math.round( (rect.top-rect.originalState.top)/unitSize );
            	rect.set({
            		left: rect.left + unitSize*left,
            		top: rect.top + unitSize * top
            	})
                canvas.renderAll();
            }
        }

        function __setBoardGrid(cubeDefine) {
			var boardGrid = self.get('boardGrid');
			var i, j,
				w = cubeDefine[0],
				h=cubeDefine[1],
				left = cubeDefine[2],
				top = cubeDefine[3];
			for(i=0;i<w;++i){
				for(j=0;j<h;++j){
					boardGrid[j+top][i+left] = cubeDefine[4];
				}
			}
			self.set('boardGrid', boardGrid);
        }
    },

    paint : function() {

    }
});

Hrd.Game = Ember.Object
        .extend({
            // canvasEl : $('#game-canvas'),
            // ctx : {},
            unitSize : 20,
            canvas : {},
            board : null,
            init : function() {
                var minLength = Math.min(this.get('gameWidth'), this.get('gameHeight')) - 60, unitSize, board;
                unitSize = Math.min(Math.floor(minLength / 4), 100);
                var xOffset = (this.get('gameWidth') - 4*(unitSize+2))/2;
                var yOffset = (this.get('gameHeight') - 5*(unitSize+2))/2;
                board = Hrd.Board.create({
                    xOffset : xOffset,
                    yOffset : yOffset,
                    unitSize : unitSize,
                    canvas : this.get('canvas')
                });

                this.set('unitSize', unitSize);
                this.set('board', board);
            },

            paint : function() {
                /*
                 * fabric.Image.fromURL('../img/5.png', function(oImg) {
                 * canvas.add(oImg); });
                 */
            }.property(),

            run : function() {
                console.debug(this.get('unitSize'));
                var canvas = this.get('canvas'), allCubes = this.get('board').get('allCubes');
                var i, rect;
                for (var i = 0; i < allCubes.length; ++i) {
                    rect = allCubes[i].get('canvasObj');
                    canvas.add(rect);
                }
            }
        });

// Events
$(document).ready(function() {
    // initEveryThing();

    var canvas = document.getElementById('game-canvas');
    $('.main-canvas').attr({
        width : $(window).width() * 0.90,
        height : $(window).height() - 200
    });
    canvas.width = $('.main-canvas').width();
    canvas.height = $('.main-canvas').height();

    var game = Hrd.Game.create({
        gameWidth : canvas.width,
        gameHeight : canvas.height,
        canvas : new fabric.Canvas('game-canvas', {
            selection: false
        })
    });
    game.run();
});