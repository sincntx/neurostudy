var VocaLayer = cc.Layer.extend({
    pkgArray : [],
    carouselArray : [],
    wordArray : [],

    wordScrollView : null,
    wordScrollBar : null,
    wordMenu : null,

    textField : null,
    textBGSprite : null,
    searchSprite : null,

    englishLabel : null,
    koreanLabel : null,
    descScrollView : null,
    descLabel : null,
    imgSprite : null,
    msgLabel : null,

    playMenu : null,
    micMenu : null,
    checkMenu : null,

    mp3 : '',
    selectedWord : null,

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
        this.addChild(pageView);

        var studySelectBackItem = cc.MenuItemImage.create(res.close_png, res.close_png, function(sender) {
            sender.parent.parent.runAction(new cc.Sequence(
                new cc.FadeOut(0.1),
                new cc.CallFunc(function(sender) {
                    cc.neurostudy.writeCheckNote();
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

        var pageView2 = new ccui.PageView();
        pageView2.setTouchEnabled(true);
        pageView2.setContentSize(cc.size(size.width / 4 + 45, size.height / 3));
        pageView2.x = 0;
        pageView2.y = size.height - pageView2.height;
        pageView2.color = cc.color(255, 255, 255);

        for (var i = 0; i < this.pkgArray.length; i++) {
            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(size.width / 4 + 45, size.height / 4));
            var layoutRect = layout.getContentSize();

            var image = new ccui.ImageView(res.page_white_png);
            image.x = layoutRect.width / 2;
            image.y = 150;
            image.scale = 0.5;
            layout.addChild(image);

            var text = new ccui.Text(this.pkgArray[i].title, "Arial", 35);
            text.color = cc.color(0, 0, 0);
            text.x = layoutRect.width / 2;
            text.y = 170;
            layout.addChild(text);

            pageView2.addPage(layout);
        }

        pageView2.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.PageView.EVENT_TURNING:
                    this.showCarousel(sender.getCurPageIndex());
                    this.showVoca(sender.getCurPageIndex());
                    cc.sys.localStorage.setItem("select-voca", sender.getCurPageIndex());
                    break;
                default:
                    break;
            }
        }, this);

        this.addChild(pageView2);

        for (var i = 1; i < this.pkgArray.length; i++) {
            var circle = new cc.Sprite(res.circle_yellow_png);
            circle.attr({
                x: 260 + ((this.pkgArray.length - 1) / 2 - (i + 0.5)) * 40,
                y: 695,
                opacity: 255,
                scale: 0.04
            });
            this.addChild(circle);
            this.carouselArray.push(circle);
        }

        var pageIndex = cc.sys.localStorage.getItem("select-voca") ? cc.sys.localStorage.getItem("select-voca") : 0;
        pageView2.scrollToPage(pageIndex);
        this.showVoca(pageIndex);

        this.textBGSprite = new cc.Sprite(res.round_white_png);
        this.textBGSprite.attr({
            x : 210,
            y : 580
        });
        this.addChild(this.textBGSprite);

        this.searchSprite = new SimpleMenu(res.search_png, res.search_png, res.search_png, function(sender) {
            sender.runAction(new cc.Sequence(
                new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    //sender.removeFromParent(true);
                }),
                new cc.ScaleTo(0.1, 1)
            ));
        }, this);
        this.searchSprite.attr({
            anchorX : 0.5,
            anchorY : 0.5,
            x : 10,
            y : 340,
            scale : 0.5
        });
        this.addChild(this.searchSprite);

        this.textField = new ccui.TextField("검색할 단어를 입력하세요", "Arial", 30);
        this.textField.anchorX = 0;
        this.textField.x = 18;
        this.textField.y = 579;
        this.textField.setMaxLengthEnabled(true);
        this.textField.setMaxLength(20);
        this.textField.setTouchEnabled(true);
        this.textField.setTextColor(cc.color(0, 0, 0));
        this.textField.addEventListener(function(textField, type){
            switch (type){
                case ccui.TextField.EVENT_ATTACH_WITH_IME:
                    textField.fontSize = 32;
                    this.textBGSprite.runAction(new cc.ScaleTo(0.1, 1.1, 1.1));
                    this.searchSprite.runAction(new cc.MoveBy(0.1, cc.p(15, 0)));
                    textField.setPlaceHolder('');
                    break;
                case ccui.TextField.EVENT_DETACH_WITH_IME:
                    textField.fontSize = 30;
                    this.textBGSprite.runAction(new cc.ScaleTo(0.1, 1, 1));
                    this.searchSprite.runAction(new cc.MoveBy(0.1, cc.p(-15, 0)));
                    textField.setPlaceHolder('검색할 단어를 입력하세요');

                    // 검색
                    if(textField.getString() != '') {
                        var index = -1;
                        for (var i = 0; i < this.wordArray.length; i++) {
                            if (this.wordArray[i].english.indexOf(textField.getString()) > -1) {
                                index = i;
                            }
                        }

                        if (index > -1) {
                            this.wordScrollView.jumpToPercentVertical(index / (this.wordArray.length - 1) * 100 + 1);
                            this.wordScrollBar.jumpToPercent(this.wordScrollView, index / (this.wordArray.length -1));
                            if(textField.getString() == this.wordArray[index].english) {
                                this.showWord({ index : index });
                            }
                        }

                    }
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

        this.englishLabel = new cc.LabelTTF("", "Arial", 50);
        this.englishLabel.attr({
            x : cc.winSize.width / 2 - 80,
            y : cc.winSize.height / 2 + 270,
            color : cc.color(238, 184, 68),
            anchorX : 0
        });
        this.addChild(this.englishLabel);

        this.koreanLabel = new cc.LabelTTF("", "Arial", 50);
        this.koreanLabel.attr({
            x : cc.winSize.width / 2 - 80,
            y : cc.winSize.height / 2 + 200,
            color : cc.color(120, 120, 120),
            anchorX : 0
        });
        this.addChild(this.koreanLabel);

        this.descScrollView = new ccui.ScrollView();
        this.descScrollView.setContentSize(cc.size(cc.winSize.width, 560));
        this.descScrollView.setInnerContainerSize(cc.size(cc.winSize.width, 560));
        this.descScrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.descScrollView.setTouchEnabled(true);
        this.descScrollView.x = 520;
        this.descScrollView.y = 30;
        this.addChild(this.descScrollView);

        this.playMenu = new SimpleMenu(res.option_vol_png, res.option_vol_png, res.option_vol_png, function(sender) {
            sender.runAction(new cc.Sequence(
                new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    if(sender.parent.parent.mp3 != '') cc.audioEngine.playEffect(sender.parent.parent.mp3);
                }),
                new cc.ScaleTo(0.1, 1)
            ));
        }, this);
        this.playMenu.attr({
            anchorX : 0.5,
            anchorY : 0.5,
            x : 650,
            y : 490,
            scale : 0.6,
            opacity : 0
        });
        this.playMenu.setEnabled(false);
        this.addChild(this.playMenu);

        this.micMenu = new SimpleMenu(res.option_mic_png, res.option_mic_png, res.option_mic_png, function(sender) {
            sender.runAction(new cc.Sequence(
                new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    sender.parent.parent.addChild(new DialogMicLayer(sender.parent.parent.selectedWord, 99));
                }),
                new cc.ScaleTo(0.1, 1)
            ));
        }, this);
        this.micMenu.attr({
            anchorX : 0.5,
            anchorY : 0.5,
            x : 650,
            y : 420,
            scale : 0.45,
            opacity : 0
        });
        this.micMenu.setEnabled(false);
        this.addChild(this.micMenu);

        this.checkMenu = new SimpleMenu(res.checkmark_white_png, res.checkmark_white_png, res.checkmark_white_png, function(sender) {
            sender.runAction(new cc.Sequence(
                new cc.ScaleTo(0.1, 1.5),
                new cc.CallFunc(function(sender) {
                    var index = _.findIndex(cc.neurostudy.checkNote, { english : sender.parent.parent.selectedWord.english });
                    if(index > -1) {
                        sender.parent.parent.checkMenu._item.color = cc.color(255, 255, 255);
                        _.pullAt(cc.neurostudy.checkNote, index);
                    }
                    else {
                        sender.parent.parent.checkMenu._item.color = cc.color(238, 184, 68);
                        cc.neurostudy.checkNote.push(sender.parent.parent.selectedWord);
                    }
                }),
                new cc.ScaleTo(0.1, 1)
            ));
        }, this);
        this.checkMenu.attr({
            anchorX : 0.5,
            anchorY : 0.5,
            x : 750,
            y : 260,
            scale : 0.12,
            opacity : 0
        });
        this.checkMenu.setEnabled(false);
        this.addChild(this.checkMenu);

        this.msgLabel = new cc.LabelTTF("단어를 선택해주세요.", "Arial", 60);
        this.msgLabel.attr({
            x : size.width / 2 + 200,
            y : size.height / 2,
            color : cc.color(150, 150, 150)
        });
        this.addChild(this.msgLabel);
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
    showVoca : function(index) {
        var i, scrollSize;
        this.wordArray = cc.neurostudy.loadPackageWords(1);

        if(this.wordArray.length * 100 < 480) {
            scrollSize = 550;
        }
        else {
            scrollSize = this.wordArray.length * 97;
        }

        if(this.wordScrollView) this.wordScrollView.removeFromParent(true);
        this.wordScrollView = new ccui.ScrollView();
        this.wordScrollView.setContentSize(cc.size(435, 480));
        this.wordScrollView.setInnerContainerSize(cc.size(435, scrollSize));
        this.wordScrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.wordScrollView.setTouchEnabled(true);
        this.wordScrollView.x = 0;
        this.wordScrollView.y = 20;
        this.addChild(this.wordScrollView);

        if(this.wordScrollBar) this.wordScrollBar.removeFromParent(true);
        this.wordScrollBar = new ScrollBar(this.wordScrollView, cc.color(cc.color(50, 50, 50, 255)), cc.color(255, 255, 255, 255));
        this.addChild(this.wordScrollBar);

        var wordItemArray = [];

        for(i = 0;i < this.wordArray.length;i++) {
            var wordItem = new cc.MenuItemFont(this.wordArray[i].english,function(sender) {
                this.showWord(sender);
            } ,this);
            wordItem.index = i;
            wordItem.setFontName('Arial');
            wordItem.setFontSize(32);
            wordItem.anchorX = 0;
            wordItemArray.push(wordItem);
        }

        this.wordMenu = new cc.Menu(wordItemArray);
        this.wordMenu.alignItemsVerticallyWithPadding(60);
        this.wordMenu.anchorX = 0;
        this.wordMenu.x = 20;
        this.wordMenu.y = this.wordScrollView.getInnerContainerSize().height - (this.wordArray.length * 48);
        this.wordScrollView.addChild(this.wordMenu);
    },
    showWord : function(sender) {
        this.msgLabel.runAction(new cc.Hide());
        this.mp3 = this.wordArray[sender.index].mp3;
        this.selectedWord = _.clone(this.wordArray[sender.index]);

        if(this.imgSprite) this.imgSprite.removeFromParent();
        this.imgSprite = new cc.Sprite(this.wordArray[sender.index].img);
        this.imgSprite.attr({
            x : cc.winSize.width / 2 - 200,
            y : cc.winSize.height - 245
        });
        this.addChild(this.imgSprite);

        this.englishLabel.string = this.wordArray[sender.index].english + " [" + this.wordArray[sender.index].pronounce + "]";
        this.koreanLabel.string = this.wordArray[sender.index].korean;

        this.playMenu.x = this.koreanLabel.getContentSize().width + 450;
        this.playMenu.setEnabled(true);
        this.playMenu.opacity = 255;

        this.micMenu.x = this.playMenu.x - 30;
        this.micMenu.setEnabled(true);
        this.micMenu.opacity = 255;

        this.checkMenu.x = this.micMenu.x - 170;
        this.checkMenu.setEnabled(true);
        this.checkMenu.opacity = 255;

        if(_.findIndex(cc.neurostudy.checkNote, { english : this.selectedWord.english }) > -1) {
            this.checkMenu._item.color = cc.color(238, 184, 68);
        }
        else {
            this.checkMenu._item.color = cc.color(255, 255, 255);
        }

        if(this.descLabel) this.descLabel.removeFromParent();
        this.descLabel = new cc.LabelTTF(this.wordArray[sender.index].desc, "Arial", 32, cc.size(cc.winSize.width - 600, 0), cc.TEXT_ALIGNMENT_LEFT);
        var scrollViewSize = this.descLabel.getContentSize().height;
        if(this.descLabel.getContentSize().height < 560) scrollViewSize = 560;
        this.descLabel.attr({
            x : 0,
            y : scrollViewSize,
            anchorX : 0,
            anchorY : 1
        });
        this.descScrollView.setInnerContainerSize(cc.size(cc.winSize.width, scrollViewSize));
        this.descScrollView.addChild(this.descLabel);
    }
});