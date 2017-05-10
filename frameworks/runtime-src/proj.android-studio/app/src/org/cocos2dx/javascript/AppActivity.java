/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2011      Zynga Inc.
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
package org.cocos2dx.javascript;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Process;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;

import com.neurocloud.neurostudy.ThinkGear;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;

import java.lang.Thread.UncaughtExceptionHandler;
import java.util.ArrayList;

public class AppActivity extends Cocos2dxActivity {
    static ThinkGear thinkGear = null;
    static Intent speechIntent;
    static SpeechRecognizer mRecognizer;
    static String speechString = "";
    static Boolean isRecording = false;

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        Thread.setDefaultUncaughtExceptionHandler(new MyUncaughtExceptionHandler());

        speechIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        speechIntent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
        speechIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");

        mRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        mRecognizer.setRecognitionListener(recognitionListener);

        return glSurfaceView;
    }

    public static String getAndroidID() {
        try {
            return Settings.Secure.ANDROID_ID;
        } catch(Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    public static boolean isRecording() {
        return isRecording;
    }

    public static boolean record() {
        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(new Runnable() {
            @Override
            public void run() {
                // TODO Auto-generated method stub
                try{
                    speechString = "";
                    if(!isRecording) {
                        isRecording = true;
                        mRecognizer.startListening(speechIntent);
                        Log.w("neurostudy", "start record");
                    }
                } catch(Exception e){
                    e.printStackTrace();
                }
            }
        });

        return true;
    }

    public static String getSpeech() {
        try {
            return speechString;
        } catch(Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    public static String getStatus() {
        try {
            return thinkGear.tgData().status();
        } catch(Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    public static boolean isConnecting() {
        try{
            if(thinkGear == null) return false;
            if(!thinkGear.isConnecting()) return false;
            return true;
        } catch(Exception ex){
            return false;
        }
    }

    public static boolean connect() {
        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(new Runnable() {
            @Override
            public void run() {
                // TODO Auto-generated method stub
                try{
                    thinkGear = new ThinkGear();
                    thinkGear.connect();
                } catch(Exception e){
                    e.printStackTrace();
                }
            }
        });

        return true;
    }

    public static int getEeg(int type) {
        try {
            return thinkGear.tgData().eeg()[type];
        } catch(Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public static int getAttention() {
        try {
            return thinkGear.tgData().attention();
        } catch(Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public static int getMeditation() {
        try {
            return thinkGear.tgData().meditation();
        } catch(Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public static int getPoorSignal() {
        try {
            return thinkGear.tgData().poor_signal();
        } catch(Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public static int getBlink() {
        try {
            return thinkGear.tgData().blink();
        } catch(Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if(thinkGear != null) {
            Log.d("neurostudy", "thinkGear Disconnect");
            thinkGear.disconnect();
        }

        Log.d("neurostudy", "killProcess");
        android.os.Process.killProcess(Process.myPid());
    }

    public void exit(){
        Log.d("neurostudy", "exit");

        if(thinkGear != null) {
            Log.d("neurostudy", "thinkGear Disconnect");
            thinkGear.disconnect();
        }

        Log.d("neurostudy", "killProcess");
        android.os.Process.killProcess(Process.myPid());
    }

    public class MyUncaughtExceptionHandler implements UncaughtExceptionHandler {
        @Override
        public void uncaughtException(Thread th, Throwable e) {
            String msg = "uncaughtException - "+e.toString();
            Log.d("neurostudy", msg);
            exit();
        }
    }

    private RecognitionListener recognitionListener = new RecognitionListener() {

        @Override
        public void onRmsChanged(float rmsdB) {
            // TODO Auto-generated method stub

        }

        @Override
        public void onResults(Bundle results) {
            // TODO Auto-generated method stub
            String key = "";
            key = SpeechRecognizer.RESULTS_RECOGNITION;
            ArrayList<String> mResult = results.getStringArrayList(key);
            String[] rs = new String[mResult.size()];
            mResult.toArray(rs);
            speechString = "" + rs[0];
            Log.w("neurostudy", "speech - " + speechString);
        }

        @Override
        public void onReadyForSpeech(Bundle params) {
            // TODO Auto-generated method stub

        }

        @Override
        public void onPartialResults(Bundle partialResults) {
            // TODO Auto-generated method stub

        }

        @Override
        public void onEvent(int eventType, Bundle params) {
            // TODO Auto-generated method stub

        }

        @Override
        public void onError(int error) {
            // TODO Auto-generated method stub
            Log.w("neurostudy", "record error : " + error);
            isRecording = false;
        }

        @Override
        public void onEndOfSpeech() {
            // TODO Auto-generated method stub
            Log.w("neurostudy", "record end" + speechString);
            isRecording = false;
        }

        @Override
        public void onBufferReceived(byte[] buffer) {
            // TODO Auto-generated method stub

        }

        @Override
        public void onBeginningOfSpeech() {
            // TODO Auto-generated method stub

        }
    };
}
