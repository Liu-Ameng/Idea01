Hrd.Game =
        Ember.Object
                .extend({
                    // canvasEl : $('#game-canvas'),
                    // ctx : {},
                    init : function() {
                        // _super().init()
                    },
                    paint : function() {
                        var canvas = this.get('canvas');
                        var rect = new fabric.Rect({
                            left : 100,
                            top : 100,
                            fill : 'red',
                            width : 40,
                            height : 40,
                            strokeWidth : 2,
                            stroke : 'rgba(100,200,200,1)'
                        });
                        canvas.add(rect);
                        fabric.Image.fromURL('../img/5.png', function(oImg) {
                            canvas.add(oImg);
                        });

                        var path =
                                new fabric.Path(
                                        'M121.32,0L44.58,0C36.67,0,29.5,3.22,24.31,8.41\
                c-5.19,5.19-8.41,12.37-8.41,20.28c0,15.82,12.87,28.69,28.69,28.69c0,0,4.4,\
                0,7.48,0C36.66,72.78,8.4,101.04,8.4,101.04C2.98,106.45,0,113.66,0,121.32\
                c0,7.66,2.98,14.87,8.4,20.29l0,0c5.42,5.42,12.62,8.4,20.28,8.4c7.66,0,14.87\
                -2.98,20.29-8.4c0,0,28.26-28.25,43.66-43.66c0,3.08,0,7.48,0,7.48c0,15.82,\
                12.87,28.69,28.69,28.69c7.66,0,14.87-2.99,20.29-8.4c5.42-5.42,8.4-12.62,8.4\
                -20.28l0-76.74c0-7.66-2.98-14.87-8.4-20.29C136.19,2.98,128.98,0,121.32,0z');

                        canvas.add(path.set({
                            left : 100,
                            top : 200
                        }));
                    }
                });

// Events
$(document).ready(function() {
    // initEveryThing();
    var game = Hrd.Game.create({
        canvas : new fabric.Canvas('game-canvas', {
            width : 600,
            height : 500
        })
    });
    game.paint();
});