var StoreLayer = cc.Layer.extend({
    pkgArray : [],
    carouselArray : [],

    pageView : null,
    chatbubbleSprite : null,

    curPage : 0,
    ctor:function (storeArray) {
        this._super();

        this.carouselArray = [];
        this.pkgArray = storeArray;

        for(var i = 0; i < this.pkgArray.length; i++) {
            for(var j  = 0;j < cc.neurostudy.pkg.length; j++) {
                if(cc.neurostudy.pkg[j].id == this.pkgArray[i].id) {
                    this.pkgArray.splice(i, 1);
                }
            }
        }

        var size = cc.winSize;

        var backgroundLayer = new cc.LayerColor();
        backgroundLayer.setColor(cc.color(0,0,0));
        backgroundLayer.opacity = 230;
        this.addChild(backgroundLayer);

        this.pageView = new ccui.PageView();
        this.pageView.setTouchEnabled(true);
        this.pageView.setContentSize(cc.size(size.width, size.height));
        this.pageView.x = (size.width - this.pageView.width) / 2;
        this.pageView.y = (size.height - this.pageView.height) / 2;

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
            line.y = 440;
            layout.addChild(line);

            var text3 = new ccui.Text("₩ " + this.comma(this.pkgArray[i].price) , "Arial", 50);
            text3.color = cc.color(100, 100, 100);
            text3.x = 795;
            text3.y = 365;
            layout.addChild(text3);

            this.pageView.addPage(layout);

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

        this.pageView.addEventListener(function (sender, type) {
            switch (type) {
                case ccui.PageView.EVENT_TURNING:
                    this.showCarousel(sender.getCurPageIndex());
                    break;
                default:
                    break;
            }
        }, this);

        this.addChild(this.pageView);
        this.showCarousel(0);

        var studyItem = cc.MenuItemImage.create(res.purchase_png, res.purchase_png, function(sender) {
            this.chatbubbleSprite.runAction(new cc.Sequence(
                new cc.CallFunc(function(sender) {
                    sender.children[0].string = "성공적으로 구매하셨습니다!";
                }),
                new cc.Spawn(new cc.ScaleTo(0.3, 1), new cc.FadeIn(0.3)),
                new cc.DelayTime(1.5),
                new cc.Spawn(new cc.ScaleTo(0.3, 0), new cc.FadeOut(0.3))
            ));

            // 구매 처리
            var index = sender.parent.parent.pageView.getCurPageIndex();
            var item = this.pkgArray[index];
            item.process = 0;
            item.average = 0;
            item.last = cc.neurostudy.getTimeStamp();
            cc.neurostudy.pkg.push(item);
            cc.neurostudy.pkg = _.sortBy(cc.neurostudy.pkg, 'id');
            cc.neurostudy.savePkg();

            sender.runAction(new cc.Sequence(new cc.ScaleTo(0.1, 0.7),
            new cc.ScaleTo(0.1, 0.5)));

            sender.parent.parent.pageView.removePageAtIndex(index);

            for(var i = 0;i < this.carouselArray.length;i++) {
                this.carouselArray[i].removeFromParent();
            }

            this.carouselArray = [];

            for(var i = 0;i < this.pageView.getPages().length;i++) {
                var circle = new cc.Sprite(res.circle_white_png);
                circle.attr({
                    x : (size.width / 2) + (this.pageView.getPages().length / 2 - (i + 0.5)) * 50,
                    y : 100,
                    opacity : 100,
                    scale : 0.05
                });
                this.addChild(circle);
                this.carouselArray.push(circle);
            }

            if(index > this.carouselArray.length - 1) index = this.carouselArray.length - 1;
            this.showCarousel(index);

            if(this.carouselArray.length < 1) {
                sender.removeFromParent();

                var label = new cc.LabelTTF("구매하실 수 있는 상품이 없습니다.", "Arial", 60);
                label.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
                this.addChild(label);
            }
        }, this);

        studyItem.attr({
            x : studyItem.width,
            scale : 0.5
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

        if(this.carouselArray.length < 1) {
            menu.removeFromParent();
            var label = new cc.LabelTTF("구매하실 수 있는 상품이 없습니다.", "Arial", 60);
            label.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2));
            this.addChild(label);
        }

        this.chatbubbleSprite = new cc.Sprite(res.chatbubble_png);
        this.chatbubbleSprite.attr({
            x : 0,
            y : 0,
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
            color : cc.color(0, 0, 0)
        });
        this.chatbubbleSprite.addChild(connectErrorLabel);
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
    comma : function(num) {
        var len, point, str;

        num = num + "";
        point = num.length % 3 ;
        len = num.length;

        str = num.substring(0, point);
        while (point < len) {
            if (str != "") str += ",";
            str += num.substring(point, point + 3);
            point += 3;
        }

        return str;
    }
});