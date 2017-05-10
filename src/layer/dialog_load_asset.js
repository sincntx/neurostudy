var DialogLoadAssetLayer = cc.Layer.extend({
    _am : null,
    _progress : null,
    _percent : 0,
    _percentByFile : 0,
    _loadingBar : null,
    _fileLoadingBar : null,

    ctor:function () {
        var self = this;

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

        var backBtn = new SimpleMenu(res.close_png, res.close_png, res.close_png, function(sender) {
            sender.parent.parent.runAction(new cc.Sequence(
                new cc.FadeOut(0.1),
                new cc.CallFunc(function(sender) {
                    sender.removeFromParent(true);
                })
            ));
            sender.runAction(new cc.ScaleTo(0.1, 1.5));
        }, this);

        backBtn.attr({
            x : 470,
            y : -50,
            scale : 0.3
        });

        this.addChild(backBtn);

        // 에셋 매니저 부분
        try {
            var manifestPath = "res/manifest/basicenglish01.manifest";
            var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "neurostudy/manifest/");

            this._loadingBar = new ccui.LoadingBar(res.slider_progress_png);
            this._loadingBar.x = cc.visibleRect.center.x;
            this._loadingBar.y = cc.visibleRect.top.y - 40;
            this.addChild(this._loadingBar);

            this._fileLoadingBar = new ccui.LoadingBar(res.slider_progress_png);
            this._fileLoadingBar.x = cc.visibleRect.center.x;
            this._fileLoadingBar.y = cc.visibleRect.top.y - 80;
            this.addChild(this._fileLoadingBar);

            this._am = new jsb.AssetsManager(manifestPath, storagePath);
            this._am.retain();

            if (!this._am.getLocalManifest().isLoaded()) {
                cc.log("Fail to update assets, step skipped.");
            }
            else {
                var that = this;
                var listener = new jsb.EventListenerAssetsManager(this._am, function (event) {
                    var scene;
                    switch (event.getEventCode()) {
                        case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                            cc.log("No local manifest file found, skip assets update.");
                            break;
                        case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                            that._percent = event.getPercent();
                            that._percentByFile = event.getPercentByFile();

                            var msg = event.getMessage();
                            if (msg) {
                                cc.log(msg);
                            }
                            cc.log(that._percent + "%");
                            break;
                        case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                        case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                            cc.log("Fail to download manifest file, update skipped.");
                            break;
                        case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        case jsb.EventAssetsManager.UPDATE_FINISHED:
                            cc.log("Update finished. " + event.getMessage());
                            self.updateFinish();
                            break;
                        case jsb.EventAssetsManager.UPDATE_FAILED:
                            cc.log("Update failed. " + event.getMessage());

                            __failCount++;
                            if (__failCount < 5) {
                                that._am.downloadFailedAssets();
                            }
                            else {
                                cc.log("Reach maximum fail count, exit update process");
                                __failCount = 0;
                                cc.director.runScene(scene);
                            }
                            break;
                        case jsb.EventAssetsManager.ERROR_UPDATING:
                            cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
                            break;
                        case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                            cc.log(event.getMessage());
                            break;
                        default:
                            break;
                    }
                });

                cc.eventManager.addListener(listener, 1);

                this._am.update();
            }

            this.schedule(this.updateProgress, 0.5);
        }
        catch(err) {
            cc.log(err);
        }
    },
    updateProgress : function () {
        this._loadingBar.setPercent(this._percent);
        this._fileLoadingBar.setPercent(this._percentByFile);
    },
    onExit : function () {
        if(this._am) this._am.release();
        this._super();
    },
    updateFinish : function () {
        var self = this;

        cc.loader.load([jsb.fileUtils.getWritablePath() + "neurostudy/manifest/concentrate2.png"], function(err, results){
            if(err){
                cc.log("Failed to load.");
                return;
            }

            cc.log(jsb.fileUtils.getWritablePath() + "neurostudy/manifest/concentrate2.png : " + results[0]);

            var sprite = new cc.Sprite(jsb.fileUtils.getWritablePath() + "neurostudy/manifest/concentrate2.png");
            sprite.attr({
                x : cc.winSize.width / 2,
                y : cc.winSize.height / 2
            });
            self.addChild(sprite);
        });

        cc.loader.load(["concentrate2.png"], function(err, results){
            if(err){
                cc.log("Failed to load.");
                return;
            }

            cc.log("concentrate2.png : " + results[0]);

            var sprite = new cc.Sprite("concentrate2.png");
            sprite.attr({
                x : cc.winSize.width / 2,
                y : cc.winSize.height / 2
            });
            self.addChild(sprite);
        });
    }
});