var DialogCoolDownLayer = cc.Layer.extend({
    ctor:function () {
        this._super();

        var size = cc.winSize;

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        backgroundLayer.opacity = 230;
        this.addChild(backgroundLayer);

        var pageView = new ccui.PageView();
        pageView.setTouchEnabled(true);
        pageView.setContentSize(cc.size(size.width, size.height));
        pageView.x = (size.width - pageView.width) / 2;
        pageView.y = (size.height - pageView.height) / 2;
        this.addChild(pageView);

        var backBtn = new SimpleMenu(res.close_png, res.close_png, res.close_png, function(sender) {
            sender.parent.parent.runAction(new cc.Sequence(
                new cc.FadeOut(0.1),
                new cc.CallFunc(function(sender) {
                    sender.parent.coolDown(1);
                    sender.removeFromParent(true);
                })
            ));
            sender.runAction(new cc.ScaleTo(0.1, 1.5));
        }, this);

        backBtn.attr({
            x : 470,
            y : -50,
            scale : 0.3
        });

        this.addChild(backBtn);

        var sprite = new cc.Sprite(res.cooldown_yellow_png);
        sprite.attr({
            x : 180,
            y : size.height / 2,
            scale : 2
        });
        this.addChild(sprite);

        var label = new cc.LabelTTF("뇌파 쿨다운을 실행하시겠습니까?", "Arial", 60);
        label.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 250
        });
        this.addChild(label);

        var label2 = new cc.LabelTTF("충분히 뇌를 사용하셨다면 이제는 충분히 쉬어주셔야 합니다.\n뇌파를 편안한 상태로 유도하여 명상으로 마무리할 수 있도록\n도와줍니다!", "Arial", 40);
        label2.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 50,
            color : cc.color(200, 200, 200)
        });
        this.addChild(label2);

        var okBtn = new SimpleMenu(res.checkmark_yellow_png, res.checkmark_yellow_png, res.checkmark_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    sender.parent.parent.parent.coolDown(0);
                    sender.parent.parent.removeFromParent();
                })));
        }, this);

        okBtn.attr({
            x : 200,
            y : 0,
            scale : 0.4
        });

        this.addChild(okBtn);

        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased: function(keyCode, event){
                    if (keyCode == cc.KEY.back) {
                        cc.neurostudy.isSelectPkgShow = true;
                        cc.director.runScene(new MenuScene());
                    }
                }
            }), this);
        }
    }
});