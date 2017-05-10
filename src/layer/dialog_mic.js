var DialogMicLayer = cc.Layer.extend({
    qLabel : null,
    descLabel : null,
    micMenu : null,
    word : null,
    isRecording : false,
    ctor:function (word) {
        this._super();

        this.word = word;

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
            x : size.width / 2,
            y : size.height / 2,
            scale : 0.15
        });

        this.addChild(backBtn);

        this.qLabel = new cc.LabelTTF(this.word.english + "\n[" + this.word.pronounce + ", " + this.word.pronounce_korean + "]", "Arial", 80);
        this.qLabel.attr({
            x : size.width / 2,
            y : size.height / 2 + 250,
            color : cc.neurostudy.MAIN_COLOR
        });
        this.addChild(this.qLabel);

        this.descLabel = new cc.LabelTTF("마이크 버튼을 눌러서 발음해주세요.", "Arial", 60);
        this.descLabel.attr({
            x : size.width / 2,
            y : this.qLabel.y - 200,
            color : cc.color(150, 150, 150)
        });
        this.addChild(this.descLabel);

        this.micMenu = new SimpleMenu(res.option_mic_png, res.option_mic_png, res.option_mic_png, function(sender) {
            sender.runAction(new cc.Sequence(
                new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    if(!cc.thinkgear.isRecording()) {
                        sender.parent.parent.descLabel.string = "녹음 중입니다.";
                        sender.parent.setEnabled(false);
                        sender.parent.opacity = 0;
                        sender.parent.parent.isRecording = true;
                        cc.thinkgear.record();
                    }
                }),
                new cc.ScaleTo(0.1, 1)
            ));
        }, this);
        this.micMenu.attr({
            anchorX : 0.5,
            anchorY : 0.5,
            x : size.width / 2,
            y : size.height / 2 - 200
        });
        this.addChild(this.micMenu);

        this.schedule(this.speechCheck, 1);
    },
    speechCheck:function() {
        if(this.isRecording) {
            var speech = cc.thinkgear.getSpeech();
            if(speech) {
                this.isRecording = false;
                this.descLabel.string = speech;
                this.micMenu.opacity = 255;
                this.micMenu.setEnabled(true);
            }
            else {
                var isRecording = cc.thinkgear.isRecording();
                if(!isRecording) {
                    this.isRecording = false;
                    this.descLabel.string = "다시 녹음해주세요.";
                    this.micMenu.opacity = 255;
                    this.micMenu.setEnabled(true);
                }
            }
        }
    }
});