cc.NeuroStudy = cc.Class.extend({
    STUDY_WORD_LENGTH : 5,
    MAIN_COLOR : null,
    URL : 'http://htmlfive.co.kr/neurostudy/',
    BASIC_PKG : [
        /*{
            "id" : 0,
            "title" : "뇌파 워밍업",
            "desc" : "본격적인 뇌파 학습에 앞서서\n집중하기 좋은 상태의 뇌파로\n바꾸기 위한 워밍업 도구입니다!",
            "price" : 39900,
            "words" : 0,
            "process" : 0,
            "average" : 0,
            "last" : ""
        },
        {
            "id" : 1,
            "title" : "뇌파 쿨다운",
            "desc" : "스터디를 끝낸 후 긴장을 완화하고\n뇌파 상태를 안정적으로 유도하여\n학습의 마무리를 도와주는\n뇌파 쿨다운 도구입니다!",
            "price" : 39900,
            "words" : 0,
            "process" : 0,
            "average" : 0,
            "last" : ""
        },*/
        {
            "id" : 1,
            "src" : "english/basic01/",
            "title" : "기초 1단계",
            "desc" : "일상적으로 많이 쓰이는 단어만을\n쏙쏙 골라 정리한 모음으로서\n처음 영어를 시작하시는 분들께\n강력하게 추천합니다!",
            "price" : 39900,
            "words" : 200,
            "process" : 0,
            "average" : 0,
            "last" : ""
        }
    ],
    BASIC_WORDS_ARRAY : [
        /*{
            english : 'concentrate',
            korean : '집중하다',
            pronounce : 'ˈkɒn·sən·treɪt',
            pronounce_korean : '큰선트레이트',
            desc : "s1. ~ (sth) (on sth/on doing sth) (정신을) 집중하다[집중시키다], 전념하다\n\n2.[타동사][VN + adv. / prep.] (한 곳에) 모으다[집중시키다\n\n3.[타동사][VN] (전문 용어) 농축시키다\n\n1. ~ (sth) (on sth/on doing sth) (정신을) 집중하다[집중시키다], 전념하다\n\n2.[타동사][VN + adv. / prep.] (한 곳에) 모으다[집중시키다\n\n3.[타동사][VN] (전문 용어) 농축시키다\n\n1. ~ (sth) (on sth/on doing sth) (정신을) 집중하다[집중시키다], 전념하다\n\n2.[타동사][VN + adv. / prep.] (한 곳에) 모으다[집중시키다\n\n3.[타동사][VN] (전문 용어) 농축시키다e",
            mp3 : "res/mp3/concentrate.mp3",
            point : 0,
            img : "res/icon/concentrate.png"
        }*/
    ],

    TEST_WORDS_ARRAY : [
    ],

    pkg : [],
    pkgWords : [],
    checkNote : [],
    studyWords : [],
    pkgWords : [],
    reviewWords : [],
    testWords : [],

    studyType : 0,
    selectPackageIndex : 0,

    isStatShow : false,
    isSelectPkgShow : false,
    isMicEnabled : false,
    isThinkgearEnabled : true,

    ctor:function() {

        for(var i = 0;i < 2;i++) {
            this.TEST_WORDS_ARRAY.push({
                english : "영어" + i,
                korean : "뜻" + i,
                pronounce : '발음 '+ i,
                pronounce_korean : '한글발음 ' + i,
                desc : "설명 " + i,
                mp3 : "res/mp3/concentrate.mp3",
                point : 0,
                img : "res/icon/concentrate.png"
            });
        }

        if(cc.sys.localStorage.getItem("mic") == 'false') {
            this.isMicEnabled = false;
        }
        else {
            this.isMicEnabled = true;
        }

        this.checkNote = [];

        this.MAIN_COLOR = cc.color(238, 184, 68);

        for(var i = 0;i < this.BASIC_PKG.length;i++) {
            this.BASIC_PKG[i].last = this.getTimeStamp();
        }

        // 사용 가능 패키지 초기화
        try {
            this.pkg = JSON.parse(cc.sys.localStorage.getItem("pkg"));
            this.pkg = _.sortBy(this.pkg, 'id');

            if(this.pkg.length < 1) {
                this.pkg = this.BASIC_PKG;
                this.savePkg();
            }
        }
        catch(err) {
            this.pkg = this.BASIC_PKG;
            this.savePkg();
        }

        // 체크 노트 불러오기
        this.readCheckNote();

        // 스터디 단어 불러오기
        this.readStudyWords();

        // 리뷰 단어 불러오기
        this.readReviewWords();

        //this.checkNote = this.TEST_WORDS_ARRAY;
    },
    savePkg:function() {
        this.pkg = _.sortBy(this.pkg, 'id');
        cc.sys.localStorage.setItem("pkg", JSON.stringify(this.pkg));
    },
    getTimeStamp:function() {
        var d = new Date();

        var s =
            this.leadingZeros(d.getFullYear(), 4) + '-' +
            this.leadingZeros(d.getMonth() + 1, 2) + '-' +
            this.leadingZeros(d.getDate(), 2) + ' ' +
            this.leadingZeros(d.getHours(), 2) + ':' +
            this.leadingZeros(d.getMinutes(), 2);

        return s;
    },
    leadingZeros : function(n, digits) {
        var zero = '';
        n = n.toString();

        if (n.length < digits) {
            for (i = 0; i < digits - n.length; i++)
                zero += '0';
        }
        return zero + n;
    },
    writeCheckNote : function() {
        try {
            var writablePath = jsb.fileUtils.getWritablePath() + "neurostudy/";
            var fileName = "checknote.plist";
            var fullPath = writablePath + fileName;
            var valueMap = {};

            valueMap["check_note"] = this.checkNote;

            jsb.fileUtils.createDirectory(writablePath);
            if (jsb.fileUtils.writeValueMapToFile(valueMap, fullPath)) {
            }
            else {
            }
        }
        catch(err) {
            cc.log(err);
        }
    },
    readCheckNote : function() {
        try {
            var writablePath = jsb.fileUtils.getWritablePath() + "neurostudy/";
            var fileName = "checknote.plist";
            var fullPath = writablePath + fileName;

            var valueMap = jsb.fileUtils.getValueMapFromFile(fullPath);
            this.checkNote = valueMap["check_note"];
            if(!this.checkNote) this.checkNote = [];
        }
        catch(err) {
            this.checkNote = [];
        }
    },
    writeStudyWords : function() {
        try {
            var writablePath = jsb.fileUtils.getWritablePath() + "neurostudy/";
            var fileName = "studywords.plist";
            var fullPath = writablePath + fileName;

            var valueMap = {};

            valueMap["study_words"] = this.studyWords;

            jsb.fileUtils.createDirectory(writablePath);
            if (jsb.fileUtils.writeValueMapToFile(valueMap, fullPath)) {
            }
            else {
            }
        }
        catch(err) {
            cc.log(err);
        }
    },
    readStudyWords : function() {
        try {
            var writablePath = jsb.fileUtils.getWritablePath() + "neurostudy/";
            var fileName = "studywords.plist";
            var fullPath = writablePath + fileName;
            var valueMap = jsb.fileUtils.getValueMapFromFile(fullPath);
            this.studyWords = valueMap["study_words"];
            if(!this.studyWords) this.studyWords = [];
        }
        catch(err) {
            this.studyWords = _.clone(this.BASIC_WORDS_ARRAY);
        }
    },
    writeReviewWords : function() {
        try {
            var writablePath = jsb.fileUtils.getWritablePath() + "neurostudy/";
            var fileName = "reviewwords.plist";
            var fullPath = writablePath + fileName;

            var valueMap = {};

            valueMap["review_words"] = this.reviewWords;

            jsb.fileUtils.createDirectory(writablePath);
            if (jsb.fileUtils.writeValueMapToFile(valueMap, fullPath)) {
            }
            else {
            }
        }
        catch(err) {
            cc.log(err);
        }
    },
    readReviewWords : function() {
        try {
            var writablePath = jsb.fileUtils.getWritablePath() + "neurostudy/";
            var fileName = "reviewwords.plist";
            var fullPath = writablePath + fileName;
            var valueMap = jsb.fileUtils.getValueMapFromFile(fullPath);
            this.reviewWords = valueMap["review_words"];
            if(!this.reviewWords) this.reviewWords = [];
        }
        catch(err) {
            this.reviewWords = [];
        }
    },
    loadPackageWords : function(type) {
        switch(type) {
            case 1:
                return this.pkgWords[this.selectPackageIndex];
                break;
            default :
                return _.take(_.drop(this.pkgWords[this.selectPackageIndex], this.pkg[this.selectPackageIndex].process), this.STUDY_WORD_LENGTH);
                break;
        }

        /*cc.loader.loadJson("res/package/" + this.pkg[this.selectPackageIndex].src + "words.json", function(error, data) {
            cc.log(data);
            return data;
        });*/
        /*return this.TEST_WORDS_ARRAY;
        if(this.selectPackageID < 1) {
            return this.BASIC_WORDS_ARRAY;
        }*/
    },
    // 오늘의 리뷰 단어 추출
    loadReviewWords : function() {
        var array = [];

        for(var i = 0;i < this.reviewWords.length;i++) {
            var word = _.clone(this.reviewWords[i]);
            var differ = _.now() - word.study_timestamp;

            if(!this.reviewWords[i].review1 && differ >=  24 * 60 * 60 * 1000) {
                word.index = i;
                word.review_type = 1;
                array.push(_.clone(word));
            }

            if(!this.reviewWords[i].review7 && differ >=  7 * 24 * 60 * 60 * 1000) {
                word.index = i;
                word.review_type = 7;
                array.push(_.clone(word));
            }

            if(!this.reviewWords[i].review30 && differ >=  30 * 24 * 60 * 60 * 1000) {
                word.index = i;
                word.review_type = 30;
                array.push(_.clone(word));
            }
        }

        return array;
    }
});