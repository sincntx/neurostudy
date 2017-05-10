var WarmUpLayer = cc.Layer.extend({
    connected : false,
    chatbubbleVisible : false,

    blink : 0,
    attention : 0,
    meditation : 0,
    BarMaxCount : 70,
    phase : 0,
    thinkgearUpdateTime : 0,

    brainBar : [],
    meditationBar : [],
    blinkBar : [],

    eyeSprite : null,
    brainwaveSpirte : null,
    mindwaveSprite : null,
    meditationSprite : null,
    chatbubbleSprite : null,

    descLabel : null,
    warmupSprite : null,
    particle : null,
    ctor:function () {
        this.connected = false;
        this.chatbubbleVisible = false;
        this.brainBar = [];
        this.meditationBar = [];
        this.phase = 0;
        this.thinkgearUpdateTime = 0.1;

        this._super();

        var size = cc.winSize;

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        this.addChild(backgroundLayer);

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

        this.warmupSprite = new cc.Sprite(res.warmup_yellow_png);
        this.warmupSprite.attr({
            x : 150,
            y : size.height / 2,
            opacity : 0
        });
        this.addChild(this.warmupSprite);

        var menu = new cc.Menu(settingItem);
        menu.setPosition(cc.p(size.width - 70, size.height - 70));
        this.addChild(menu);

        for (var i = 0; i < this.BarMaxCount; i++) {
            var barItem = new cc.Sprite(res.bar_red_png);
            barItem.attr({
                x: (((size.width - 120) / this.BarMaxCount) * i) + 120,
                y: barItem.height + 10,
                scale: 0.5,
            });
            this.brainBar.push(barItem);
            this.addChild(barItem);

            var barItem2 = new cc.Sprite(res.bar_white_png);
            barItem2.attr({
                x: (((size.width - 120) / this.BarMaxCount) * i) + 120,
                y: barItem2.height + 10,
                scale: 0.5,
                opacity : 0
            });
            this.meditationBar.push(barItem2);
            this.addChild(barItem2);

            var barItem3 = new cc.Sprite(res.bar_red_png);
            barItem3.attr({
                x: (((size.width - 120) / this.BarMaxCount) * i) + 120,
                y: barItem3.height + 10,
                scale: 0.5,
                opacity : 0
            });
            this.blinkBar.push(barItem3);
            this.addChild(barItem3);
        }

        this.eyeSprite = new cc.Sprite(res.eye1_png);
        this.eyeSprite.attr({
            x: 60,
            y: 60,
            scale: 0.5,
            opacity : 0
        });
        this.addChild(this.eyeSprite);

        var animation = new cc.Animation();
        animation.addSpriteFrameWithFile(res.eye1_png);
        animation.addSpriteFrameWithFile(res.eye2_png);
        animation.setDelayPerUnit(0.5);

        this.eyeSprite.runAction(new cc.RepeatForever(new cc.Animate(animation)));

        this.brainwaveSpirte = new cc.Sprite(res.brainwave_yellow_png);
        this.brainwaveSpirte.attr({
            x: 50,
            y: 60,
            scale: 0.7
        });
        this.addChild(this.brainwaveSpirte);

        this.meditationSprite = new cc.Sprite(res.meditation_png);
        this.meditationSprite.attr({
            x : 60,
            y : 60,
            scale : 0.3,
            opacity : 0
        });
        this.addChild(this.meditationSprite);

        this.descLabel = new cc.LabelTTF("", "Arial", 50);
        this.descLabel.attr({
            x : size.width / 2,
            y : size.height / 2,
            opacity : 0
        });

        this.chatbubbleSprite = new cc.Sprite(res.chatbubble_png);
        this.chatbubbleSprite.attr({
            x : 0,
            y : 30,
            anchorX : 0,
            anchorY : 0,
            scale : 0,
            opacity : 0
        });
        this.addChild(this.chatbubbleSprite);

        var connectErrorLabel = new cc.LabelTTF("뇌파 헤드셋의 블루투스\n연결 상태를 확인해주세요!", "Arial", 30);
        connectErrorLabel.attr({
            x : 260,
            y : 260,
            color : cc.color(0, 0, 0)
        });
        this.chatbubbleSprite.addChild(connectErrorLabel);

        this.addChild(this.descLabel);
        this.schedule(this.thinkgearStatus, 0.6);

        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased: function(keyCode, event){
                    if (keyCode == cc.KEY.back) {
                        cc.audioEngine.stopMusic();
                        cc.neurostudy.isSelectPkgShow = true;
                        cc.director.runScene(new MenuScene());
                    }
                }
            }), this);
        }

        /*if(cc.sys.localStorage.getItem("warmup-tutorial") != 'true') {
            this.addChild(new TutorialWarmUpLayer(), 99);
        }*/

        return true;
    },
    thinkgearStatus:function() {
        var status = cc.thinkgear.getStatus();
        var size = cc.winSize;

        if(this.isForceConnected) {
            this.mindwaveSprite.removeFromParent();
            this.mindwaveSprite = new cc.Sprite(res.mindwave_png);
            this.mindwaveSprite.attr({
                x: this.mindwaveSprite.width / 2 + 40,
                y: size.height - this.mindwaveSprite.height / 2 - 20
            });
            this.addChild(this.mindwaveSprite);

            return;
        }

        cc.thinkgear.connect();

        switch(status) {
            case 'connected' :
                if(this.connected == false) {
                    this.chatbubbleSprite.runAction(new cc.Sequence(
                        new cc.Spawn(new cc.ScaleTo(0.3, 0), new cc.FadeOut(0.3)),
                        new cc.CallFunc(function(sender) {
                            sender.parent.chatbubbleVisible = true;
                        })
                    ));
                    this.connected = true;
                    this.schedule(this.thinkgearUpdate, this.thinkgearUpdateTime);
                }

                this.mindwaveSprite.removeFromParent();
                this.mindwaveSprite = new cc.Sprite(res.mindwave_png);
                this.mindwaveSprite.attr({
                    x: this.mindwaveSprite.width / 2 + 40,
                    y: size.height - this.mindwaveSprite.height / 2 - 20
                });
                this.addChild(this.mindwaveSprite);
                break;
            case 'connecting' :
                if(this.connected == true) {
                    this.chatbubbleSprite.runAction(new cc.Sequence(
                        new cc.Spawn(new cc.ScaleTo(0.3, 0), new cc.FadeOut(0.3))
                    ));
                    this.connected = false;
                    this.unschedule(this.thinkgearUpdate);
                }

                if(this.chatbubbleVisible == false) {
                    this.chatbubbleVisible = true;
                    this.chatbubbleSprite.runAction(new cc.Sequence(
                        new cc.Spawn(new cc.ScaleTo(0.3, 1), new cc.FadeIn(0.3))
                    ));
                }

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
                if(this.chatbubbleVisible == false) {
                    this.chatbubbleVisible = true;
                    this.chatbubbleSprite.runAction(new cc.Sequence(
                        new cc.Spawn(new cc.ScaleTo(0.3, 1), new cc.FadeIn(0.3))
                    ));
                }

                if(this.connected == true) {
                    this.connected = false;
                    this.unschedule(this.thinkgearUpdate);
                }

                this.mindwaveSprite.removeFromParent();
                this.mindwaveSprite = new cc.Sprite(res.mindwave_nosignal_png);
                this.mindwaveSprite.attr({
                    x: this.mindwaveSprite.width / 2 + 40,
                    y: size.height - this.mindwaveSprite.height / 2 - 20
                });
                this.addChild(this.mindwaveSprite);
                break;
        }
    },
    thinkgearUpdate:function () {
        switch(this.phase) {
            // 눈 긴장 완화 및 피로 감소 페이즈 - 설명
            /*case 0:
                this.phase = 1;
                this.warmupSprite.runAction(new cc.FadeIn(0.5));
                this.descLabel.runAction(new cc.Sequence(
                    new cc.CallFunc(function(sender) {
                        sender.string = "뇌가 즐거워지는 뇌밍업을 시작합니다."
                    }),
                    new cc.FadeIn(0.5),
                    new cc.DelayTime(1.5),
                    new cc.FadeOut(0.5),
                    new cc.CallFunc(function(sender) {
                        sender.string = "먼저 가볍게 눈의 긴장과 피로를 풀어볼까요?"
                    }),
                    new cc.FadeIn(0.5),
                    new cc.DelayTime(1.5),
                    new cc.FadeOut(0.5),
                    new cc.CallFunc(function(sender) {
                        sender.string = "양쪽 눈을 번갈아 깜빡여서 불을 꺼주세요!";
                    }),
                    new cc.FadeIn(0.5),
                    new cc.DelayTime(1.5),
                    new cc.FadeOut(0.5),
                    new cc.CallFunc(function(sender) {
                        sender.parent.warmupSprite.runAction(new cc.FadeOut(0.5));
                        cc.audioEngine.playMusic(res.birdsong_mp3, true);
                        sender.parent.particle = new cc.ParticleFire();
                        sender.parent.particle.texture = cc.textureCache.addImage(res.fire_png);
                        sender.parent.particle.shapeType = cc.ParticleSystem.BALL_SHAPE;
                        sender.parent.particle.attr({
                            x : cc.winSize.width / 2,
                            y : cc.winSize.height / 2 - 200,
                            anchorX : 0,
                            anchorY : 0,
                            scale : 3
                        });
                        sender.parent.addChild(sender.parent.particle);

                        sender.parent.phase = 2;
                    })
                ));
                break;
            // 눈 긴장 완화 및 피로 감소 페이즈 - 감지
            case 2:
                if(this.blink > 0) {
                    this.showBlinkBar();
                    this.particle.runAction(new cc.ScaleTo(this.thinkgearUpdateTime, this.particle.scale - 0.2));

                    if(this.particle.scale < 0.1) {
                        this.particle.removeFromParent();
                        cc.audioEngine.stopMusic();
                        this.phase = 3;
                    }
                }

                break;*/
            // 집중 페이즈 - 설명
            case 0:
                this.phase = 1;
                this.descLabel.stopAllActions();
                this.warmupSprite.runAction(new cc.FadeIn(0.5));

                this.descLabel.runAction(new cc.Sequence(
                    new cc.CallFunc(function(sender) {
                        sender.string = "뇌가 즐거워지는 뇌밍업을 시작합니다."
                    }),
                    new cc.FadeIn(0.5),
                    new cc.DelayTime(1.5),
                    new cc.FadeOut(0.5),
                    new cc.CallFunc(function(sender) {
                        sender.string = "태양을 오른쪽 끝으로 옮긴다는 생각에 집중해보세요!"
                    }),
                    new cc.FadeIn(0.5),
                    new cc.DelayTime(1.5),
                    new cc.FadeOut(0.5),
                    new cc.CallFunc(function(sender) {
                        sender.parent.warmupSprite.runAction(new cc.FadeOut(0.5));
                        cc.audioEngine.playMusic(res.jungleriver_mp3, true);
                        sender.parent.particle = new cc.ParticleSun();
                        sender.parent.particle.texture = cc.textureCache.addImage(res.fire_png);
                        sender.parent.particle.shapeType = cc.ParticleSystem.BALL_SHAPE;
                        sender.parent.particle.attr({
                            x : cc.winSize.width * 0.1,
                            y : cc.winSize.height / 2,
                            scale : 2
                        });
                        sender.parent.addChild(sender.parent.particle);
                        sender.parent.phase = 5;
                    })
                ));
                break;
            // 집중 페이즈 - 처리
            case 5:
                this.particle.runAction(new cc.MoveBy(this.thinkgearUpdateTime, cc.p(this.attention / 10, 0)));

                if(this.particle.x > cc.winSize.width - 50) {
                    this.particle.removeFromParent();
                    this.phase = 6;
                    cc.audioEngine.stopMusic();
                }

                break;
                // 종료 페이즈
            case 6:
                this.phase = 7;
                this.descLabel.stopAllActions();
                this.warmupSprite.runAction(new cc.FadeIn(0.5));

                if(cc.neurostudy.studyWords.length > 0) {
                    this.descLabel.runAction(new cc.Sequence(
                        new cc.FadeOut(0.5),
                        new cc.CallFunc(function (sender) {
                            sender.string = "대단하시네요! 뇌밍업 좀 되셨나요?"
                        }),
                        new cc.FadeIn(0.5),
                        new cc.DelayTime(1.5),
                        new cc.FadeOut(0.5),
                        new cc.CallFunc(function (sender) {
                            sender.string = "이번에는 가볍게 문제를 즐겨보겠습니다!"
                        }),
                        new cc.FadeIn(0.5),
                        new cc.DelayTime(1.5),
                        new cc.FadeOut(0.5),
                        new cc.CallFunc(function (sender) {
                            sender.parent.addChild(new TestLayer(0), 99);
                        })
                    ));
                }
                else {
                    this.descLabel.runAction(new cc.Sequence(
                        new cc.FadeOut(0.5),
                        new cc.CallFunc(function (sender) {
                            sender.string = "대단하시네요! 뇌밍업 좀 되셨나요?"
                        }),
                        new cc.FadeIn(0.5),
                        new cc.DelayTime(1.5),
                        new cc.FadeOut(0.5),
                        new cc.CallFunc(function (sender) {
                            sender.string = "3초 뒤에 본격적으로 뇌파 스터디를 시작합니다!"
                        }),
                        new cc.FadeIn(0.5),
                        new cc.DelayTime(3),
                        new cc.FadeOut(0.5),
                        new cc.CallFunc(function (sender) {
                            cc.director.runScene(new StudyScene(0));
                        })
                    ));
                }
                break;
        }
        this.warmupSprite.runAction(new cc.MoveTo(this.thinkgearUpdateTime, cc.p(this.descLabel.x - (this.descLabel.width / 2) - 90, this.warmupSprite.y)));

        this.attention = cc.thinkgear.getAttention();
        this.showBrainBar();

        this.meditation = cc.thinkgear.getMeditation();

        this.showMeditationBar();

        this.blink = cc.thinkgear.getBlink();
    },
    runStudyScene:function() {
        cc.director.runScene(new StudyScene(0));
    },
    // 현재 집중도 보여주기
    showBrainBar:function() {
        for(var i = 0;i < this.BarMaxCount;i++) {
            if(this.attention * (this.BarMaxCount / 100) > i) {
                this.brainBar[i].runAction(new cc.ScaleTo(this.thinkgearUpdateTime, 1));
            }
            else {
                this.brainBar[i].runAction(new cc.ScaleTo(this.thinkgearUpdateTime, 0.5));
            }
        }
    },
    // 현재 명상도 보여주기
    showMeditationBar:function() {
        for(var i = 0;i < this.BarMaxCount;i++) {
            if(this.meditation * (this.BarMaxCount / 100) > i) {
                this.meditationBar[i].runAction(new cc.ScaleTo(this.thinkgearUpdateTime, 1));
            }
            else {
                this.meditationBar[i].runAction(new cc.ScaleTo(this.thinkgearUpdateTime, 0.5));
            }
        }
    },
    // 현재 눈깜빡임 강도 보여주기
    showBlinkBar:function() {
        for(var i = 0;i < this.BarMaxCount;i++) {
            if(this.blink * (this.BarMaxCount / 100) > i) {
                this.blinkBar[i].runAction(new cc.ScaleTo(this.thinkgearUpdateTime, 1));
            }
            else {
                this.blinkBar[i].runAction(new cc.ScaleTo(this.thinkgearUpdateTime, 0.5));
            }
        }
    }
});

var WarmUpScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new WarmUpLayer();
        this.addChild(layer);
    }
});

