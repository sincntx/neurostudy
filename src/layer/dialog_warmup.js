var DialogWarmUpLayer = cc.Layer.extend({
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
                    sender.parent.warmup(1);
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

        var sprite = new cc.Sprite(res.warmup_yellow_png);
        sprite.attr({
            x : 150,
            y : size.height / 2
        });
        this.addChild(sprite);

        var label = new cc.LabelTTF("뇌파 워밍업을 실행하시겠습니까?", "Arial", 60);
        label.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 250
        });
        this.addChild(label);

        var label2 = new cc.LabelTTF("뇌가 즐거워지는 뇌파 워밍업은 본격적인 스터디에 앞서서\n뇌파를 집중하기 좋은 상태로 쉽게 유도해주는 워밍업 도구입니다.\n가급적 스터디 이전에 사용해주시면 스터디 효과가 극대화됩니다!", "Arial", 40);
        label2.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 50,
            color : cc.color(200, 200, 200)
        });
        this.addChild(label2);

        var okBtn = new SimpleMenu(res.checkmark_yellow_png, res.checkmark_yellow_png, res.checkmark_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    sender.parent.parent.parent.warmup(0);
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