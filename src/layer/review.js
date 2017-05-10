var ReviewLayer = cc.Layer.extend({
    wordArray : [
        {
            english : 'concentrate',
            korean : '집중하다',
            pronounce : 'ˈkɒn·sən·treɪt',
            pronounce_korean : '칸센트레이트',
            desc : "s1. ~ (sth) (on sth/on doing sth) (정신을) 집중하다[집중시키다], 전념하다\n\n2.[타동사][VN + adv. / prep.] (한 곳에) 모으다[집중시키다\n\n3.[타동사][VN] (전문 용어) 농축시키다\n\n1. ~ (sth) (on sth/on doing sth) (정신을) 집중하다[집중시키다], 전념하다\n\n2.[타동사][VN + adv. / prep.] (한 곳에) 모으다[집중시키다\n\n3.[타동사][VN] (전문 용어) 농축시키다\n\n1. ~ (sth) (on sth/on doing sth) (정신을) 집중하다[집중시키다], 전념하다\n\n2.[타동사][VN + adv. / prep.] (한 곳에) 모으다[집중시키다\n\n3.[타동사][VN] (전문 용어) 농축시키다e",
            mp3 : res.concentrate_mp3,
            img : res.concentrate_png
        },
        {
            english : 'earth',
            korean : '지구',
            pronounce : 'ˈkɒn·sən·treɪt',
            pronounce_korean : '어스',
            desc : "지구는 지구다",
            mp3 : res.earth_mp3,
            img : res.earth_png
        },
        {
            english : 'neuro',
            korean : '<신경과 관련 있는>',
            pronounce : 'nʊr.oʊ-',
            pronounce_korean : '뉴로',
            desc : "지구는 지구다\n\n뉴로로로로",
            mp3 : res.neuro_mp3,
            img : res.neuro_png
        }
    ],

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

    }
});

/* 테스트 유형
 1. 영어 -> 한글 뜻

 2. 한글 뜻 -> 영어 단어
 3. 한글 뜻 -> 발음하기
 4. 한글 뜻 -> 영어 단어 쓰기

 5. 발음 듣기 -> 한글 뜻
 6. 발음 듣기 -> 영어 단어 쓰기
 */