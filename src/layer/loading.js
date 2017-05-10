var LoadingLayer = cc.Layer.extend({
    ctor:function (msg) {
        this._super();

        var size = cc.winSize;

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        backgroundLayer.opacity = 220;
        this.addChild(backgroundLayer);

        var pageView = new ccui.PageView();
        pageView.setTouchEnabled(true);
        pageView.setContentSize(cc.size(size.width, size.height));
        pageView.x = (size.width - pageView.width) / 2;
        pageView.y = (size.height - pageView.height) / 2;
        this.addChild(pageView);

        var msgLabel = new cc.LabelTTF(msg, "Arial", 60);
        msgLabel.setPosition(cc.p(size.width / 2, size.height / 2 + 80));
        this.addChild(msgLabel);

        var loading = new cc.Sprite(res.loading_png);
        loading.scale = 0.5;
        loading.setPosition(cc.p(size.width / 2, size.height / 2 - 80));
        this.addChild(loading);

        loading.runAction(new cc.RepeatForever(new cc.RotateBy(2, 360)));
    },
    hide:function() {
        /*this.runAction(new cc.Sequence(new cc.DelayTime(1),
        new cc.CallFunc(function(sender) {
            sender.removeFromParent();
        })));*/
        this.removeFromParent();
    }
});