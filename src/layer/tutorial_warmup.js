var TutorialWarmUpLayer = cc.Layer.extend({
    label : null,
    array : [
        "안녕하세요!\n뉴로스터디를 이용해주셔서 감사합니다!\n\n뉴로스터디는 뇌파를 이용한 영어 학습 도구입니다.\n\n뇌파 헤드셋을 통하여 집중력을 측정하고 이에 대한 피드백을 전달하여 사용자가 자연스럽게 집중 상태를 유지하도록 도와줍니다.\n\n이를 통하여 하루 30분 정도의 시간 투자만으로도 놀라울 정도의 학습 효과를 보장합니다.",
        "본격적인 학습에 앞서 뉴로 워밍업 프로그램을 소개합니다.\n\n뉴로 워밍업은 학습에 앞서서 집중력과 관련이 높은 세타파를 학습에 적합한 형태로 유도하는 프로그램입니다.\n\n시각 효과와 시냇물 소리를 통하여 사용자의 세타파를 다량 발생하도록 유도하여 집중 상태로 학습에 임할 수 있도록 도와줍니다",
    ],
    index : 0,
    cur : 0,
    nextEnabled : false,
    clickMenu : null,
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

        this.clickMenu = new SimpleMenu(res.forward_white_png, res.forward_white_png, res.forward_white_png, function(sender) {
            this.touchEvent();
        }, this);

        this.clickMenu.attr({
            x : size.width - 128,
            y : 128,
            opacity : 0
        });

        this.addChild(this.clickMenu);

        this.clickMenu.runAction(new cc.RepeatForever(
            new cc.Sequence(
                new cc.ScaleTo(0.3, 1),
                new cc.ScaleTo(0.3, 1.03)
            )
        ));

        this.label = new cc.LabelTTF("", "Arial", 50, cc.size(size.width * 0.8, size.height * 0.7), cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        this.label.attr({
            x : size.width / 2,
            y : size.height / 2
        });
        this.addChild(this.label);

        this.schedule(function() {
            if(this.cur < this.array[this.index].length) {
                this.label.string += this.array[this.index][this.cur];
                this.cur++;
            }
            else {
                this.clickMenu.runAction(new cc.FadeIn(0.1));
                this.nextEnabled = true;
            }
        }, 0.05);
    },
    touchEvent:function (event) {
        if(this.nextEnabled) {
            this.clickMenu.runAction(new cc.FadeOut(0.1));
            if(this.index < this.array.length - 1) {
                this.nextEnabled = false;
                this.index++;
                this.cur = 0;
                this.label.string = "";
            }
            else {
                this.removeFromParent();
                cc.sys.localStorage.setItem("warmup-tutorial", "true");
            }
        }
    }
});