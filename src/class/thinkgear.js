cc.ThinkGear = cc.Class.extend({
    connected : false,
    isConnecting : false,
    testAttention : 50,
    testBlink : 50,
    testMeditation : 50,
    testSpeech : 'unknown',
    speech : '',
    ctor:function() {
        // 음량 설정
        var vol = cc.sys.localStorage.getItem("vol") ? cc.sys.localStorage.getItem("vol") : 100;
        cc.audioEngine.setEffectsVolume(vol);
        cc.audioEngine.setMusicVolume(vol);

        this.connect();
    },
    connect:function() {
        // 웹 모드에서는 무조건 커넥트
        if(!cc.sys.isNative) {
            this.isConnecting = true;
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID) {
            var isConnecting = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "isConnecting", "()Z");
            //var status = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getStatus", "()Ljava/lang/String;");

            if(!isConnecting) {
                if(!this.isConnecting) {
                    this.isConnecting = true;
                    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "connect", "()Z");
                }
            }
        }
    },
    getStatus:function() {
        // 웹 모드에서는 무조건 커넥트
        if(!cc.sys.isNative) {
            //return 'fail';
            this.isConnecting = false;
            this.connected = true;
            return 'connected';
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID) {
            var status = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getStatus", "()Ljava/lang/String;");

            if(status == 'connected') {
                this.isConnecting = false;
                this.connected = true;
            }
            else {
                if(status == 'fail') {
                    this.isConnecting = false;
                }

                this.connected = false;
            }

            return status;
        }
    },
    getAttention:function() {
        if(!cc.sys.isNative) {
            return this.testAttention;
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID) {
            if(this.connected) return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getAttention", "()I");
            return this.testAttention;
        }
    },
    getBlink:function() {
        if(!cc.sys.isNative) {
            return this.testBlink;
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID) {
            if(this.connected) return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getBlink", "()I");
            return this.testBlink;
        }
    },
    getMeditation:function() {
        if(!cc.sys.isNative) {
            return this.testMeditation;
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID) {
            if(this.connected) return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getMeditation", "()I");
            return this.testMeditation;
        }
    },

    // 음성 인식 관련
    isRecording:function() {
        if(cc.sys.isNative) {
            if(cc.sys.os == cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "isRecording", "()Z");
            }
        }
        return false;
    },
    record:function() {
        if(cc.sys.isNative) {
            if(cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "record", "()Z");
            }
        }
    },
    getSpeech:function() {
        if(!cc.sys.isNative) {
            return this.testSpeech;
        }
        else if(cc.sys.os == cc.sys.OS_ANDROID) {
            this.speech = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getSpeech", "()Ljava/lang/String;");
            return this.speech;
        }
    },

    // 기기 고유값 획득
    getAndroidID:function() {
        if(cc.sys.isNative) {
            if(cc.sys.os == cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getAndroidID", "()Ljava/lang/String;");
            }
        }
    }
});