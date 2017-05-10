
var LogoLayer = cc.Layer.extend({
    ctor:function () {
        this._super();

        var size = cc.winSize;

        var size = cc.winSize;

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        this.addChild(backgroundLayer);

        var neurocloudSprite = new cc.Sprite(res.neurocloud_logo_png);
        neurocloudSprite.attr({
            x : size.width / 2,
            y : size.height / 2,
            scale : 1,
            opacity : 0
        });
        this.addChild(neurocloudSprite);

        neurocloudSprite.runAction(new cc.Sequence(
            new cc.DelayTime(0.5),
            new cc.FadeIn(1.5),
            new cc.DelayTime(0.5),
            new cc.CallFunc(function(sender) {
                cc.director.runScene(new cc.TransitionSlideInR(1, new MenuScene()));
            })
        ));

        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased: function(keyCode, event){
                    if (keyCode == cc.KEY.back) {
                        cc.director.runScene(new MenuScene());
                    }
                }
            }), this);
        }

        return true;
    }
});

var LogoScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new LogoLayer();
        this.addChild(layer);
    }
});

