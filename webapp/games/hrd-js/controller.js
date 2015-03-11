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
    sample : [ [ 2, 2, 1, 0, 'c' ], [ 1, 2, 0, 0, 'b' ], [ 1, 2, 0, 2, 'b' ], [ 1, 2, 3, 0, 'b' ],
            [ 1, 2, 3, 2, 'b' ], [ 2, 1, 1, 2, 'b' ], [ 1, 1, 0, 4, 'b' ], [ 1, 1, 1, 4, 'b' ],
            [ 1, 1, 2, 4, 'b' ], [ 1, 1, 3, 4, 'b' ] ],
    xOffset : null,
    yOffset : null,
    unitSize : null,
    allCubes : [],
    init : function() {
        var self = this, i, cube, allCubes = [], sample = this.get('sample'), unitSize = this
                .get('unitSize');
        var xOffset = this.get('xOffset'), yOffset = this.get('yOffset');
        for (i = 0; i < sample.length; ++i) {
            allCubes.push(createCube(sample[i]));
        }
        this.set('allCubes', allCubes);

        function createCube(cubeDefine) {
            var w = cubeDefine[0], h = cubeDefine[1], x = cubeDefine[2], y = cubeDefine[3];
            cube = Hrd.Cube.create({
                type : sample[i][4],
                widthUnit : w,
                heightUnit : h,
                width : w * unitSize,
                height : h * unitSize,
                left : x * (unitSize + 3) + xOffset,
                top : y * (unitSize + 1) + yOffset
            });
            var rect = cube.get('canvasObj');
            rect.on('modified', checkMoving);
            return cube;
        }
        function checkMoving(options) {
            var allCubes = self.get('allCubes'), i, rect;
            var isOverlap = false;
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
                self.get('canvas').renderAll();
            }else {
                this.originalState.left = this.left;
                this.originalState.top = this.top;
            }
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

        }
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