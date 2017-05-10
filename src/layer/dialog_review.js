var DialogReviewLayer = cc.Layer.extend({
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
                    sender.parent.review(1);
                    sender.removeFromParent(true);
                })
            ));
            sender.runAction(new cc.ScaleTo(0.1, 1.5));
        }, this);

        backBtn.attr({
            x : 470,
            y : -180,
            scale : 0.3
        });

        this.addChild(backBtn);

        var sprite = new cc.Sprite(res.review_yellow_png);
        sprite.attr({
            x : 180,
            y : size.height / 2 + 50,
            scale : 2
        });
        this.addChild(sprite);

        var label = new cc.LabelTTF("망각주기 리뷰를 실행하시겠습니까?", "Arial", 60);
        label.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 350
        });
        this.addChild(label);

        var label2 = new cc.LabelTTF("학습 후 10분 후부터 망각이 시작되어 1시간 후에는 50%,\n하루 후에는 70%, 한달 뒤에는 80%를 망각하게 됩니다.\n\n기억을 유지하기 위해서 망각 주기에 따라 복습을 해야 하는데,\n하루 뒤에 복습하면 일주일 동안 기억이 지속되고,\n일주일 후 복습하면 한달 이상 기억이 지속되며,\n한달 후 복습하면 6개월 이상 지속되는 장기 기억이 됩니다.\n\n망각주기 리뷰는 이러한 원리에 따라 사용자의 학습 효과에\n큰 도움을 주기 때문에 필수적으로 실행해주시길 권합니다!", "Arial", 38);
        label2.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 50,
            color : cc.color(200, 200, 200)
        });
        this.addChild(label2);

        var okBtn = new SimpleMenu(res.checkmark_yellow_png, res.checkmark_yellow_png, res.checkmark_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    sender.parent.parent.parent.review(0);
                    sender.parent.parent.removeFromParent();
                })));
        }, this);

        okBtn.attr({
            x : 200,
            y : -130,
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