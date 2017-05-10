var OptionLayer = cc.Layer.extend({
    vol : 0,
    isResumeUpdate : false,
    ctor:function (isResumeUpdate) {
        var self = this;

        this._super();

        this.isResumeUpdate = isResumeUpdate;

        this.vol = cc.sys.localStorage.getItem("vol") ? cc.sys.localStorage.getItem("vol") : 100;

        var size = cc.winSize;

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        backgroundLayer.opacity = 220;
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
                    if(sender.isResumeUpdate) {
                        sender.parent.resume();
                    }
                    sender.removeFromParent(true);
                })
            ));
            sender.runAction(new cc.ScaleTo(0.1, 1.5));
        }, this);

        backBtn.attr({
            x : 420,
            y : 0,
            scale : 0.3
        });

        this.addChild(backBtn);

        var okBtn = new SimpleMenu(res.checkmark_yellow_png, res.checkmark_yellow_png, res.checkmark_yellow_png, function(sender) {
            sender.parent.parent.runAction(new cc.Sequence(
                new cc.FadeOut(0.1),
                new cc.CallFunc(function(sender) {
                    if(sender.isResumeUpdate) {
                        sender.parent.resume();
                    }

                    // 음량 설정
                    cc.audioEngine.setEffectsVolume(sender.vol);
                    cc.audioEngine.setMusicVolume(sender.vol);
                    cc.sys.localStorage.setItem("vol", sender.vol);
                    sender.removeFromParent(true);
                })
            ));
        }, this);

        okBtn.attr({
            x : 150,
            y : 50,
            scale : 0.4
        });

        this.addChild(okBtn);

        var volSprite = new cc.Sprite(res.option_vol_png);
        volSprite.attr({
            x : size.width / 2 - 300,
            y : size.height - 300
        });
        this.addChild(volSprite);

        // 볼륨 슬라이더
        var slider = new cc.ControlSlider(res.slider_track_png, res.slider_progress_png, res.slider_cursor_png);
        slider.anchorX = 0.5;
        slider.anchorY = 1.0;
        slider.scale = 2;
        slider.setMinimumValue(0.0);
        slider.setMaximumValue(100.0);
        slider.x = size.width / 2 + 50;
        slider.y = size.height - 275;
        slider.setValue(this.vol);
        slider.addTargetWithActionForControlEvents(this, function (sender, controlEvent) {
            sender.parent.vol = sender.getValue().toFixed(2);
        }, cc.CONTROL_EVENT_VALUECHANGED);
        this.addChild(slider);

        var mainmenuItem = new cc.MenuItemImage(res.home_png, res.home_png, res.home_png, function(sender) {
            cc.director.runScene(new MenuScene());
        } ,this);

        mainmenuItem.color = cc.neurostudy.MAIN_COLOR;
        mainmenuItem.scale = 0.8;

        var mainmenuMenu = new cc.Menu(mainmenuItem);
        mainmenuMenu.x = size.width - 100;
        mainmenuMenu.y = size.height - 100;
        this.addChild(mainmenuMenu);

        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.KEYBOARD,
                onKeyReleased: function(keyCode, event){
                    if (keyCode == cc.KEY.back) {
                        this.runAction(new cc.Sequence(
                            new cc.FadeOut(0.1),
                            new cc.CallFunc(function(sender) {
                                if(sender.isResumeUpdate) {
                                    sender.parent.resume();
                                }

                                sender.removeFromParent(true);
                            })
                        ));
                    }
                }
            }), this);
        }
    }
});