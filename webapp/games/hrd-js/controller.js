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
    allCubes_backup : {},
    xOffset : 10,
    yOffset : 5,
    unitSize : 20,

    moveLog : [],

    undoButton : {},
    restartButton : {},
    borders : [],

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
        self.allCubes_backup = self.allCubes;
        __createButton();
        __createBorder();

        function __createCube(name, cubeDefine) {
            var w, h, x, y, rect, moveLog;
            moveLog = self.moveLog;
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
                var xUnit, yUnit, cubeId, targetCube, fakeCube, xMove, yMove;

                xMove = evt.stageX - evt.target.mouseDownX;
                yMove = evt.stageY - evt.target.mouseDownY;
                if (Math.abs(xMove) >= Math.abs(yMove)) {
                    xUnit = ____moveOne(xMove / (self.unitSize + 1));
                    yUnit = 0;
                } else {
                    xUnit = 0;
                    yUnit = ____moveOne(yMove / (self.unitSize + 1));
                }

                targetCube = self.allCubes[evt.target.name];
                fakeCube = ____makeFakeCube(targetCube, xUnit, yUnit);

                targetCube[2] += xUnit;
                targetCube[3] += yUnit;

                if (__isCubeDefineOutRange(fakeCube)
                        || __isFakeCubeOverlap(evt.target.name, fakeCube)) {
                    targetCube[2] -= xUnit;
                    targetCube[3] -= yUnit;
                } else {
                    moveLog.push([ evt.target.name, xUnit, yUnit ]);
                }
                self.paint();

                function ____moveOne(length) {
                    if (length < 1 && length >= 0.3) {
                        return 1;
                    } else if (length > -1 && length <= -0.3) {
                        return -1;
                    }
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

            function __isCubeDefineOutRange(cubeDefine) {
                if (cubeDefine[2] < 0 || cubeDefine[3] < 0) {
                    return true;
                }
                if (cubeDefine[2] + cubeDefine[0] > 4 || cubeDefine[3] + cubeDefine[1] > 5) {
                    return true;
                }
                return false;
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
        }

        function __createButton() {
            var xOffset, yOffset, unitSize, background, label, button;
            xOffset = self.xOffset;
            yOffset = self.yOffset;
            unitSize = self.unitSize;

            var img = new Image();
            img.src = 'back.png';
            img.onload = function() {
                button = new createjs.Bitmap(img);
                button.x = xOffset + 1.5 * (unitSize + 1);
                button.y = yOffset + 5.5 * (unitSize + 1) - 10;
                ;
                button.scaleX = 0.5;
                button.scaleY = 0.5;
                button.alpha = 0.7;
                button.on('click', function(evt) {
                    var lastMove;
                    if (self.moveLog.length > 0) {
                        lastMove = self.moveLog.pop();
                        self.allCubes[lastMove[0]][2] -= lastMove[1];
                        self.allCubes[lastMove[0]][3] -= lastMove[2];
                        self.paint();
                    }

                });
                self.undoButton = button;
                self.stage.addChild(button);
                self.stage.update();
            }
            return;
        }

        function __createBorder() {
            var line, x, y, xOffset, yOffset, unitSize;
            var round = 4;
            var thick = 15;
            var color = '#0AD';
            xOffset = self.xOffset;
            yOffset = self.yOffset;
            unitSize = self.unitSize;
            line = new createjs.Shape();
            line.graphics.beginFill(color).drawRoundRect(xOffset - 20, yOffset - 20,
                    4 * (unitSize + 1) + 40, thick, round);
            self.stage.addChild(line);
            line = new createjs.Shape();
            line.graphics.beginFill(color).drawRoundRect(xOffset - 20, yOffset - 10, thick,
                    5 * (unitSize + 1) + 32, round);
            self.stage.addChild(line);
            line = new createjs.Shape();
            line.graphics.beginFill(color).drawRoundRect(xOffset + 4 * (unitSize + 1) + 5,
                    yOffset - 10, thick, 5 * (unitSize + 1) + 32, round);
            self.stage.addChild(line);
            line = new createjs.Shape();
            line.graphics.beginFill(color).drawRoundRect(xOffset - 20,
                    yOffset + 5 * (unitSize + 1) + 10, (unitSize + 10), thick, round);
            self.stage.addChild(line);
            line = new createjs.Shape();
            line.graphics.beginFill(color).drawRoundRect(xOffset + 3 * (unitSize + 1) + 10,
                    yOffset + 5 * (unitSize + 1) + 10, unitSize + 10, thick, round);
            self.stage.addChild(line);
            self.stage.update();
            self.borders.push(line);
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
            alert('WIN!');
        }
    },
    paintBoarder : function() {
        var unitSize, xOffset, yOffset, line, stage;
        stage = this.stage;
        xOffset = this.xOffset;
        yOffset = this.yOffset;
        unitSize = this.unitSize;
        line = new createjs.Shape();
        line.graphics.moveTo(xOffset, yOffset - 30).setStrokeStyle(1).beginStroke('#00ff00')
                .lineTo(xOffset - 3, yOffset - 3 + (unitSize + 1) * 5);
        this.stage.addChild(line);
        // this.stage.update();
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

// Events
$(document).ready(function() {
    // initEveryThing();

    var canvas = document.getElementById('game-canvas');
    $('.main-canvas').attr({
        width : $(window).width() * 0.9,
        height : $(window).height() - 200
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