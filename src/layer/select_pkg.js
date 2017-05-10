var SelectPkgLayer = cc.Layer.extend({
    pkgArray : [],
    carouselArray : [],
    ctor:function () {
        this._super();

        this.carouselArray = [];
        this.pkgArray = cc.neurostudy.pkg;

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

        for (var i = 0; i < this.pkgArray.length; i++) {
            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(size.width, size.height));
            var layoutRect = layout.getContentSize();

            var image = new ccui.ImageView(res.page_white_png);
            image.x = layoutRect.width / 2;
            image.y = layoutRect.height / 2 + 100;
            layout.addChild(image);

            var text = new ccui.Text(this.pkgArray[i].title, "Arial", 40);
            text.color = cc.color(0, 0, 0);
            text.x = 740;
            text.y = 795;
            layout.addChild(text);

            var text2 = new ccui.Text(this.pkgArray[i].desc , "Arial", 32);
            text2.color = cc.color(150, 150, 150);
            text2.x = 795;
            text2.y = 630;
            layout.addChild(text2);

            var line = new ccui.Text("――――――――――――――――――", "Arial", 28);
            line.color = cc.color(0, 0, 0);
            line.x = 795;
            line.y = 490;
            layout.addChild(line);

            var text3 = new ccui.Text("학습 진행률 : " + _.round(this.pkgArray[i].process / this.pkgArray[i].words * 100, 2) + "% (" + this.pkgArray[i].process + "/" + this.pkgArray[i].words + ")\n평균 집중도 : " + this.pkgArray[i].average + "\n마지막 학습 : " + this.pkgArray[i].last, "Arial", 30);
            text3.color = cc.color(100, 100, 100);
            text3.x = 795;
            text3.y = 395;
            layout.addChild(text3);

            pageView.addPage(layout);

            var circle = new cc.Sprite(res.circle_white_png);
            circle.attr({
                x : (size.width / 2) + (this.pkgArray.length / 2 - (i + 0.5)) * 50,
                y : 100,
                opacity : 100,
                scale : 0.05
            });
            this.addChild(circle);
            this.carouselArray.push(circle);
        }

        pageView.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.PageView.EVENT_TURNING:
                    this.showCarousel(sender.getCurPageIndex());
                    cc.sys.localStorage.setItem("select-pkg", sender.getCurPageIndex());
                    cc.neurostudy.selectPackageIndex = sender.getCurPageIndex();
                    break;
                default:
                    break;
            }
        }, this);

        this.addChild(pageView);

        var pageIndex = cc.sys.localStorage.getItem("select-pkg") ? cc.sys.localStorage.getItem("select-pkg") : 0;
        this.showCarousel(pageIndex);
        if(pageIndex > 0) pageView.scrollToPage(pageIndex);
        cc.neurostudy.selectPackageID = this.pkgArray[pageIndex].id;

        var studyItem = cc.MenuItemImage.create(res.checkmark_yellow_png, res.checkmark_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 0.9),
            new cc.ScaleTo(0.1, 0.6)));

            if(cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].process >= cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].words) {
                this.addChild(new DialogNewStudyLayer(), 99);
            }
            else {
                if(cc.neurostudy.isThinkgearEnabled) {
                    this.addChild(new DialogWarmUpLayer(), 99);
                }
                else {
                    this.warmup(1);
                }
            }
        }, this);

        studyItem.attr({
            x : studyItem.width,
            scale : 0.6
        });

        var menu = new cc.Menu(studyItem);
        menu.setPosition(cc.p(size.width / 2, 200));
        this.addChild(menu);

        var studySelectBackItem = cc.MenuItemImage.create(res.close_png, res.close_png, function(sender) {
            sender.parent.parent.runAction(new cc.Sequence(
                new cc.FadeOut(0.1),
                new cc.CallFunc(function(sender) {
                    sender.removeFromParent(true);
                })
            ));
            sender.runAction(new cc.ScaleTo(0.1, 0.2));
        }, this);

        studySelectBackItem.attr({
            x : size.width - studySelectBackItem.width / 2 + 170,
            y : size.height - 80,
            scale : 0.15
        });

        var studySelectBackMenu = new cc.Menu(studySelectBackItem);
        studySelectBackMenu.attr({
            x : 0,
            y : 0
        });

        this.addChild(studySelectBackMenu);

        // 마이크 토글
        var micItem = new cc.MenuItemToggle(
            new cc.MenuItemImage(res.option_micoff_png),
            new cc.MenuItemImage(res.option_mic_png)
            );
        micItem.setCallback(function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.15, 1.5), new cc.ScaleTo(0.15, 1)));

            if(cc.neurostudy.isMicEnabled) {
                cc.neurostudy.isMicEnabled = false;
                cc.sys.localStorage.setItem("mic", "false");
            }
            else {
                cc.neurostudy.isMicEnabled = true;
                cc.sys.localStorage.setItem("mic", "true");
            }
        }, this);

        micItem.setSelectedIndex(cc.neurostudy.isMicEnabled ? 1 : 0);

        var optionMenu = new cc.Menu(micItem);
        optionMenu.setPosition(cc.p(150, 150));
        this.addChild(optionMenu);

        if(!cc.neurostudy.isThinkgearEnabled) {
            var thinkgearSprite = new cc.Sprite(res.mindwave_nosignal_png);
            thinkgearSprite.attr({
                x : 340,
                y : 150,
                scale : 1.3
            });
            this.addChild(thinkgearSprite);
        }
    },
    showCarousel : function(index) {
        var i;
        index = this.carouselArray.length - index - 1;
        for(i = 0;i < this.carouselArray.length;i++) {
            if(i == index) {
                this.carouselArray[i].runAction(new cc.FadeIn(0.1));
            }
            else {
                this.carouselArray[i].runAction(new cc.FadeTo(0.1, 100));
            }
        }
    },
    warmup : function(select) {
        switch(select) {
            case 0:
                cc.director.runScene(new WarmUpScene());
                break;
            case 1:
                if(cc.neurostudy.loadReviewWords().length > 0) {
                    this.addChild(new DialogReviewLayer(), 99);
                }
                else {
                    cc.neurostudy.studyType = 0;
                    cc.director.runScene(new StudyScene());
                }
                break;
        }
    },
    review : function(select) {
        switch(select) {
            case 0:
                cc.neurostudy.studyType = 1;
                cc.director.runScene(new StudyScene());
                break;
            case 1:
                cc.neurostudy.studyType = 0;
                cc.director.runScene(new StudyScene());
                break;
        }
    },
    newStudy : function() {
        cc.neurostudy.pkg[cc.neurostudy.selectPackageIndex].process = 0;
        cc.neurostudy.savePkg();

        if(cc.neurostudy.isThinkgearEnabled) {
            this.addChild(new DialogWarmUpLayer(), 99);
        }
        else {
            this.warmup(1);
        }
    }
});