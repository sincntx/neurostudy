var StudyLayer = cc.Layer.extend({
    CONCENTRATE_GOAL : 400,
    WORD_PART_LENGTH : 5,
    WORD_UPDATE_TIME : 1.2,
    THINKGEAR_UPDATE_TIME : 0.1,

    attention : 0,
    brainBar : [],
    concentrate : 0,
    BarMaxCount : 70,
    wordArray : [],
    wordPartArray : [],

    curWord : 0,
    curPart : 0,

    time : 0,
    type : 0,

    mindwaveSprite : null,
    wordImage : null,
    topLabel : null,
    bottomLabel : null,

    wordFlag : false,
    wordUpdateEnabled : false,
    brainwaveSprite : false,
    chatbubbleSprite : false,
    timewordLabel : false,
    timeLabel : false,
    isStart : false,

    ctor:function () {
        this.brainBar = [];

        this._super();

        var size = cc.winSize;

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        this.addChild(backgroundLayer);

        // 0은 메인 스터디 1은 복습, 2는 체크노트, 3은 학습 분석에서 학습
        this.type = cc.neurostudy.studyType;

        switch(this.type) {
            case 0:
                this.wordArray = cc.neurostudy.loadPackageWords();
                break;
            case 1:
                var reviewSprite = new cc.Sprite(res.review_yellow_png);
                reviewSprite.attr({
                    x: 220,
                    y: size.height - 75,
                    scale : 0.6,
                    opacity : 0
                });
                this.addChild(reviewSprite);
                reviewSprite.runAction(new cc.Sequence(
                    new cc.DelayTime(0.5),
                    new cc.FadeIn(1)
                ));
                this.wordArray = cc.neurostudy.loadReviewWords();
                break;
            case 2:
                var reviewSprite = new cc.Sprite(res.checknote_yellow_png);
                reviewSprite.attr({
                    x: 220,
                    y: size.height - 70,
                    scale : 0.15,
                    opacity : 0
                });
                this.addChild(reviewSprite);
                reviewSprite.runAction(new cc.Sequence(
                    new cc.DelayTime(0.5),
                    new cc.FadeIn(1)
                ));
                this.wordArray = cc.neurostudy.checkNote;
                break;
            case 3:
                var reviewSprite = new cc.Sprite(res.checknote_yellow_png);
                reviewSprite.attr({
                    x: 220,
                    y: size.height - 70,
                    scale : 0.15,
                    opacity : 0
                });
                this.addChild(reviewSprite);
                reviewSprite.runAction(new cc.Sequence(
                    new cc.DelayTime(0.5),
                    new cc.FadeIn(1)
                ));
                this.wordArray = cc.neurostudy.checkNote;
                break;
        }

        // 단어를 5개로 쪼개기
        this.wordPartArray = _.chunk(this.wordArray, 5);
        // 전체 단어 목록 랜덤으로 섞어서 마지막에 추가
        this.wordPartArray.push(_.shuffle(this.wordArray));

        // 마인드웨이브 연결상태 아이콘
        this.mindwaveSprite = new cc.Sprite(res.mindwave_png);
        this.mindwaveSprite.attr({
            x: this.mindwaveSprite.width / 2 + 40,
            y: size.height - this.mindwaveSprite.height / 2 - 20,
            opacity: 0
        });
        this.addChild(this.mindwaveSprite);
        this.mindwaveSprite.runAction(new cc.Sequence(
            new cc.DelayTime(0.5),
            new cc.FadeIn(1)
        ));

        // 설정 아이콘
        var settingItem = new cc.MenuItemImage(res.option_btn_png, res.option_btn_png, function (sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.15, 1.5), new cc.ScaleTo(0.15, 1)));
            this.pause();
            this.addChild(new OptionLayer(true), 99);
        }, this);
        settingItem.attr({
            scale: 0.8,
            opacity: 0
        });
        settingItem.runAction(new cc.Sequence(
            new cc.DelayTime(0.5),
            new cc.FadeIn(1)
        ));

        var menu = new cc.Menu(settingItem);
        menu.setPosition(cc.p(size.width - 70, size.height - 70));
        this.addChild(menu);

        for (var i = 0; i < this.BarMaxCount; i++) {
            var barItem = new cc.Sprite(res.bar_red_png);
            barItem.attr({
                x: (((size.width - 120) / this.BarMaxCount) * i) + 120,
                y: barItem.height + 20,
                scale: 0.5
            });
            this.brainBar.push(barItem);
            this.addChild(barItem);
        }

        this.brainwaveSprite = new cc.Sprite(res.brainwave_yellow_png);
        this.brainwaveSprite.attr({
            x: 50,
            y: 60,
            scale: 0.7
        });

        this.addChild(this.brainwaveSprite);

        this.wordImage = new cc.Sprite(this.wordPartArray[this.curPart][this.curWord].img);
        this.wordImage.attr({
            x : size.width / 4,
            y : size.height / 2,
            scale : 3,
            opacity : 0
        });
        this.addChild(this.wordImage);
        this.wordImage.runAction(new cc.Sequence(
            new cc.DelayTime(1),
            new cc.FadeIn(0.5)
        ));

        this.topLabel = new cc.LabelTTF(this.wordPartArray[this.curPart][this.curWord].pronounce_korean, "Arial", 90);
        this.topLabel.attr({
            x : (size.width / 6) * 4,
            y : (size.height / 6) * 3.7 - 30,
            opacity : 0
        });
        this.addChild(this.topLabel);
        this.topLabel.runAction(new cc.Sequence(
            new cc.DelayTime(1.5),
            new cc.FadeIn(0.5)
        ));

        this.bottomLabel = new cc.LabelTTF(this.wordPartArray[this.curPart][this.curWord].korean, "Arial", 90);
        this.bottomLabel.attr({
            x : (size.width / 6) * 4,
            y : (size.height / 6) * 2.2 + 50,
            color : cc.neurostudy.MAIN_COLOR,
            opacity : 0
        });
        this.addChild(this.bottomLabel);

        this.bottomLabel.runAction(new cc.Sequence(
            new cc.DelayTime(2),
            new cc.FadeIn(0.5),
            new cc.CallFunc(function(sender) {
                try {
                    cc.audioEngine.playEffect(sender.parent.wordPartArray[sender.parent.curPart][sender.parent.curWord].mp3);
                }
                catch(err) {
                    cc.log(err);
                }

                sender.parent.wordUpdateEnabled = true;
            })
        ));

        this.chatbubbleSprite = new cc.Sprite(res.chatbubble_png);
        this.chatbubbleSprite.attr({
            x : this.brainwaveSprite.x + 200,
            y : this.brainwaveSprite.y + 200,
            scale : 0.8,
            opacity : 0
        });
        this.addChild(this.chatbubbleSprite, 1);

        this.timewordLabel = new cc.LabelTTF("concentrate", "Arial", 40);
        this.timewordLabel.attr({
            color : cc.color(0, 0, 0),
            x : this.brainwaveSprite.x + 200,
            y : this.brainwaveSprite.y + 240,
            opacity : 0
        });
        this.addChild(this.timewordLabel, 2);

        this.timeLabel = new cc.LabelTTF("0.0초 학습", "Arial", 40);
        this.timeLabel.attr({
            color : cc.color(0, 0, 0),
            x : this.brainwaveSprite.x + 200,
            y : this.brainwaveSprite.y + 160,
            opacity : 0
        });
        this.addChild(this.timeLabel, 2);

        //this.updateStart();
        this.schedule(this.thinkgearUpdate, this.THINKGEAR_UPDATE_TIME);
        this.schedule(this.wordUpdate, this.WORD_UPDATE_TIME);

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

        this.nextWord();

        return true;
    },
    thinkgearUpdate:function () {
        var status = cc.thinkgear.getStatus();
        var size = cc.winSize;

        cc.thinkgear.connect();

        switch(status) {
            case 'connected' :
                this.mindwaveSprite.removeFromParent();
                this.mindwaveSprite = new cc.Sprite(res.mindwave_png);
                this.mindwaveSprite.attr({
                    x: this.mindwaveSprite.width / 2 + 40,
                    y: size.height - this.mindwaveSprite.height / 2 - 20
                });
                this.addChild(this.mindwaveSprite);
                break;
            case 'connecting' :
                this.mindwaveSprite.removeFromParent();
                this.mindwaveSprite = new cc.Sprite(res.mindwave_connecting1_png);
                this.mindwaveSprite.attr({
                    x: this.mindwaveSprite.width / 2 + 40,
                    y: size.height - this.mindwaveSprite.height / 2 - 20
                });
                this.addChild(this.mindwaveSprite);

                var animation = new cc.Animation();
                animation.addSpriteFrameWithFile(res.mindwave_connecting1_png);
                animation.addSpriteFrameWithFile(res.mindwave_connecting2_png);
                animation.addSpriteFrameWithFile(res.mindwave_connecting3_png);
                animation.setDelayPerUnit(0.2);

                this.mindwaveSprite.runAction(new cc.RepeatForever(new cc.Animate(animation)));
                break;
            default :
                this.mindwaveSprite.removeFromParent();
                this.mindwaveSprite = new cc.Sprite(res.mindwave_nosignal_png);
                this.mindwaveSprite.attr({
                    x: this.mindwaveSprite.width / 2 + 40,
                    y: size.height - this.mindwaveSprite.height / 2 - 20
                });
                this.addChild(this.mindwaveSprite);
                break;
        }

        this.attention = cc.thinkgear.getAttention();

        this.showBrainBar();

        if (this.wordUpdateEnabled == true) {
            this.time++;

            //this.concentrate += (this.attention ^ 2) / 120;
            this.concentrate += this.attention / 10;

            if(this.concentrate > this.CONCENTRATE_GOAL) {
                this.nextWord();
            }
        }
    },
    showBrainBar:function() {
        // 현재 집중도만 보여주기
        for(var i = 0;i < this.BarMaxCount;i++) {
            if(this.attention * 0.7 > i) {
                this.brainBar[i].runAction(new cc.ScaleTo(0.1, 1));
                //this.brainBar[i].setColor(cc.color(255, 255, 255));
            }
            else {
                this.brainBar[i].runAction(new cc.ScaleTo(0.1, 0.5));
                //this.brainBar[i].setColor(cc.color(15, 15, 15));
            }
        }
    },
    checkNote:function(select) {
        switch(select) {
            case 0:
                cc.neurostudy.studyType = 2;
                cc.director.runScene(new StudyScene());
                break;
            default :
                this.addChild(new DialogCoolDownLayer(), 99);
                break;
        }
    },
    coolDown:function(select) {
        switch(select) {
            case 0:
                cc.director.runScene(new CoolDownScene());
                break;
            default :
                cc.neurostudy.isSelectPkgShow = true;
                cc.director.runScene(new MenuScene());
                break;
        }
    },
    nextWord:function() {
        var size = cc.winSize;

        if(this.isStart == false) {
            this.isStart = true;
            return;
        }

        this.chatbubbleSprite.runAction(new cc.Sequence(
            new cc.FadeIn(0.1),
            new cc.DelayTime(1.2),
            new cc.FadeOut(0.1)
        ));

        this.timewordLabel.string = this.wordPartArray[this.curPart][this.curWord].english;
        this.timeLabel.string = (this.time / 10) + "초 학습";

        this.timeLabel.runAction(new cc.Sequence(
            new cc.FadeIn(0.1),
            new cc.DelayTime(1.2),
            new cc.FadeOut(0.1)
        ));

        this.timewordLabel.runAction(new cc.Sequence(
            new cc.FadeIn(0.1),
            new cc.DelayTime(1.2),
            new cc.FadeOut(0.1)
        ));

        cc.audioEngine.playEffect(this.wordPartArray[this.curPart][this.curWord].mp3);

        this.time = 0;
        this.concentrate = 0;

        this.curWord++;

        // 파트 단위 학습이 끝나면
        if(this.curWord > this.wordPartArray[this.curPart].length - 1) {
            cc.neurostudy.testWords = this.wordPartArray[this.curPart];

            if(this.wordPartArray[this.curPart].length > 1) {
                this.pause();
                this.addChild(new TestLayer(1), 99);
                this.curWord = 0;
                this.curPart++;
                return;
            }

            this.curWord = 0;
            this.curPart++;
        }

        // 모든 파트의 학습이 끝나면
        if(this.curPart >= this.wordPartArray.length || this.curWord >= this.wordPartArray[this.curPart].length) {
            this.studyFinish();
            return;
        }

        this.wordSet();
    },
    wordSet:function() {
        var size = cc.winSize;

        // 모든 파트의 학습이 끝나면
        if(this.curPart >= this.wordPartArray.length || this.curWord >= this.wordPartArray[this.curPart].length) {
            this.studyFinish();
            return;
        }

        this.topLabel.string = this.wordPartArray[this.curPart][this.curWord].pronounce_korean;
        this.bottomLabel.string = this.wordPartArray[this.curPart][this.curWord].korean;
        this.topLabel.opacity = 0;
        this.bottomLabel.opacity = 0;

        this.wordImage.removeFromParent();
        this.wordImage = new cc.Sprite(this.wordPartArray[this.curPart][this.curWord].img);
        this.wordImage.attr({
            x : size.width / 4,
            y : size.height / 2,
            scale : 3,
            opacity : 0
        });
        this.addChild(this.wordImage);
        this.wordImage.runAction(new cc.Sequence(
            new cc.DelayTime(1.2),
            new cc.FadeIn(0.5)
        ));

        this.topLabel.runAction(new cc.Sequence(
            new cc.DelayTime(1),
            new cc.FadeIn(0.5)
        ));
        this.bottomLabel.runAction(new cc.Sequence(
            new cc.DelayTime(1.5),
            new cc.FadeIn(0.5),
            new cc.CallFunc(function(sender) {
                if(sender.parent.curPart >= sender.parent.wordPartArray.length || sender.parent.curWord >= sender.parent.wordPartArray[sender.parent.curPart].length) return;
                cc.audioEngine.playEffect(sender.parent.wordPartArray[sender.parent.curPart][sender.parent.curWord].mp3);
                sender.parent.wordUpdateEnabled = true;
            })
        ));
    },
    studyFinish:function() {
        this.unschedule(this.wordUpdate);
        this.unschedule(this.thinkgearUpdate);

        switch(this.type) {
            // 메인 스터디일 경우
            case 0:
                // 학습 진도 기록
                cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].last = cc.neurostudy.getTimeStamp();
                cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].process += cc.neurostudy.STUDY_WORD_LENGTH;
                if(cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].process > cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].words) {
                    cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].process = cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].words;
                }

                cc.neurostudy.savePkg();

                // 리뷰노트 등록
                for(var i = 0;i < this.wordArray.length;i++) {
                    var word = _.clone(this.wordArray[i]);
                    word.study_timestamp = _.now();
                    word.review1 = false;
                    word.review7 = false;
                    word.review30 = false;
                    cc.neurostudy.reviewWords.push(word);
                }
                cc.neurostudy.reviewWords = _.uniq(cc.neurostudy.reviewWords, 'english');
                cc.neurostudy.writeReviewWords();

                // 스터디노트 등록
                cc.neurostudy.studyWords = _.union(cc.neurostudy.studyWords, this.wordArray);
                cc.neurostudy.writeStudyWords();

                this.wordUpdateEnabled = false;
                if(cc.neurostudy.checkNote.length > 0) {
                    this.addChild(new DialogCheckNoteLayer(), 99);
                }
                else {
                    if(cc.neurostudy.isThinkgearEnabled) {
                        this.addChild(new DialogCoolDownLayer(), 99);
                    }
                    else {
                        this.coolDown(1);
                    }
                }
                break;
            // 망각주기 리뷰일 경우
            case 1:
                // 리뷰 기록 갱신
                var removeReviewIndex = [];

                for(var i = 0;i < this.wordArray.length;i++) {
                    switch(this.wordArray[i].review_type) {
                        case 1:
                            cc.neurostudy.reviewWords[this.wordArray[i].index].review1 = true;
                            break;
                        case 7:
                            cc.neurostudy.reviewWords[this.wordArray[i].index].review7 = true;
                            break;
                        default:
                            cc.neurostudy.reviewWords[this.wordArray[i].index].review30 = true;
                            break;
                    }

                    if(cc.neurostudy.reviewWords[this.wordArray[i].index].review1 && cc.neurostudy.reviewWords[this.wordArray[i].index].review7 && cc.neurostudy.reviewWords[this.wordArray[i].index].review30) {
                        removeReviewIndex.push(this.wordArray[i].index);
                    }
                }

                removeReviewIndex = _.uniq(removeReviewIndex);

                for(var i = 0;i < removeReviewIndex.length;i++) {
                    _.pullAt(cc.neurostudy.reviewWords, i);
                }

                cc.neurostudy.writeReviewWords();

                this.addChild(new DialogMainStudyLayer(), 99);
                break;
            // 체크노트 스터디일 경우
            case 2:
                this.wordUpdateEnabled = false;
                if(cc.neurostudy.isThinkgearEnabled) {
                    this.addChild(new DialogCoolDownLayer(), 99);
                }
                else {
                    this.coolDown(1);
                }
                break;
            // 학습분석에서 왔을 경우
            case 3:
                cc.neurostudy.isStatShow = true;
                cc.director.runScene(new MenuScene());
                break;
        }
    },
    wordUpdate:function() {
        if(this.wordUpdateEnabled == true) {
            if (this.wordFlag == false) {
                this.wordFlag = true;
                this.bottomLabel.string = this.wordPartArray[this.curPart][this.curWord].english;
            }
            else {
                this.wordFlag = false;
                this.bottomLabel.string = this.wordPartArray[this.curPart][this.curWord].korean;
            }
        }
    }
    /*updateStart:function() {
        var size = cc.winSize;

        // 모든 파트의 학습이 끝나면
        if(this.curPart > this.wordPartArray.length - 1 || this.curWord > this.wordPartArray[this.curPart].length - 1) {
            switch(this.type) {
                // 메인 스터디일 경우
                case 0:
                    this.wordUpdateEnabled = false;
                    if(cc.neurostudy.checkNote.length > 0) {
                        this.addChild(new DialogCheckNoteLayer(), 99);
                    }
                    else {
                        if(cc.neurostudy.isThinkgearEnabled) {
                            this.addChild(new DialogCoolDownLayer(), 99);
                        }
                        else {
                            this.coolDown(1);
                        }
                    }
                    break;
                // 망각주기 리뷰일 경우
                case 1:
                    cc.neurostudy.studyType = 0;
                    cc.director.runScene(new StudyScene());
                    break;
                // 체크노트 스터디일 경우
                case 2:
                    this.wordUpdateEnabled = false;
                    if(cc.neurostudy.isThinkgearEnabled) {
                        this.addChild(new DialogCoolDownLayer(), 99);
                    }
                    else {
                        this.coolDown(1);
                    }
            }

            return;
        }

        this.time = 0;
        this.concentrate = 0;

        cc.audioEngine.playEffect(this.wordPartArray[this.curPart][this.curWord].mp3);

        this.wordUpdateEnabled = false;
        this.wordFlag = false;

        this.topLabel.string = this.wordPartArray[this.curPart][this.curWord].pronounce_korean;
        this.bottomLabel.string = this.wordPartArray[this.curPart][this.curWord].korean;
        this.topLabel.opacity = 0;
        this.bottomLabel.opacity = 0;

        this.wordImage.removeFromParent();
        this.wordImage = new cc.Sprite(this.wordPartArray[this.curPart][this.curWord].img);
        this.wordImage.attr({
            x : size.width / 4,
            y : size.height / 2,
            opacity : 0
        });
        this.addChild(this.wordImage);
        this.wordImage.runAction(new cc.Sequence(
            new cc.DelayTime(1.2),
            new cc.FadeIn(0.5)
        ));

        this.topLabel.runAction(new cc.Sequence(
            new cc.DelayTime(1),
            new cc.FadeIn(0.5)
        ));
        this.bottomLabel.runAction(new cc.Sequence(
            new cc.DelayTime(1.5),
            new cc.FadeIn(0.5),
            new cc.CallFunc(function(sender) {
                cc.audioEngine.playEffect(sender.parent.wordPartArray[sender.parent.curPart][sender.parent.curWord].mp3);
                sender.parent.wordUpdateEnabled = true;
            })
        ));

        this.schedule(this.thinkgearUpdate, this.THINKGEAR_UPDATE_TIME);
        this.schedule(this.wordUpdate, this.WORD_UPDATE_TIME);
    }*/
});

var StudyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new StudyLayer();
        this.addChild(layer);
    },
    onExit:function () {
    }
});

/*if ('mouse' in cc.sys.capabilities) {
 cc.eventManager.addListener({
 event: cc.EventListener.MOUSE,
 onMouseMove: function (event) {
 event.getCurrentTarget().touchEvent(event);
 }
 }, this);
 }

 if (cc.sys.capabilities.hasOwnProperty('touches')){
 cc.eventManager.addListener({
 prevTouchId: -1,
 event: cc.EventListener.TOUCH_ALL_AT_ONCE,
 onTouchesMoved:function (touches, event) {
 var touch = touches[0];
 if (this.prevTouchId != touch.getID())
 this.prevTouchId = touch.getId();
 else event.getCurrentTarget().touchEvent(touches[0]);
 }
 }, this);
 }*/
/*touchEvent:function (event) {
 if(this.wordUpdateEnabled == true) {
 var winSize = cc.director.getWinSize();
 var delta = event.getDelta();
 var curPosition = cc.pAdd(cc.p(0,0), delta);

 this.concentrate += 0.5;
 this.showBrainBar();
 }
 },
 initBrainBar:function() {
 this.concentrate = 0;

 for (var i = 0; i < this.BarMaxCount; i++) {
 this.brainBar[i].setColor(cc.color(15, 15, 15));
 this.brainBar[i].scale = 0.5;
 }
 },*/
