var DialogThinkGearLayer = cc.Layer.extend({
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

        var sprite = new cc.Sprite(res.mindwave_nosignal_png);
        sprite.attr({
            x : 150,
            y : size.height / 2 + 50,
            scale : 2
        });
        this.addChild(sprite);

        var label = new cc.LabelTTF("뇌파 헤드셋 없이 실행하시겠습니까?", "Arial", 60);
        label.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 250
        });
        this.addChild(label);

        var label2 = new cc.LabelTTF("뉴로스터디는 뇌파 헤드셋을 통하여 측정한 뇌파 정보를 이용한\n뉴로 피드백 효과를 기반으로 학습 효과를 극대화하는 도구입니다.\n뇌파 헤드셋 없이도 이용하실 수 있지만 효과가 반감될 수 있습니다!", "Arial", 40);
        label2.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 50,
            color : cc.color(200, 200, 200)
        });
        this.addChild(label2);

        var okBtn = new SimpleMenu(res.checkmark_yellow_png, res.checkmark_yellow_png, res.checkmark_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    sender.parent.parent.parent.selectPkg();
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