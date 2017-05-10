var TestLayer = cc.Layer.extend({
    originalArray : [],
    wordArray : [],

    qObject : null,
    descLabel : null,
    qLabel : null,

    a1String : "",
    a2String : "",

    a1Item : null,
    a2Item : null,
    aMenu : null,

    playMenu : null,
    micMenu : null,
    refreshMenu : null,

    msgLabel : null,
    chatbubbleSprite : null,
    testSprite : null,

    isRecording : false,

    textBGSprite : null,
    textField : null,

    isTextFieldEnabled : false,
    type : 0,

    ctor:function (type) {
        var msgString = "테스트를 시작합니다.";

        this._super();

        this.type = type;

        this.originalArray = [];

        switch(this.type) {
            // 전체 스터디 복습일 경우
            case 0:
                msgString = "뇌가 즐거운 뇌밍업 퀴즈!";
                var length = cc.neurostudy.studyWords.length > 10 ? 10 : cc.neurostudy.studyWords.length;

                for(var i = 0;i < length;i++) {
                    this.originalArray.push(cc.neurostudy.studyWords[Math.floor(Math.random() * (cc.neurostudy.studyWords.length))]);
                }

                break;
            default :
                msgString = "신나는 퀴즈!";
                this.originalArray = _.clone(cc.neurostudy.testWords);
                break;
        }

        this.originalArray = _.uniq(this.originalArray, 'english');
        this.wordArray = _.shuffle(this.originalArray);

        if(this.wordArray.length > 10) this.wordArray = _.slice(this.wordArray, 0, 10);

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

        this.testSprite = new cc.Sprite(res.test_yellow_png);
        this.testSprite.attr({
            x : 150,
            y : 150,
            scale : 0.6
        });
        this.addChild(this.testSprite);

        this.qLabel = new cc.LabelTTF("", "Arial", 100);
        this.qLabel.attr({
            x : size.width / 2,
            y : size.height / 2 + 250,
            color : cc.neurostudy.MAIN_COLOR
        });
        this.addChild(this.qLabel);

        this.descLabel = new cc.LabelTTF("", "Arial", 60);
        this.descLabel.attr({
            x : size.width / 2,
            y : this.qLabel.y - 150,
            color : cc.color(150, 150, 150)
        });
        this.addChild(this.descLabel);

        this.a1Item = new cc.MenuItemFont(" ", function(sender) {
            this.answer(this.a1String);
        } ,this);
        this.a1Item.setFontName('Arial');
        this.a1Item.setFontSize(60);

        this.a2Item = new cc.MenuItemFont(" ", function(sender) {
            this.answer(this.a2String);
        } ,this);
        this.a2Item.setFontName('Arial');
        this.a2Item.setFontSize(60);

        this.aMenu = new cc.Menu(this.a1Item, this.a2Item);
        this.aMenu.alignItemsVerticallyWithPadding(100);
        this.aMenu.x = size.width / 2;
        this.aMenu.y = 300;
        this.addChild(this.aMenu);

        this.playMenu = new SimpleMenu(res.option_vol_yellow_png, res.option_vol_yellow_png, res.option_vol_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(
                new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    cc.audioEngine.playEffect(sender.parent.parent.qObject.mp3);
                }),
                new cc.ScaleTo(0.1, 1)
            ));
        }, this);
        this.playMenu.attr({
            anchorX : 0.5,
            anchorY : 0.5,
            x : size.width / 2,
            y : size.height / 2 + 250,
            opacity : 0
        });
        this.playMenu.setEnabled(false);
        this.addChild(this.playMenu);

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
            y : size.height / 2 - 100,
            opacity : 0
        });
        this.micMenu.setEnabled(false);
        this.addChild(this.micMenu);

        this.refreshMenu = new SimpleMenu(res.refresh_png, res.refresh_png, res.refresh_png, function(sender) {
            sender.runAction(new cc.Sequence(
                new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    sender.parent.parent.wordArray.unshift(sender.parent.parent.qObject);
                    sender.parent.parent.q();
                }),
                new cc.ScaleTo(0.1, 1)
            ));
        }, this);
        this.refreshMenu.attr({
            anchorX : 0.5,
            anchorY : 0.5,
            scale : 0.5,
            x : size.width - 500,
            y : size.height / 2 + 150,
            opacity : 0
        });
        this.refreshMenu.setEnabled(false);
        this.addChild(this.refreshMenu);

        this.chatbubbleSprite = new cc.Sprite(res.chatbubble_png);
        this.chatbubbleSprite.attr({
            x : 150,
            y : 150,
            scale : 0,
            anchorX : 0,
            anchorY : 0,
            opacity : 0
        });
        this.addChild(this.chatbubbleSprite);

        this.msgLabel = new cc.LabelTTF(msgString, "Arial", 30);
        this.msgLabel.attr({
            x : 260,
            y : 260,
            color : cc.color(0, 0, 0),
            textAlign : cc.TEXT_ALIGNMENT_CENTER
        });
        this.chatbubbleSprite.addChild(this.msgLabel);

        this.chatbubbleSprite.runAction(new cc.Sequence(
            new cc.Spawn(new cc.ScaleTo(0.3, 1), new cc.FadeIn(0.3)),
            new cc.DelayTime(1.5),
            new cc.Spawn(new cc.ScaleTo(0.3, 0), new cc.FadeOut(0.3)),
            new cc.CallFunc(function(sender) {
                sender.parent.q();
            })
        ));

        this.textBGSprite = new cc.Sprite(res.round_white_png);
        this.textBGSprite.attr({
            x : size.width / 2,
            y : size.height / 2 - 100,
            scaleY : 1.6,
            scaleX : 1.5,
            opacity : 0
        });
        this.addChild(this.textBGSprite);

        this.textField = new ccui.TextField("단어의 스펠링을 입력하세요", "Arial", 50);
        this.textField.anchorX = 0;
        this.textField.x = 490;
        this.textField.y = 379;
        this.textField.setMaxLengthEnabled(true);
        this.textField.setMaxLength(20);
        this.textField.setTextColor(cc.color(0, 0, 0));
        this.textField.addEventListener(function(textField, type){
            if(!this.isTextFieldEnabled) return;

            switch (type){
                case ccui.TextField.EVENT_ATTACH_WITH_IME:
                    textField.x = 420;
                    textField.fontSize = 54;
                    this.textBGSprite.runAction(new cc.ScaleTo(0.1, 1.8, 1.8));
                    textField.setPlaceHolder('');
                    break;
                case ccui.TextField.EVENT_DETACH_WITH_IME:
                    textField.x = 490;
                    textField.fontSize = 50;
                    this.textBGSprite.runAction(new cc.ScaleTo(0.1, 1.5, 1.6));
                    textField.setPlaceHolder('단어의 스펠링을 입력하세요');
                    this.answer(textField.getString());
                    break;
                case ccui.TextField.EVENT_INSERT_TEXT:
                    break;
                case ccui.TextField.EVENT_DELETE_BACKWARD:
                    break;
                default:
                    break;
            }
        }, this);
        this.addChild(this.textField);
        this.isTextFieldEnabled = false;
        this.textField.opacity = 0;
        this.textField.setTouchEnabled(false);
        //this.textField.setTouchAreaEnabled(false);

        this.schedule(this.speechCheck, 1);
    },
    speechCheck:function() {
        if(this.isRecording) {
            var speech = cc.thinkgear.getSpeech();
            if(speech) {
                this.isRecording = false;
                this.descLabel.string = speech;
                this.answer(speech);
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
    },
    correct:function(isCorrected, answer) {
        if(isCorrected) {
            this.msgLabel.color = cc.color(0, 0, 0);
            this.msgLabel.string = "정답!\n\n" + answer + "!";
        }
        else {
            this.msgLabel.color = cc.color(255, 0, 0);
            this.msgLabel.string = "오답!\n\n" + answer + "!";

            cc.neurostudy.checkNote.push(this.qObject);
        }

        this.chatbubbleSprite.runAction(new cc.Sequence(
            new cc.Spawn(new cc.ScaleTo(0.3, 1), new cc.FadeIn(0.3)),
            new cc.DelayTime(1.5),
            new cc.Spawn(new cc.ScaleTo(0.3, 0), new cc.FadeOut(0.3)),
            new cc.CallFunc(function(sender) {
                sender.parent.q();
            })
        ));
    },
    answer:function(answer) {
        this.descLabel.opacity = 0;
        this.qLabel.opacity = 0;
        this.playMenu.opacity = 0;
        this.playMenu.setEnabled(false);
        this.refreshMenu.opacity = 0;
        this.refreshMenu.setEnabled(false);
        this.micMenu.opacity = 0;
        this.micMenu.setEnabled(false);
        this.aMenu.setEnabled(false);
        this.aMenu.opacity = 0;
        this.textBGSprite.opacity = 0;
        this.textField.opacity = 0;
        this.textField.setString("");
        this.isTextFieldEnabled = false;
        this.textField.setTouchEnabled(false);
        //this.textField.setTouchAreaEnabled(false);

        switch(this.qObject.type) {
            case 0:
            case 3:
                if(this.qObject.korean == answer) {
                    this.correct(true, answer);
                }
                else {
                    this.correct(false, answer);
                }
                break;
            default:
                if(this.qObject.english == answer) {
                    this.correct(true, answer);
                }
                else {
                    this.correct(false, answer);
                }
                break;
        }
    },
    q : function() {
        // 문제를 모두 풀었으면 테스트 끝
        if(this.wordArray.length < 1) {
            cc.neurostudy.checkNote = _.uniq(cc.neurostudy.checkNote, 'english');
            cc.neurostudy.writeCheckNote();

            this.msgLabel.color = cc.color(0, 0, 0);
            this.msgLabel.string = "모두 끝났습니다!"
            this.chatbubbleSprite.runAction(new cc.Sequence(
                new cc.Spawn(new cc.ScaleTo(0.3, 1), new cc.FadeIn(0.3)),
                new cc.DelayTime(1.5),
                new cc.CallFunc(function(sender) {
                    switch(sender.parent.type) {
                        case 0:
                            sender.parent.msgLabel.string = "3초 후에 본격적으로\n뇌파 스터디를 시작합니다!";
                            break;
                        default :
                            sender.parent.parent.resume();
                            sender.parent.parent.wordSet();
                            sender.parent.removeFromParent();
                            break;
                    }
                }),
                new cc.DelayTime(3),
                new cc.CallFunc(function(sender) {
                    switch(sender.parent.type) {
                        case 0:
                            sender.parent.parent.runStudyScene();
                            break;
                        default :
                            sender.parent.removeFromParent();
                            break;
                    }
                })
            ));
            return;
        }

        // 아니면 문제 출제
        var index = Math.floor(Math.random() * (this.wordArray.length));
        index = Math.floor(Math.random() * (this.wordArray.length));

        var type;

        if(cc.neurostudy.isMicEnabled) {
            type = Math.floor(Math.random() * 6);
        }
        else {
            type = Math.floor(Math.random() * 5);
        }

        this.qObject = _.clone(this.wordArray[index]);
        this.wordArray.splice(index, 1);

        this.descLabel.opacity = 255;
        this.qLabel.opacity = 0;
        this.playMenu.opacity = 0;
        this.playMenu.setEnabled(false);
        this.micMenu.opacity = 0;
        this.micMenu.setEnabled(false);
        this.refreshMenu.opacity = 0;
        this.refreshMenu.setEnabled(false);
        this.aMenu.opacity = 0;
        this.aMenu.setEnabled(false);
        this.textBGSprite.opacity = 0;
        this.textField.opacity = 0;
        this.isTextFieldEnabled = false;
        this.textField.setTouchEnabled(false);

        this.qObject.type = type;

        switch(type) {
            case 0:
                this.qLabel.string = this.qObject.english;
                cc.audioEngine.playEffect(this.qObject.mp3);
                this.qLabel.opacity = 255;
                this.descLabel.string = "올바른 한글 뜻을 선택해주세요.";
                this.aMenu.setEnabled(true);
                this.aMenu.opacity = 255;

                if(Math.floor(Math.random() * 2) == 0) {
                    this.a1String = this.qObject.korean;
                    this.a2String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].korean;
                    for(var i = 0;i < 10;i++) if(this.a1String == this.a2String) this.a2String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].korean;

                    this.a1Item.string = this.a1String;
                    this.a2Item.string = this.a2String;

                }
                else {
                    this.a1String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].korean;
                    this.a2String = this.qObject.korean;
                    for(var i = 0;i < 10;i++) if(this.a1String == this.a2String) this.a1String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].korean;

                    this.a1Item.string = this.a1String;
                    this.a2Item.string = this.a2String;
                }
                break;
            case 1:
                this.qLabel.string = this.qObject.korean;
                this.qLabel.opacity = 255;
                this.descLabel.string = "올바른 영어 단어를 선택해주세요.";
                this.aMenu.setEnabled(true);
                this.aMenu.opacity = 255;

                if(Math.floor(Math.random() * 2) == 0) {
                    this.a1String = this.qObject.english;
                    this.a2String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].english;

                    for(var i = 0;i < 10;i++) if(this.a1String == this.a2String) this.a2String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].english;

                    this.a1Item.string = this.a1String;
                    this.a2Item.string = this.a2String;
                }
                else {
                    this.a2String = this.qObject.english;
                    this.a1String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].english;

                    for(var i = 0;i < 10;i++) if(this.a1String == this.a2String) this.a1String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].english;

                    this.a1Item.string = this.a1String;
                    this.a2Item.string = this.a2String;
                }
                break;
            case 2:
                this.qLabel.string = this.qObject.korean;
                this.qLabel.opacity = 255;
                this.descLabel.string = "뜻을 보고 스펠링을 써주세요.";
                this.textBGSprite.opacity = 255;
                this.textField.opacity = 255;
                this.isTextFieldEnabled = true;
                this.textField.setTouchEnabled(true);
                break;
            case 3:
                cc.audioEngine.playEffect(this.qObject.mp3);
                this.playMenu.opacity = 255;
                this.playMenu.setEnabled(true);
                this.descLabel.string = "발음을 듣고 올바른 한글 뜻을 선택해주세요.";
                this.aMenu.setEnabled(true);
                this.aMenu.opacity = 255;

                if(Math.floor(Math.random() * 2) == 0) {
                    this.a1String = this.qObject.korean;
                    this.a2String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].korean;

                    for(var i = 0;i < 10;i++) if(this.a1String == this.a2String) this.a2String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].korean;

                    this.a1Item.string = this.a1String;
                    this.a2Item.string = this.a2String;
                }
                else {
                    this.a2String = this.qObject.korean;
                    this.a1String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].korean;

                    for(var i = 0;i < 10;i++) if(this.a1String == this.a2String) this.a1String = this.originalArray[Math.floor(Math.random() * this.originalArray.length)].korean;

                    this.a1Item.string = this.a1String;
                    this.a2Item.string = this.a2String;
                }
                break;
            case 4:
                cc.audioEngine.playEffect(this.qObject.mp3);
                this.playMenu.opacity = 255;
                this.playMenu.setEnabled(true);
                this.descLabel.string = "발음을 듣고 스펠링을 써주세요.";
                this.textBGSprite.opacity = 255;
                this.textField.opacity = 255;
                this.isTextFieldEnabled = true;
                this.textField.setTouchEnabled(true);
                break;
            default :
                this.qLabel.string = this.qObject.korean;
                this.qLabel.opacity = 255;
                this.micMenu.opacity = 255;
                this.micMenu.setEnabled(true);
                this.refreshMenu.opacity = 255;
                this.refreshMenu.setEnabled(true);
                this.descLabel.string = "마이크 버튼을 눌러서 발음해주세요.";
                break;
        }
    }
});