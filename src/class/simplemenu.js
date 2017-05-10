var SimpleMenu = cc.Menu.extend({
    _item : null,
    ctor:function(image1, image2, image3, callback, target) {
        this._super();
        this._item = new cc.MenuItemImage(image1, image2, image3, callback, target);
        this.addChild(this._item);
    }
});