Hrd.Cube =
        Ember.Object
                .extend({
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
                        var widthUnit = this.get('widthUnit'), heightUnit = this.get('heightUnit'), width =
                                this.get('width'), height = this.get('height'), top =
                                this.get('top'), left = this.get('left');
                        var rect = new fabric.Rect({
                            left : left,
                            top : top,
                            fill : mapSizeToColor(widthUnit, heightUnit),
                            width : width,
                            height : height,
                            strokeWidth : 2,
                            stroke : mapSizeToBorderColor(widthUnit, heightUnit),
                            hasControls : false,
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

Hrd.Board =
        Ember.Object.extend({
            sample : [ [ 2, 2, 1, 0, 'c' ], [ 1, 2, 0, 0, 'b' ], [ 1, 2, 0, 2, 'b' ],
                    [ 1, 2, 3, 0, 'b' ], [ 1, 2, 3, 2, 'b' ], [ 2, 1, 1, 2, 'b' ],
                    [ 1, 1, 0, 4, 'b' ], [ 1, 1, 1, 4, 'b' ], [ 1, 1, 2, 4, 'b' ],
                    [ 1, 1, 3, 4, 'b' ] ],
            xOffset : null,
            yOffset : null,
            unitSize : null,
            allCubes : [],
            init : function() {
                var i, cube, w, h, x, y, allCubes = [], sample = this.get('sample'), unitSize =
                        this.get('unitSize');
                var xOffset = this.get('xOffset'), yOffset = this.get('yOffset');
                for (i = 0; i < sample.length; ++i) {
                    w = sample[i][0];
                    h = sample[i][1];
                    x = sample[i][2];
                    y = sample[i][3];
                    cube = Hrd.Cube.create({
                        type : sample[i][4],
                        widthUnit : w,
                        heightUnit : h,
                        width : w * unitSize,
                        height : h * unitSize,
                        left : x * unitSize + xOffset,
                        top : y * unitSize + yOffset
                    });
                    allCubes.push(cube);
                }
                this.set('allCubes', allCubes);
            }
        });

Hrd.Game =
        Ember.Object
                .extend({
                    // canvasEl : $('#game-canvas'),
                    // ctx : {},
                    unitSize : 20,
                    canvas : {},
                    board : null,
                    init : function() {
                        var minLength =
                                Math.min(this.get('gameWidth'), this.get('gameHeight')) - 20, unitSize, board;
                        unitSize = Math.min( Math.floor(minLength / 4), 100);
                        board = Hrd.Board.create({
                            xOffset : 10,
                            yOffset : 10,
                            unitSize : unitSize
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
                        var canvas = this.get('canvas'), allCubes =
                                this.get('board').get('allCubes');
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
        canvas : new fabric.Canvas('game-canvas')
    });
    game.run();
});