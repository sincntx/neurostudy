var StatLayer = cc.Layer.extend({
    //selectArray : ["오답노트", "집중 & 명상", "스터디 다이어리", "종합"],
    selectArray : ["오답노트"],
    selectMenu : null,
    selectLine : null,

    pageView : null,
    wordMenu : null,
    wordScrollView : null,

    wordArray : [],

    englishLabel : null,
    koreanLabel : null,
    descScrollView : null,
    descLabel : null,
    imgSprite : null,
    msgLabel : null,

    playMenu : null,
    checkNoteMenu : null,
    selectedWord : null,
    selectedIndex : -1,
    mp3 : '',

    concenLine : null,

    studyDiaryDateLabel : null,
    studyDiaryRichText : null,

    checkNoteLayout : null,
    concenNoteLayout : null,

    ctor:function () {
        this._super();

        var size = cc.winSize;

        this.wordArray = _.clone(cc.neurostudy.checkNote);

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        backgroundLayer.opacity = 240;
        this.addChild(backgroundLayer);

        this.pageView = new ccui.PageView();
        this.pageView.setTouchEnabled(true);
        this.pageView.setContentSize(cc.size(size.width, size.height));
        this.pageView.x = (size.width - this.pageView.width) / 2;
        this.pageView.y = (size.height - this.pageView.height) / 2;
        this.addChild(this.pageView);

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

        // 상단 메뉴
        var selectItemArray = [];

        for(var i = 0;i < this.selectArray.length;i++) {
            var selectItem = new cc.MenuItemFont(this.selectArray[i],function(sender) {
                this.clickSelectMenu(sender);
            } ,this);
            selectItem.index = i;
            selectItem.setFontName('Arial');
            selectItem.setFontSize(50);
            selectItem.color = cc.color(80, 80, 80);
            selectItemArray.push(selectItem);
        }

        selectItemArray[0].color = cc.neurostudy.MAIN_COLOR;

        this.selectMenu = new cc.Menu(selectItemArray);
        this.selectMenu.alignItemsHorizontallyWithPadding(120);
        this.selectMenu.attr({
            x : 130,
            //x : size.width / 2 - 170,
            y : size.height - 85
        });
        this.addChild(this.selectMenu);

        this.selectLine = new cc.Sprite(res.pixel_yellow_png);
        this.selectLine.attr({
            x : 130,
            y : 820,
            scaleX : 220,
            scaleY : 3
        });
        this.addChild(this.selectLine);

        // 오답노트
        this.checkNoteLayout = new ccui.Layout();
        var i, scrollSize;

        if(this.wordArray.length * 100 < 700) {
            scrollSize = 700;
        }
        else {
            scrollSize = this.wordArray.length * 97;
        }

        this.wordScrollView = new ccui.ScrollView();
        this.wordScrollView.setContentSize(cc.size(435, 700));
        this.wordScrollView.setInnerContainerSize(cc.size(435, scrollSize));
        this.wordScrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.wordScrollView.setTouchEnabled(true);
        this.wordScrollView.x = 0;
        this.wordScrollView.y = 50;
        this.checkNoteLayout.addChild(this.wordScrollView);

        if(this.wordScrollBar) this.wordScrollBar.removeFromParent(true);
        this.wordScrollBar = new ScrollBar(this.wordScrollView, cc.color(cc.color(50, 50, 50, 255)), cc.color(255, 255, 255, 255));
        this.checkNoteLayout.addChild(this.wordScrollBar);

        var wordItemArray = [];

        for(i = 0;i < this.wordArray.length;i++) {
            var wordItem = new cc.MenuItemFont(this.wordArray[i].english,function(sender) {
                this.showWord(sender.index);
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

        this.englishLabel = new cc.LabelTTF("", "Arial", 50);
        this.englishLabel.attr({
            x : cc.winSize.width / 2 - 80,
            y : cc.winSize.height / 2 + 270,
            color : cc.neurostudy.MAIN_COLOR,
            anchorX : 0
        });
        this.checkNoteLayout.addChild(this.englishLabel);

        this.koreanLabel = new cc.LabelTTF("", "Arial", 50);
        this.koreanLabel.attr({
            x : cc.winSize.width / 2 - 80,
            y : cc.winSize.height / 2 + 200,
            color : cc.color(120, 120, 120),
            anchorX : 0
        });
        this.checkNoteLayout.addChild(this.koreanLabel);

        this.descScrollView = new ccui.ScrollView();
        this.descScrollView.setContentSize(cc.size(cc.winSize.width, 420));
        this.descScrollView.setInnerContainerSize(cc.size(cc.winSize.width, 420));
        this.descScrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.descScrollView.setTouchEnabled(true);
        this.descScrollView.x = 520;
        this.descScrollView.y = 180;
        this.checkNoteLayout.addChild(this.descScrollView);

        this.msgLabel = new cc.LabelTTF("단어를 선택해주세요.", "Arial", 60);
        this.msgLabel.attr({
            x : size.width / 2 + 200,
            y : size.height / 2 - 50,
            color : cc.color(150, 150, 150)
        });

        var checkItem = new cc.MenuItemImage(res.checkmark_yellow_png, res.checkmark_yellow_png, res.checkmark_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleBy(0.1, 2), new cc.ScaleBy(0.1, 0.5)));
            _.pullAt(cc.neurostudy.checkNote, _.findIndex(cc.neurostudy.checkNote, { english : sender.parent.parent.parent.parent.selectedWord.english }));
            sender.parent.parent.parent.parent.parent.addChild(new StatLayer(), 99);
            sender.parent.parent.parent.parent.removeFromParent();
        }, this);

        checkItem.scale = 0.16;

        var studyItem = new cc.MenuItemImage(res.brainwave_yellow_png, res.brainwave_yellow_png, res.brainwave_yellow_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleBy(0.1, 2), new cc.ScaleBy(0.1, 0.5)));
            cc.neurostudy.studyType = 3;
            cc.director.runScene(new StudyScene());
        }, this);

        studyItem.scale = 0.6;
        studyItem.anchorX = 1;

        var playItem = new cc.MenuItemImage(res.option_vol_png, res.option_vol_png, res.option_vol_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleBy(0.1, 2), new cc.ScaleBy(0.1, 0.5)));
            if(sender.parent.parent.parent.parent.mp3) {
                cc.audioEngine.playEffect(sender.parent.parent.parent.parent.mp3);
            }
        }, this);
        playItem.scale = 0.9;

        var micItem = new cc.MenuItemImage(res.option_mic_png, res.option_mic_png, res.option_mic_png, function(sender) {
            sender.runAction(new cc.Sequence(new cc.ScaleBy(0.1, 2), new cc.ScaleBy(0.1, 0.5)));
            sender.parent.parent.parent.parent.addChild(new DialogMicLayer(sender.parent.parent.parent.parent.selectedWord, 99));
        }, this);

        micItem.scale = 0.6;

        var prevItem = new cc.MenuItemFont("＜", function(sender) {
            var layer = sender.parent.parent.parent.parent;

            sender.runAction(new cc.Sequence(new cc.ScaleBy(0.1, 1.5), new cc.ScaleBy(0.1, 0.75)));

            if(layer.selectedIndex - 1 > -1) layer.showWord(layer.selectedIndex - 1);
        } ,this);

        prevItem.setFontName('Arial');
        prevItem.setFontSize(120);
        prevItem.color = cc.color(50, 50, 50);
        prevItem.anchorX = 0;

        var nextItem = new cc.MenuItemFont("＞", function(sender) {
            var layer = sender.parent.parent.parent.parent;

            sender.runAction(new cc.Sequence(new cc.ScaleBy(0.1, 1.5), new cc.ScaleBy(0.1, 0.75)));

            if(layer.selectedIndex < layer.wordArray.length - 1) layer.showWord(layer.selectedIndex + 1);
        } ,this);

        nextItem.setFontName('Arial');
        nextItem.setFontSize(120);
        nextItem.color = cc.color(50, 50, 50);
        nextItem.anchorX = 0;

        this.checkNoteMenu = new cc.Menu(studyItem, checkItem, playItem, micItem, prevItem, nextItem);
        this.checkNoteMenu.opacity = 0;
        this.checkNoteMenu.setEnabled(false);
        this.checkNoteMenu.alignItemsHorizontallyWithPadding(70);
        this.checkNoteMenu.anchorX = 0;
        this.checkNoteMenu.x = size.width / 2 + 200;
        this.checkNoteMenu.y = 70;
        this.checkNoteLayout.addChild(this.checkNoteMenu);

        this.checkNoteLayout.addChild(this.msgLabel);

        this.pageView.addPage(this.checkNoteLayout);

        // 집중 & 명상
        this.concenNoteLayout = new ccui.Layout();

        var i;

        for(i = 0;i <= 100;i+=10) {
            var label = new cc.LabelTTF(i+"", "Arial", "30");
            label.x = 50;
            label.anchorX = 1;
            label.y = ((size.height - 300) / 100) * i + 100;
            this.concenNoteLayout.addChild(label);
        }

        for(i = 0;i < 7;i++) {
            var label = new cc.LabelTTF("10월 0" + i + "일", "Arial", "30");
            label.x = 160 + i * 170;
            label.y = 50;
            this.concenNoteLayout.addChild(label);
        }

        var clabel = new cc.LabelTTF("집중도", "Arial", "40");
        clabel.color = cc.color(242, 144, 62);
        clabel.x = size.width - 300;
        clabel.y = size.height - 200;
        this.concenNoteLayout.addChild(clabel);

        var mlabel = new cc.LabelTTF("명상도", "Arial", "40");
        mlabel.color = cc.color(50, 150, 230);
        mlabel.x = size.width - 300;
        mlabel.y = size.height - 300;
        this.concenNoteLayout.addChild(mlabel);

        var prevItem2 = new cc.MenuItemFont("＜", function(sender) {

        } ,this);
        prevItem2.setFontName('Arial');
        prevItem2.setFontSize(120);
        prevItem2.color = cc.color(50, 50, 50);
        prevItem2.anchorX = 0;

        var nextItem2 = new cc.MenuItemFont("＞", function(sender) {

        } ,this);
        nextItem2.setFontName('Arial');
        nextItem2.setFontSize(120);
        nextItem2.color = cc.color(50, 50, 50);
        nextItem2.anchorX = 0;

        var concenLineMenu = new cc.Menu(prevItem2, nextItem2);
        concenLineMenu.alignItemsHorizontallyWithPadding(40);
        concenLineMenu.anchorX = 0;
        concenLineMenu.x = size.width - 210;
        concenLineMenu.y = 70;
        this.concenNoteLayout.addChild(concenLineMenu);

        this.concenLine = new cc.DrawNode();
        this.concenNoteLayout.addChild(this.concenLine);

        this.drawConcenLine();
        this.pageView.addPage(this.concenNoteLayout);

        // 스터디 다이어리
        var layout3 = new ccui.Layout();
        var prevItem3 = new cc.MenuItemFont("＜", function(sender) {
        } ,this);
        prevItem3.setFontName('Arial');
        prevItem3.setFontSize(120);
        prevItem3.color = cc.color(50, 50, 50);
        prevItem3.anchorX = 0;

        var nextItem3 = new cc.MenuItemFont("＞", function(sender) {
        } ,this);
        nextItem3.setFontName('Arial');
        nextItem3.setFontSize(120);
        nextItem3.color = cc.neurostudy.MAIN_COLOR;
        nextItem3.anchorX = 0;

        var studyDiaryMenu = new cc.Menu(prevItem3, nextItem3);
        studyDiaryMenu.alignItemsHorizontallyWithPadding(40);
        studyDiaryMenu.anchorX = 0;
        studyDiaryMenu.x = size.width - 210;
        studyDiaryMenu.y = 70;
        layout3.addChild(studyDiaryMenu);

        this.studyDiaryDateLabel = new cc.LabelTTF("2015년 10월 20일", "Arial", 48);
        this.studyDiaryDateLabel.attr({
            x : 330,
            y : 720
        });
        layout3.addChild(this.studyDiaryDateLabel);

        var drawNode = new cc.DrawNode();
        drawNode.drawSegment(cc.p(120, this.studyDiaryDateLabel.y - 35), cc.p(size.width - 120, this.studyDiaryDateLabel.y - 35), 1, cc.color(180, 180, 180));
        layout3.addChild(drawNode);

        this.studyDiaryRichText = new ccui.RichText();
        this.studyDiaryRichText.ignoreContentAdaptWithSize(false);
        this.studyDiaryRichText.width = 1200;
        this.studyDiaryRichText.height = size.height - 400;

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "총 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "31분 25초", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "간 뉴로스터디를 이용하셨습니다.", "Arial", 32));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementCustomNode(0, cc.color.WHITE, 255, this.newLine(1220)));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, " 뇌밍업을 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "5분 30초", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "간 실시한 결과, 평균 집중도 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "62.75", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, ", 평균 명상도 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "62.75", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "를 나타냈습니다.", "Arial", 32));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementCustomNode(0, cc.color.WHITE, 255, this.newLine(1215)));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, " 하루 전", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "에 스터디하신 단어 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "30", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "개, ", "Arial", 32));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "일주일 전", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "에 스터디하신 단어 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "30", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "개, ", "Arial", 32));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementCustomNode(0, cc.color.WHITE, 255, this.newLine(1215)));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, " 한달 전", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "에 스터디하신 단어 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "30", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "개를 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "10분", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "간 복습하셨습니다.", "Arial", 32));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementCustomNode(0, cc.color.WHITE, 255, this.newLine(1215)));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, " 뇌파 스터디를 총 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "30분 5초", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "간 실행하여 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "30", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "개의 새로운 단어를 스터디하셨고,", "Arial", 32));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementCustomNode(0, cc.color.WHITE, 255, this.newLine(1215)));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, " 평균 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "62.75", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "의 집중도로 평균 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "8.21초", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "마다 하나의 단어를 학습하였고,", "Arial", 32));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementCustomNode(0, cc.color.WHITE, 255, this.newLine(1215)));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, " 총 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "15", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "개의 단어를 새롭게 체크노트에 추가했습니다.", "Arial", 32));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementCustomNode(0, cc.color.WHITE, 255, this.newLine(1215)));

        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, " 체크노트에서 체크된 단어 ", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(1, cc.neurostudy.MAIN_COLOR, 255, "15개", "Arial", 32));
        this.studyDiaryRichText.pushBackElement(new ccui.RichElementText(0, cc.color.WHITE, 255, "를 스터디하셔서 제외하셨습니다", "Arial", 32));

        this.studyDiaryRichText.attr({
            x : size.width / 2 - 60,
            y : size.height / 2 - 140
        });

        layout3.addChild(this.studyDiaryRichText);

        this.pageView.addPage(layout3);

        // 종합
        var layout4 = new ccui.Layout();

        var drawNode2 = new cc.DrawNode();
        layout4.addChild(drawNode2);

        var label1 = new cc.LabelTTF("누적 이용시간", "Arial", "36");
        label1.attr({
            x : size.width / 4,
            y : 600
        });
        layout4.addChild(label1);
        drawNode2.drawSegment(cc.p(label1.x - 150, label1.y - 30), cc.p(label1.x + 150, label1.y - 30), 2, cc.color(180, 180, 180));

        var label2 = new cc.LabelTTF("하루 평균 실행", "Arial", "36");
        label2.attr({
            x : size.width / 4 * 2,
            y : 600
        });
        layout4.addChild(label2);
        drawNode2.drawSegment(cc.p(label2.x - 150, label1.y - 30), cc.p(label2.x + 150, label1.y - 30), 2, cc.color(180, 180, 180));

        var label3 = new cc.LabelTTF("평균 집중도", "Arial", "36");
        label3.attr({
            x : size.width / 4 * 3,
            y : 600
        });
        layout4.addChild(label3);
        drawNode2.drawSegment(cc.p(label3.x - 150, label1.y - 30), cc.p(label3.x + 150, label1.y - 30), 2, cc.color(180, 180, 180));

        var label4 = new cc.LabelTTF("712", "Arial", "72");
        label4.attr({
            x : size.width / 4 - 40,
            y : 490
        });
        layout4.addChild(label4);

        var label42 = new cc.LabelTTF("시간", "Arial", "40");
        label42.attr({
            anchorX : 0,
            anchorY : 0,
            x : label4.x + (label4.width / 2) + 10,
            y : 460
        });
        layout4.addChild(label42);

        var label5 = new cc.LabelTTF("2.45", "Arial", "72");
        label5.attr({
            x : (size.width / 4 * 2) - 20,
            y : 490
        });
        layout4.addChild(label5);

        var label52 = new cc.LabelTTF("회", "Arial", "40");
        label52.attr({
            anchorX : 0,
            anchorY : 0,
            x : label5.x + (label5.width / 2) + 10,
            y : 460
        });
        layout4.addChild(label52);

        var label6 = new cc.LabelTTF("66.52", "Arial", "72");
        label6.attr({
            x : (size.width / 4 * 3),
            y : 490
        });
        layout4.addChild(label6);

        var label7 = new cc.LabelTTF("스터디 단어", "Arial", "36");
        label7.attr({
            x : size.width / 4,
            y : 300
        });
        layout4.addChild(label7);
        drawNode2.drawSegment(cc.p(label7.x - 150, label7.y - 30), cc.p(label7.x + 150, label7.y - 30), 2, cc.color(180, 180, 180));

        var label8 = new cc.LabelTTF("평균 이용시간", "Arial", "36");
        label8.attr({
            x : size.width / 4 * 2,
            y : 300
        });
        layout4.addChild(label8);
        drawNode2.drawSegment(cc.p(label8.x - 150, label8.y - 30), cc.p(label8.x + 150, label8.y - 30), 2, cc.color(180, 180, 180));

        var label9 = new cc.LabelTTF("평균 명상도", "Arial", "36");
        label9.attr({
            x : size.width / 4 * 3,
            y : 300
        });
        layout4.addChild(label9);
        drawNode2.drawSegment(cc.p(label9.x - 150, label9.y - 30), cc.p(label9.x + 150, label9.y - 30), 2, cc.color(180, 180, 180));


        var label10 = new cc.LabelTTF("9,213", "Arial", "72");
        label10.attr({
            x : size.width / 4 - 30,
            y : 190
        });
        layout4.addChild(label10);

        var label102 = new cc.LabelTTF("단어", "Arial", "40");
        label102.attr({
            anchorX : 0,
            anchorY : 0,
            x : label10.x + (label10.width / 2) + 10,
            y : 160
        });
        layout4.addChild(label102);

        var label11 = new cc.LabelTTF("24.45", "Arial", "72");
        label11.attr({
            x : (size.width / 4 * 2) - 20,
            y : 190
        });
        layout4.addChild(label11);

        var label112 = new cc.LabelTTF("분", "Arial", "40");
        label112.attr({
            anchorX : 0,
            anchorY : 0,
            x : label11.x + (label11.width / 2) + 10,
            y : 160
        });
        layout4.addChild(label112);

        var label12 = new cc.LabelTTF("66.52", "Arial", "72");
        label12.attr({
            x : (size.width / 4 * 3),
            y : 190
        });
        layout4.addChild(label12);

        this.pageView.addPage(layout4);

        this.pageView.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.PageView.EVENT_TURNING:
                    this.showSelectMenu(this.selectMenu.children[sender.getCurPageIndex()]);
                    break;
                default:
                    break;
            }
        }, this);
    },
    showSelectMenu : function(sender) {
        for(var i = 0;i < this.selectMenu.children.length;i++) {
            this.selectMenu.children[i].color = cc.color(80, 80, 80);
        }

        sender.color = cc.neurostudy.MAIN_COLOR;

        var ccp;

        switch(sender.index) {
            case 0:
                ccp = cc.p(130, 820);
                this.selectLine.scaleX = 270;
                break;
            case 1:
                ccp = cc.p(458, 820);
                this.selectLine.scaleX = 300;
                break;
            case 2:
                ccp = cc.p(853, 820);
                this.selectLine.scaleX = 350;
                break;
            case 3:
                ccp = cc.p(1180, 820);
                this.selectLine.scaleX = 270;
                break;
        }

        this.selectLine.runAction(new cc.MoveTo(0.1, ccp));
    },
    clickSelectMenu : function(sender) {
        this.pageView.scrollToPage(sender.index);
    },
    showWord : function(index) {
        this.msgLabel.runAction(new cc.Hide());
        this.selectedIndex = index;
        this.selectedWord = this.wordArray[index];
        this.mp3 = this.wordArray[index].mp3;

        if(this.imgSprite) this.imgSprite.removeFromParent();
        this.imgSprite = new cc.Sprite(this.wordArray[index].img);
        this.imgSprite.attr({
            x : cc.winSize.width / 2 - 200,
            y : cc.winSize.height - 245,
            scale : 0.3
        });
        this.checkNoteLayout.addChild(this.imgSprite);

        this.englishLabel.string = this.wordArray[index].english + " [" + this.wordArray[index].pronounce + "]";
        this.koreanLabel.string = this.wordArray[index].korean;

        if(this.descLabel) this.descLabel.removeFromParent();
        this.descLabel = new cc.LabelTTF(this.wordArray[index].desc, "Arial", 32);
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

        this.checkNoteMenu.setEnabled(true);
        this.checkNoteMenu.opacity = 255;

        this.checkNoteMenu.children[4].color = cc.neurostudy.MAIN_COLOR;
        this.checkNoteMenu.children[5].color = cc.neurostudy.MAIN_COLOR;

        if(index < 1) this.checkNoteMenu.children[4].color = cc.color(50, 50, 50);
        if(index >= this.wordArray.length - 1) this.checkNoteMenu.children[5].color = cc.color(50, 50, 50);
    },
    drawConcenLine : function() {
        var i, val1, val2;

        val1 = Math.floor(Math.random() * 100) + 1;
        val2 = Math.floor(Math.random() * 100) + 1;

        for(i = 0;i < 6;i++) {
            var startPos, endPos;

            startPos = cc.p(160 + i * 170, ((cc.winSize.height - 300) / 100) * val1 + 100);
            val1 = Math.floor(Math.random() * 100) + 1;
            endPos = cc.p(160 + (i + 1) * 170, ((cc.winSize.height - 300) / 100) * val1 + 100);

            this.concenLine.drawSegment(startPos, endPos, 3, cc.color(242, 144, 62));

            startPos = cc.p(160 + i * 170, ((cc.winSize.height - 300) / 100) * val2 + 100);
            val2 = Math.floor(Math.random() * 100) + 1;
            endPos = cc.p(160 + (i + 1) * 170, ((cc.winSize.height - 300) / 100) * val2 + 100);

            this.concenLine.drawSegment(startPos, endPos, 3, cc.color(50, 150, 230));
        }
    },
    newLine : function(width) {
        var node = new cc.Node();
        node.width = width;
        return node;
    }
});