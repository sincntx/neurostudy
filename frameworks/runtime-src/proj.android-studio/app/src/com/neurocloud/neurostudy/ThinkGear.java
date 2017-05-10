package com.neurocloud.neurostudy;

import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.bluetooth.BluetoothAdapter;
import com.neurosky.thinkgear.TGDevice;
import com.neurosky.thinkgear.TGEegPower;

public class ThinkGear {
	BluetoothAdapter bluetoothAdapter=null;
	TGDevice tgDevice=null;
	TGEegPower tgEegPower=null;
	TGData tgData = new TGData();
	final boolean rawEnabled = false;
	boolean isConnecting = false;

	public ThinkGear(){
		createTGDevice();
	}

	private void createTGDevice(){
		bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
		if(bluetoothAdapter == null) {
			Log.w("neurostudy", "Bluetooth not available");
		}else {
			tgDevice = new TGDevice(bluetoothAdapter, handler);
			if(tgDevice == null){
				Log.w("neurostudy", "BrainBand not available");
			}
		}
	}

	public TGData tgData(){
		return tgData;
	}

	public boolean isConnecting(){
		if(tgDevice == null) return false;
		//if(tgDevice.getState() == TGDevice.STATE_CONNECTING) return true;
		if(tgDevice.getState() == TGDevice.STATE_CONNECTED) return true;
		return false;
	}

	public void connect() {
		if(!this.isConnecting() && isConnecting == false) {
			isConnecting = true;
			tgDevice.connect(rawEnabled);
		}
	}

	public void disconnect() {
		Log.d("neurostudy", "ThinkGear Disconnecting");
		if(this.isConnecting()) {
			Log.d("neurostudy", "ThinkGear close");
			tgDevice.close();
		}
	}

	private final Handler handler = new Handler() {
		@Override
		public void handleMessage(Message msg) {
			switch (msg.what) {
			case TGDevice.MSG_STATE_CHANGE:
				switch (msg.arg1) {
				case TGDevice.STATE_IDLE:
					break;
				case TGDevice.STATE_CONNECTING:
					Log.d("neurostudy", "ThinkGear Connecting...");
					if(isConnecting) tgData.status("connecting");
					break;
				case TGDevice.STATE_CONNECTED:
					isConnecting = false;
					Log.d("neurostudy", "ThinkGear Connected");
					tgData.status("connected");
					tgDevice.start();
					break;
				case TGDevice.STATE_NOT_FOUND:
					isConnecting = false;
					Log.w("neurostudy", "ThinkGear Can't find");
					tgData.status("fail");
					break;
				case TGDevice.STATE_NOT_PAIRED:
					isConnecting = false;
					Log.w("neurostudy", "ThinkGear not paired");
					tgData.status("fail");
					break;
				case TGDevice.STATE_DISCONNECTED:
					isConnecting = false;
					Log.d("neurostudy", "ThinkGear Disconnected");
					tgData.status("disconnected");
				}
				break;

			case TGDevice.MSG_POOR_SIGNAL:
				tgData.poor_signal(msg.arg1);
				break;

			case TGDevice.MSG_HEART_RATE:
				break;

			case TGDevice.MSG_ATTENTION:
				tgData.attention(msg.arg1);
				break;

			case TGDevice.MSG_MEDITATION:
				tgData.meditation(msg.arg1);
				break;

			case TGDevice.MSG_BLINK:
				tgData.blink(msg.arg1);
				break;

			case TGDevice.MSG_LOW_BATTERY:
				Log.w("neurostudy", "ThinkGear Low battery!");
				break;

			case TGDevice.MSG_EEG_POWER:
				tgEegPower = (TGEegPower)msg.obj;
				tgData.eeg(tgEegPower);
				break;

			default:
				break;
			}
		}
	};

	public class TGData{
		String status;
		int poor_signal;
		int meditation;
		int attention;
		int blink;
		int[] eeg = new int[8];

		public TGData(){
			clear();
		}

		public String status()            {	return status;	}
		public void   status(String value){
			status = value;
		}
		public int  poor_signal()         {	return poor_signal;	}
		public void poor_signal(int value){
			poor_signal = value;
		}
		public int  meditation()         {	return meditation;	}
		public void meditation(int value){
			meditation = value;
		}
		public int  attention()         {	return attention;	}
		public void attention(int value){
			attention = value;
		}
		
		public int  blink()         {
			int tempBlink = blink;
			blink = 0;
			return tempBlink;	
		}
		
		public void blink(int value){
			blink = value;
		}
		public int[] eeg()                     {	return eeg;	}
		public void  eeg(TGEegPower tgEegPower){
			eeg[0] = tgEegPower.delta;
			eeg[1] = tgEegPower.theta;
			eeg[2] = tgEegPower.lowAlpha;
			eeg[3] = tgEegPower.highAlpha;
			eeg[4] = tgEegPower.lowBeta;
			eeg[5] = tgEegPower.highBeta;
			eeg[6] = tgEegPower.lowGamma;
			eeg[7] = tgEegPower.midGamma;
		}

		private void clear(){
			poor_signal = -1;
			meditation = -1;
			attention = -1;
			blink = -1;
			for (int i = 0; i < eeg.length; i++) {
				eeg[i] = -1;
			}
		}
	}
}
