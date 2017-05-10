var MenuLayer = cc.Layer.extend({
    mindwaveSprite : null,
    loadingLayer : null,
    chatbubbleSprite : null,
    pkg : [],
    ctor:function () {
        this._super();

        var size = cc.winSize;
        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        this.addChild(backgroundLayer);

        // 마인드웨이브 연결상태 아이콘
        this.mindwaveSprite = new cc.Sprite(res.mindwave_nosignal_png);
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

        var studyItem = cc.MenuItemImage.create(res.mainmenu_study_png, res.mainmenu_study_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.15, 1.5), new cc.ScaleTo(0.15, 1)));

            if(cc.thinkgear.connected) {
                this.addChild(new SelectPkgLayer(), 99);
                /*if(cc.sys.localStorage.getItem("tutorial-study") != 'true') {
                    this.addChild(new TutorialStudyLayer(), 100);
                }*/
            }
            else {
                /*this.chatbubbleSprite.runAction(new cc.Sequence(
                    new cc.Spawn(new cc.ScaleTo(0.3, 1), new cc.FadeIn(0.3)),
                    new cc.DelayTime(1.5),
                    new cc.Spawn(new cc.ScaleTo(0.3, 0), new cc.FadeOut(0.3))
                ));*/
                this.addChild(new DialogThinkGearLayer(), 99);
            }
        }, this);

        studyItem.attr({
            scale : 0.6
        });

        studyItem.runAction(new cc.Sequence(
            new cc.DelayTime(1),
            new cc.ScaleTo(0.1, 1)
        ));

        var vocaItem = cc.MenuItemImage.create(res.mainmenu_voca_png, res.mainmenu_voca_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 1.5), new cc.ScaleTo(0.1, 1)));
            this.addChild(new VocaLayer(), 99);
        }, this);

        vocaItem.attr({
            scale : 0.6
        });

        vocaItem.runAction(new cc.Sequence(
            new cc.DelayTime(1),
            new cc.ScaleTo(0.1, 1)
        ));

        var statItem = cc.MenuItemImage.create(res.mainmenu_stat_png, res.mainmenu_stat_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 1.5), new cc.ScaleTo(0.1, 1)));
            this.addChild(new StatLayer(), 99);
        }, this);

        statItem.attr({
            scale : 0.6
        });

        statItem.runAction(new cc.Sequence(
            new cc.DelayTime(1),
            new cc.ScaleTo(0.1, 1)
        ));


        /*var storeItem = cc.MenuItemImage.create(res.mainmenu_store_png, res.mainmenu_store_png, function(sender) {
            var layer = this;

            function streamXHREventsToLabel ( xhr, method ) {
                ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach(function (eventname) {
                    xhr["on" + eventname] = function () {
                        switch(eventname) {
                            case 'loadstart' :
                                sender.parent.parent.loadingLayer = new LoadingLayer("서버와 통신 중입니다.");
                                sender.parent.parent.addChild(sender.parent.parent.loadingLayer, 99);
                                break;
                            case 'load':
                                break;
                            default :
                                sender.parent.parent.loadingLayer.hide();
                                break;
                        }
                    }
                });

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                        var response = xhr.responseText;

                        try {
                            layer.addChild(new StoreLayer(JSON.parse(response)), 99);
                        }
                        catch(err) {
                            layer.chatbubbleSprite.runAction(new cc.Sequence(
                                new cc.CallFunc(function(sender) {
                                   sender.children[0].string = "서버 통신 에러!";
                                }),
                                new cc.Spawn(new cc.ScaleTo(0.3, 1), new cc.FadeIn(0.3)),
                                new cc.DelayTime(1.5),
                                new cc.Spawn(new cc.ScaleTo(0.3, 0), new cc.FadeOut(0.3)),
                                new cc.CallFunc(function(sender) {
                                    sender.children[0].string = "뇌파 헤드셋의 블루투스\n연결 상태를 확인해주세요!";
                                })
                            ));
                        }
                    }
                }
            }

            var xhr = cc.loader.getXMLHttpRequest();
            streamXHREventsToLabel(xhr, "GET");
            xhr.open("GET", cc.neurostudy.URL + 'store.php');
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.send();
        }, this);

        storeItem.attr({
            scale : 0.6
        });

        storeItem.runAction(new cc.Sequence(
            new cc.DelayTime(1.1),
            new cc.ScaleTo(0.1, 1)
        ));*/

        var menu = new cc.Menu(studyItem, vocaItem);
        menu.alignItemsHorizontallyWithPadding(studyItem.width * 0.9);
        menu.setPosition(cc.p(size.width / 2, size.height / 3 - 30));
        this.addChild(menu);

        // 설정 아이콘
        var settingItem = new cc.MenuItemImage(res.option_btn_png, res.option_btn_png, function (sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.15, 1.5), new cc.ScaleTo(0.15, 1)));
            this.addChild(new OptionLayer(false), 99);
        }, this);
        settingItem.attr({
            opacity: 0,
            scale : 0.8
        });
        settingItem.runAction(new cc.Sequence(
            new cc.DelayTime(0.5),
            new cc.FadeIn(1)
        ));

        var settingMenu = new cc.Menu(settingItem);
        settingMenu.setPosition(cc.p(size.width - 70, size.height - 70));
        this.addChild(settingMenu);

        var neurostudySprite = new cc.Sprite(res.neurostudy_yellow_png);
        neurostudySprite.attr({
            x : size.width / 2,
            y : size.height / 1.5,
            scale : 1.2,
            opacity : 0
        });
        this.addChild(neurostudySprite);
        neurostudySprite.runAction(new cc.Sequence(
            new cc.FadeIn(1.5)
        ));

        var  brainwaveSprite = new cc.Sprite(res.brainwave_yellow_png);
        brainwaveSprite.attr({
            x : neurostudySprite.x + neurostudySprite.width / 2 + 50,
            y : neurostudySprite.y + neurostudySprite.height + 10,
            opacity : 0
        });
        this.addChild(brainwaveSprite);
        brainwaveSprite.runAction(new cc.Sequence(
            new cc.DelayTime(1),
            new cc.FadeIn(1)
        ));

        this.chatbubbleSprite = new cc.Sprite(res.chatbubble_png);
        this.chatbubbleSprite.attr({
            x : 230,
            y : 300,
            scale : 0,
            anchorX : 0,
            anchorY : 0,
            opacity : 0
        });
        this.addChild(this.chatbubbleSprite);

        var connectErrorLabel = new cc.LabelTTF("뇌파 헤드셋의 블루투스\n연결 상태를 확인해주세요!", "Arial", 30);
        connectErrorLabel.attr({
            x : 260,
            y : 260,
            color : cc.color(0, 0, 0),
            textAlign : cc.TEXT_ALIGNMENT_CENTER
        });
        this.chatbubbleSprite.addChild(connectErrorLabel);

        this.schedule(this.thinkgearStatus, 1.2);

        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased: function(keyCode, event){
                    if (keyCode == cc.KEY.back) {
                        event.getCurrentTarget().addChild(new DialogQuitLayer(), 99);
                    }
                }
            }), this);
        }

        if(cc.neurostudy.isSelectPkgShow) {
            cc.neurostudy.isSelectPkgShow = false;
            this.addChild(new SelectPkgLayer(), 99);
        }

        if(cc.neurostudy.isStatShow) {
            cc.neurostudy.isStatShow = false;
            this.addChild(new StatLayer(), 99);
        }

        // this.addChild(new TestLayer(0), 99);

        //this.addChild(new DialogLoadAssetLayer(), 99);
        // this.addChild(new StatLayer(), 100);

        //this.addChild(new TutorialStudyLayer(), 100);

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
    },
    selectPkg:function() {
        cc.neurostudy.isThinkgearEnabled = false;
        this.addChild(new SelectPkgLayer(), 99);
    }
});

var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MenuLayer();
        this.addChild(layer);
    }
});

