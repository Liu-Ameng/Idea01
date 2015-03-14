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
            hasRotatingPoint : false,
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

Hrd.View = Ember.Object.extend({
    allCubes : {
        // name [width, height, left, top]
        'c' : [ 2, 2, 1, 0, 'c' ],
        'b1' : [ 1, 2, 0, 0, 'b1' ],
        'b2' : [ 1, 2, 0, 2, 'b2' ],
        'b3' : [ 1, 2, 3, 0, 'b3' ],
        'b4' : [ 1, 2, 3, 2, 'b4' ],
        'd' : [ 2, 1, 1, 2, 'd' ],
        'e1' : [ 1, 1, 0, 4, 'e1' ],
        'e2' : [ 1, 1, 1, 4, 'e2' ],
        'e3' : [ 1, 1, 2, 4, 'e3' ],
        'e4' : [ 1, 1, 3, 4, 'e4' ]
    },
    xOffset : 10,
    yOffset : 5,
    unitSize : 20,
    boardGrid : [ [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ] ],
    init : function() {
        var self = this, cubeId, allCubes, unitSize, xOffset, yOffset, stage;
        allCubes = self.allCubes;
        unitSize = self.unitSize;
        xOffset = self.xOffset;
        yOffset = self.yOffset;
        stage = self.stage;

        for (cubeId in allCubes) {
            allCubes[cubeId][4] = __createCube(cubeId, allCubes[cubeId]);
        }
        self.allCubes = allCubes;

        function __createCube(name, cubeDefine) {
            var w, h, x, y, rect;
            w = cubeDefine[0] * unitSize;
            h = cubeDefine[1] * unitSize;
            x = 0;// cubeDefine[2] * (unitSize + 2) + xOffset;
            y = 0; // cubeDefine[3] * (unitSize + 2) + yOffset;
            rect = new createjs.Shape();

            rect.graphics.beginFill('DeepSkyBlue').drawRoundRect(x, y, w, h, 2);
            rect.name = name;
            rect.on('mousedown', function(evt) {
                evt.target.mouseOffsetX = evt.stageX - evt.target.x;
                evt.target.mouseOffsetY = evt.stageY - evt.target.y;
                evt.target.mouseDownX = evt.stageX;
                evt.target.mouseDownY = evt.stageY;
            });
            rect.on('pressup', function(evt) {
                var xUnit, yUnit, cubeId, targetCube, fakeCube;
                xUnit = ____moveOne((evt.stageX - evt.target.mouseDownX) / (self.unitSize + 1));
                yUnit = ____moveOne((evt.stageY - evt.target.mouseDownY) / (self.unitSize + 1));

                targetCube = self.allCubes[evt.target.name];
                fakeCube = ____makeFakeCube(targetCube, xUnit, yUnit);

                targetCube[2] += xUnit;
                targetCube[3] += yUnit;

                if (__isCubeDefineOutRange(fakeCube)
                        || __isFakeCubeOverlap(evt.target.name, fakeCube)) {
                    targetCube[2] -= xUnit;
                    targetCube[3] -= yUnit;
                }
                self.paint();

                function ____moveOne(length) {
                    return Math.round(length);
                }

                function ____makeFakeCube(targetCube, xUnit, yUnit) {
                    var fakeCube = [ targetCube[0], targetCube[1], targetCube[2], targetCube[3] ];
                    if (xUnit > 0) {
                        fakeCube[0] += xUnit;
                    } else {
                        fakeCube[0] -= xUnit;
                        fakeCube[2] += xUnit;
                    }
                    if (yUnit > 0) {
                        fakeCube[1] += yUnit;
                    } else {
                        fakeCube[1] -= yUnit;
                        fakeCube[3] += yUnit;
                    }
                    return fakeCube;
                }
            });
            rect.on('pressmove', function(evt) {
                evt.target.x = evt.stageX - evt.target.mouseOffsetX;
                evt.target.y = evt.stageY - evt.target.mouseOffsetY;
                stage.update();
            });

            stage.addChild(rect);
            return rect;
        }

        function __isOverlap(targetCubeId) {
            return __isFakeCubeOverlap(targetCubeId, self.allCubes[targetCubeId]);
        }

        function __isFakeCubeOverlap(targetCubeId, fakeCubeDef) {
            var cubeId, allCubes, left, right, top, bottom;
            var allCubes = self.allCubes;
            for (cubeId in allCubes) {
                if (cubeId !== targetCubeId) {
                    if (__isCubeDefineOverlap(fakeCubeDef, allCubes[cubeId])) {
                        return true;
                    }
                }
            }
            return false;
        }

        function __isCubeDefineOverlap(cube1, cube2) {
            var cubeId, left, right, top, bottom;
            left = Math.max(cube1[2], cube2[2]);
            right = Math.min(cube1[2] + cube1[0], cube2[2] + cube2[0]);
            top = Math.max(cube1[3], cube2[3]);
            bottom = Math.min(cube1[3] + cube1[1], cube2[3] + cube2[1]);
            if (left >= right || top >= bottom) {
                return false;
            }
            return true;
        }

        function __isCubeDefineOutRange(cubeDefine) {
            if (cubeDefine[2] < 0 || cubeDefine[3] < 0) {
                return true;
            }
            if (cubeDefine[2] + cubeDefine[0] > 4 || cubeDefine[3] + cubeDefine[1] > 5) {
                return true;
            }
            return false;
        }
    },

    paint : function(self) {
        if (self === undefined) {
            self = this;
        }
        var cubeId, allCubes, unitSize, xOffset, yOffset, cubeDefine;
        allCubes = self.allCubes;
        unitSize = self.unitSize;
        xOffset = self.xOffset;
        yOffset = self.yOffset;
        for (cubeId in allCubes) {
            cubeDefine = allCubes[cubeId];
            cubeDefine[4].x = cubeDefine[2] * (unitSize + 1) + xOffset;
            cubeDefine[4].y = cubeDefine[3] * (unitSize + 1) + yOffset;
        }
        self.stage.update();
        self.isWin();
    },
    isWin : function() {
        var cube = this.allCubes.c;
        if (cube[2] === 1 && cube[3] === 3) {
            alert("WIN!");
        }
    },
    paintBoarder : function() {
        var unitSize, xOffset, yOffset, line, stage;
        stage = this.stage;
        xOffset = this.xOffset;
        yOffset = this.yOffset;
        unitSize = this.unitSize;
        line = new createjs.Shape();
        line.graphics.moveTo(xOffset, yOffset - 30).setStrokeStyle(1).beginStroke("#00ff00")
                .lineTo(xOffset - 3, yOffset - 3 + (unitSize + 1) * 5);
        this.stage.addChild(line);
        //this.stage.update();
    }
});

Hrd.Game = Ember.Object.extend({
    unitSize : 20,
    stage : {},
    view : null,
    init : function() {
        var self = this, stage = this.stage, unitSize;
        var minLength = Math.min(this.get('gameWidth'), this.get('gameHeight')) - 60;
        var unitSize = Math.floor(Math.min(minLength / 4, 100));
        var xOffset = Math.floor((this.get('gameWidth') - 4 * (unitSize + 2)) / 2);
        var yOffset = Math.floor((this.get('gameHeight') - 5 * (unitSize + 2)) / 2);
        createjs.Touch.enable(stage);

        self.view = Hrd.View.create({
            stage : stage,
            unitSize : unitSize,
            xOffset : xOffset,
            yOffset : yOffset
        })

        /*
         * board = Hrd.Board.create({ xOffset : xOffset, yOffset : yOffset,
         * unitSize : unitSize, canvas : this.get('canvas') });
         * 
         * this.set('unitSize', unitSize); this.set('board', board);
         */
    },

    run : function() {
        //this.view.paintBoarder();
        this.view.paint();
    }
});

// Events
$(document).ready(function() {
    // initEveryThing();

    var canvas = document.getElementById('game-canvas');
    $('.main-canvas').attr({
        width : $(window).width() * 0.9,
        height : $(window).height() - 300
    });
    canvas.width = $('.main-canvas').width();
    canvas.height = $('.main-canvas').height();

    var game = Hrd.Game.create({
        gameWidth : canvas.width,
        gameHeight : canvas.height,
        stage : new createjs.Stage('game-canvas')
    });
    game.run();
});