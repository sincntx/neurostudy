var DialogMainStudyLayer = cc.Layer.extend({
    ctor:function () {
        this._super();

        var size = cc.winSize;

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        backgroundLayer.opacity = 240;
        this.addChild(backgroundLayer);

        var pageView = new ccui.PageView();
        pageView.setTouchEnabled(true);
        pageView.setContentSize(cc.size(size.width, size.height));
        pageView.x = (size.width - pageView.width) / 2;
        pageView.y = (size.height - pageView.height) / 2;
        this.addChild(pageView);

        var sprite = new cc.Sprite(res.study_png);
        sprite.attr({
            x : 250,
            y : size.height / 2 + 50,
            scale : 0.5
        });
        this.addChild(sprite);

        var label = new cc.LabelTTF("뇌파 스터디", "Arial", 60);
        label.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 250
        });
        this.addChild(label);

        var label2 = new cc.LabelTTF("망각 주기 리뷰가 끝났습니다.\n확인 버튼을 누르시면 뇌파 스터디를 시작합니다.", "Arial", 40);
        label2.attr({
            x : size.width / 2 + 50,
            y : size.height / 2 + 50,
            color : cc.color(200, 200, 200)
        });
        this.addChild(label2);

        var okBtn = new SimpleMenu(res.checkmark_yellow_png, res.checkmark_yellow_png, res.checkmark_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    cc.neurostudy.studyType = 0;
                    cc.director.runScene(new StudyScene());
                })));
        }, this);

        okBtn.attr({
            x : 350,
            y : 0,
            scale : 0.4
        });

        this.addChild(okBtn);
    }
});