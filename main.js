importClass(android.animation.ObjectAnimator);
importClass(android.animation.AnimatorSet);
importClass(android.media.AudioRecord);
importClass(android.media.AudioFormat);
importClass(android.media.MediaRecorder);
importClass(javax.crypto.Mac);
importClass(javax.crypto.spec.SecretKeySpec);
importClass(java.text.SimpleDateFormat);
importClass(java.util.TimeZone);
importClass(java.util.Locale);

var bottomDialog = null;
var isRecording = false;

var scale = context.getResources().getDisplayMetrics().density;
var dp2px = function (dp) { return Math.floor(dp * scale + 0.5); };

//讯飞开发者平台api
const XFYUN_APPID = "";
const XFYUN_API_KEY = "";
const XFYUN_API_SECRET = "";


function showInputMethodDialog() {
    ui.run(function() {
        if (bottomDialog != null) {
            try { bottomDialog.close(); } catch(e) {}
            bottomDialog = null;
        }
        
        var screenHeight = device.height;
        var panelHeight = dp2px(220);
        
        bottomDialog = floaty.rawWindow(
            <frame id="root" w="*" h="*" gravity="bottom" bg="#80000000">
                <vertical id="panel" w="*" h="220" bg="#ffffff" layout_gravity="bottom">
                    <frame w="*" h="30" gravity="center">
                        <text text="───" textColor="#CCCCCC" textSize="12sp"/>
                    </frame>
                    <text text="选择输入方式" textSize="18sp" textColor="#333333" gravity="center" textStyle="bold"/>
                    <frame w="*" h="10"/>
                    <horizontal w="*" h="130" gravity="center">
                        <vertical id="btnText" w="140" h="*" gravity="center" margin="15 0">
                            <frame w="60" h="60" bg="#E3F2FD" gravity="center">
                                <text text="⌨" textSize="30sp" textColor="#2196F3" gravity="center"/>
                            </frame>
                            <text text="文字输入" textSize="15sp" textColor="#333333" gravity="center" margin="10"/>
                            <text text="键盘打字" textSize="11sp" textColor="#999999" gravity="center"/>
                        </vertical>
                        <vertical id="btnVoice" w="140" h="*" gravity="center" margin="15 0">
                            <frame w="60" h="60" bg="#E8F5E9" gravity="center">
                                <text text="🎤" textSize="30sp" gravity="center"/>
                            </frame>
                            <text text="语音输入" textSize="15sp" textColor="#333333" gravity="center" margin="10"/>
                            <text text="讯飞语音" textSize="11sp" textColor="#999999" gravity="center"/>
                        </vertical>
                    </horizontal>
                </vertical>
            </frame>
        );
        
        bottomDialog.setSize(-1, -1);
        bottomDialog.setTouchable(true);
        bottomDialog.panel.setTranslationY(panelHeight);
        
        setTimeout(function() {
            ui.run(function() {
                if (bottomDialog == null) return;
                var animator = ObjectAnimator.ofFloat(bottomDialog.panel, "translationY", panelHeight, 0);
                animator.setDuration(250);
                animator.setInterpolator(new android.view.animation.DecelerateInterpolator());
                animator.start();
            });
        }, 50);
        
        bottomDialog.root.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function(view, event) {
                if (event.getAction() == android.view.MotionEvent.ACTION_DOWN) {
                    var y = event.getY();
                    var panelTop = screenHeight - panelHeight;
                    if (y < panelTop) {
                        dismissBottomDialog();
                        return true;
                    }
                }
                return false;
            }
        }));
        
        bottomDialog.btnText.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function() {
                dismissBottomDialog();
                setTimeout(function() { 启动文字输入(); }, 350);
            }
        }));
        
        bottomDialog.btnVoice.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function() {
                dismissBottomDialog();
                setTimeout(function() { 启动语音输入(); }, 350);
            }
        }));
    });
}

function showRecordingDialog() {
    ui.run(function() {
        if (bottomDialog != null) {
            try { bottomDialog.close(); } catch(e) {}
            bottomDialog = null;
        }
        
        var screenHeight = device.height;
        var panelHeight = dp2px(200);
        
        bottomDialog = floaty.rawWindow(
            <frame id="root" w="*" h="*" gravity="bottom" bg="#80000000">
                <vertical id="panel" w="*" h="200" bg="#ffffff" layout_gravity="bottom">
                    <frame w="*" h="30" gravity="center">
                        <text text="───" textColor="#CCCCCC" textSize="12sp"/>
                    </frame>
                    <text id="statusText" text="🎤 正在录音..." textSize="18sp" textColor="#4CAF50" gravity="center" textStyle="bold"/>
                    <text id="resultText" text="请说话" textSize="14sp" textColor="#666666" gravity="center" margin="10" maxLines="3"/>
                    <frame w="*" h="10"/>
                    <horizontal w="*" h="80" gravity="center">
                        <vertical id="btnStop" w="140" h="*" gravity="center">
                            <frame w="55" h="55" bg="#FFEBEE" gravity="center">
                                <text text="⏹" textSize="26sp" textColor="#F44336" gravity="center"/>
                            </frame>
                            <text text="停止录音" textSize="14sp" textColor="#333333" gravity="center" margin="5"/>
                        </vertical>
                    </horizontal>
                </vertical>
            </frame>
        );
        
        bottomDialog.setSize(-1, -1);
        bottomDialog.setTouchable(true);
        bottomDialog.panel.setTranslationY(panelHeight);
        
        setTimeout(function() {
            ui.run(function() {
                if (bottomDialog == null) return;
                var animator = ObjectAnimator.ofFloat(bottomDialog.panel, "translationY", panelHeight, 0);
                animator.setDuration(250);
                animator.setInterpolator(new android.view.animation.DecelerateInterpolator());
                animator.start();
            });
        }, 50);
        
        bottomDialog.btnStop.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function() {
                isRecording = false;
            }
        }));
    });
}

function showCompleteDialog() {
    ui.run(function() {
        if (bottomDialog != null) {
            try { bottomDialog.close(); } catch(e) {}
            bottomDialog = null;
        }
        
        var screenHeight = device.height;
        var panelHeight = dp2px(200);
        
        bottomDialog = floaty.rawWindow(
            <frame id="root" w="*" h="*" gravity="bottom" bg="#80000000">
                <vertical id="panel" w="*" h="200" bg="#ffffff" layout_gravity="bottom">
                    <frame w="*" h="30" gravity="center">
                        <text text="───" textColor="#CCCCCC" textSize="12sp"/>
                    </frame>
                    <text text="✅ 操作已完成" textSize="18sp" textColor="#4CAF50" gravity="center" textStyle="bold"/>
                    <frame w="*" h="15"/>
                    <horizontal w="*" h="110" gravity="center">
                        <vertical id="btnContinue" w="140" h="*" gravity="center" margin="15 0">
                            <frame w="55" h="55" bg="#E3F2FD" gravity="center">
                                <text text="▶" textSize="26sp" textColor="#2196F3" gravity="center"/>
                            </frame>
                            <text text="继续执行" textSize="15sp" textColor="#333333" gravity="center" margin="8"/>
                        </vertical>
                        <vertical id="btnExit" w="140" h="*" gravity="center" margin="15 0">
                            <frame w="55" h="55" bg="#FFEBEE" gravity="center">
                                <text text="✕" textSize="26sp" textColor="#F44336" gravity="center"/>
                            </frame>
                            <text text="退出" textSize="15sp" textColor="#333333" gravity="center" margin="8"/>
                        </vertical>
                    </horizontal>
                </vertical>
            </frame>
        );
        
        bottomDialog.setSize(-1, -1);
        bottomDialog.setTouchable(true);
        bottomDialog.panel.setTranslationY(panelHeight);
        
        setTimeout(function() {
            ui.run(function() {
                if (bottomDialog == null) return;
                var animator = ObjectAnimator.ofFloat(bottomDialog.panel, "translationY", panelHeight, 0);
                animator.setDuration(250);
                animator.setInterpolator(new android.view.animation.DecelerateInterpolator());
                animator.start();
            });
        }, 50);
        
        bottomDialog.root.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function(view, event) {
                if (event.getAction() == android.view.MotionEvent.ACTION_DOWN) {
                    var y = event.getY();
                    var panelTop = screenHeight - panelHeight;
                    if (y < panelTop) {
                        dismissBottomDialog();
                        return true;
                    }
                }
                return false;
            }
        }));
        
        bottomDialog.btnContinue.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function() {
                dismissBottomDialog();
                setTimeout(function() { showInputMethodDialog(); }, 350);
            }
        }));
        
        bottomDialog.btnExit.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function() {
                dismissBottomDialog();
                toast("已退出");
                exit();
            }
        }));
    });
}

function dismissBottomDialog() {
    ui.run(function() {
        if (bottomDialog == null) return;
        var panelHeight = dp2px(220);
        try {
            var animator = ObjectAnimator.ofFloat(bottomDialog.panel, "translationY", 0, panelHeight);
            animator.setDuration(200);
            animator.setInterpolator(new android.view.animation.AccelerateInterpolator());
            animator.addListener(new android.animation.AnimatorListenerAdapter({
                onAnimationEnd: function() {
                    ui.run(function() {
                        if (bottomDialog != null) {
                            try { bottomDialog.close(); } catch(e) {}
                            bottomDialog = null;
                        }
                    });
                }
            }));
            animator.start();
        } catch(e) {
            if (bottomDialog != null) {
                try { bottomDialog.close(); } catch(e) {}
                bottomDialog = null;
            }
        }
    });
}


function 启动文字输入() {
    threads.start(function() {
        let command = dialogs.rawInput("请使用日常对话进行交流:", "");
        if (command != null && command.trim() != "") {
            toast("开始执行: " + command);
            sleep(500);
            phoneAgent.run(command);
            sleep(500);
            showCompleteDialog();
        } else {
            toast("已取消");
            showInputMethodDialog();
        }
    });
}

function 启动语音输入() {
    threads.start(function() {
        toast("准备语音识别...");
        showRecordingDialog();
        sleep(500);
        
        let command = xfyunVoiceRecognize();
        
        if (command && command.trim() != "") {
            dismissBottomDialog();
            sleep(300);
            toast("识别到: " + command);
            let confirm = dialogs.confirm("确认执行", "指令: " + command + "\n\n是否执行?");
            if (confirm) {
                toast("开始执行...");
                sleep(500);
                phoneAgent.run(command);
                sleep(500);
                showCompleteDialog();
            } else {
                toast("已取消");
                showInputMethodDialog();
            }
        } else {
            dismissBottomDialog();
            sleep(300);
            toast("未识别到语音，使用文字输入");
            let textCommand = dialogs.rawInput("请输入指令:", "");
            if (textCommand && textCommand.trim() != "") {
                toast("开始执行...");
                sleep(500);
                phoneAgent.run(textCommand);
                sleep(500);
                showCompleteDialog();
            } else {
                toast("已取消");
                showInputMethodDialog();
            }
        }
    });
}

function xfyunVoiceRecognize() {
    let result = "";
    let resultBuilder = [];
    
    try {

        let authUrl = getXfyunAuthUrl();
        log("Auth URL: " + authUrl);
        
        let latch = new java.util.concurrent.CountDownLatch(1);
        let audioRecord = null;
        isRecording = true;

        let sampleRate = 16000;
        let channelConfig = AudioFormat.CHANNEL_IN_MONO;
        let audioFormat = AudioFormat.ENCODING_PCM_16BIT;
        let bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat);
        

        audioRecord = new AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            channelConfig,
            audioFormat,
            bufferSize * 2
        );
        

        let uri = new java.net.URI(authUrl);

        let OkHttpClient = Packages.okhttp3.OkHttpClient;
        let Request = Packages.okhttp3.Request;
        let WebSocketListener = Packages.okhttp3.WebSocketListener;
        let TimeUnit = java.util.concurrent.TimeUnit;
        
        let client = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build();
        
        let request = new Request.Builder()
            .url(authUrl)
            .build();
        
        let webSocketRef = { ws: null };
        
        let listener = new JavaAdapter(WebSocketListener, {
            onOpen: function(ws, response) {
                log("WebSocket连接成功");
                webSocketRef.ws = ws;
                

                threads.start(function() {
                    try {
                        audioRecord.startRecording();
                        let buffer = util.java.array('byte', 1280);
                        let frameCount = 0;
                        
                        while (isRecording && webSocketRef.ws != null) {
                            let readSize = audioRecord.read(buffer, 0, buffer.length);
                            if (readSize > 0) {
                                let frameData = {};
                                
                                if (frameCount == 0) {
                                    frameData = {
                                        common: { app_id: XFYUN_APPID },
                                        business: {
                                            language: "zh_cn",
                                            domain: "iat",
                                            accent: "mandarin",
                                            vad_eos: 3000,
                                            dwa: "wpgs",
                                            ptt: 1
                                        },
                                        data: {
                                            status: 0,
                                            format: "audio/L16;rate=16000",
                                            encoding: "raw",
                                            audio: android.util.Base64.encodeToString(buffer, android.util.Base64.NO_WRAP)
                                        }
                                    };
                                } else {
                                    frameData = {
                                        data: {
                                            status: 1,
                                            format: "audio/L16;rate=16000",
                                            encoding: "raw",
                                            audio: android.util.Base64.encodeToString(buffer, android.util.Base64.NO_WRAP)
                                        }
                                    };
                                }
                                
                                try {
                                    webSocketRef.ws.send(JSON.stringify(frameData));
                                } catch(e) {
                                    log("发送数据失败: " + e);
                                    break;
                                }
                                frameCount++;
                            }
                            sleep(40);
                        }
                        

                        if (webSocketRef.ws != null) {
                            try {
                                webSocketRef.ws.send(JSON.stringify({ data: { status: 2 } }));
                                log("音频发送完毕");
                            } catch(e) {}
                        }
                        
                    } catch (e) {
                        log("录音发送错误: " + e);
                    } finally {
                        if (audioRecord != null) {
                            try {
                                audioRecord.stop();
                                audioRecord.release();
                            } catch(e) {}
                        }
                    }
                });
            },
            
            onMessage: function(ws, text) {
                try {
                    let resp = JSON.parse(String(text));
                    log("收到消息: " + text);
                    
                    if (resp.code != 0) {
                        log("识别错误: " + resp.message);
                        isRecording = false;
                        latch.countDown();
                        return;
                    }
                    
                    if (resp.data && resp.data.result) {
                        let wsArr = resp.data.result.ws;
                        if (wsArr) {
                            let pgs = resp.data.result.pgs;
                            
                            let resultText = "";
                            for (let i = 0; i < wsArr.length; i++) {
                                let cwArr = wsArr[i].cw;
                                if (cwArr && cwArr.length > 0) {
                                    resultText += cwArr[0].w;
                                }
                            }
                            
                            if (pgs == "apd") {
                                resultBuilder.push(resultText);
                            } else if (pgs == "rpl") {
                                let rg = resp.data.result.rg;
                                if (rg && rg.length >= 2) {
                                    let start = rg[0] - 1;
                                    let end = rg[1];
                                    if (start >= 0 && start < resultBuilder.length) {
                                        resultBuilder.splice(start, end - start, resultText);
                                    }
                                }
                            } else {
                                resultBuilder.push(resultText);
                            }
                            
                            let currentResult = resultBuilder.join("");
                            ui.run(function() {
                                if (bottomDialog && bottomDialog.resultText) {
                                    bottomDialog.resultText.setText(currentResult || "请说话");
                                }
                            });
                        }
                        
                        if (resp.data.status == 2) {
                            result = resultBuilder.join("");
                            log("识别完成: " + result);
                            isRecording = false;
                            latch.countDown();
                        }
                    }
                } catch (e) {
                    log("解析消息错误: " + e);
                }
            },
            
            onClosing: function(ws, code, reason) {
                log("WebSocket正在关闭: " + code);
            },
            
            onClosed: function(ws, code, reason) {
                log("WebSocket已关闭: " + code);
                webSocketRef.ws = null;
                isRecording = false;
                latch.countDown();
            },
            
            onFailure: function(ws, t, response) {
                log("WebSocket错误: " + t);
                webSocketRef.ws = null;
                isRecording = false;
                latch.countDown();
            }
        });
        
        client.newWebSocket(request, listener);

        let completed = latch.await(60, java.util.concurrent.TimeUnit.SECONDS);
        log("等待完成: " + completed);
        
        
        if (webSocketRef.ws != null) {
            try { webSocketRef.ws.close(1000, "完成"); } catch(e) {}
        }
        try { client.dispatcher().executorService().shutdown(); } catch(e) {}
        
    } catch (e) {
        log("语音识别错误: " + e);
        toast("语音识别失败: " + e);
    }
    
    isRecording = false;
    return result;
}

function getXfyunAuthUrl() {
    let host = "iat-api.xfyun.cn";
    let path = "/v2/iat";
    let url = "wss://" + host + path;
    
    let dateFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
    dateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
    let date = dateFormat.format(new java.util.Date());
    
    let signatureOrigin = "host: " + host + "\n" +
                          "date: " + date + "\n" +
                          "GET " + path + " HTTP/1.1";
    
    let mac = Mac.getInstance("HmacSHA256");
    let secretKey = new SecretKeySpec(new java.lang.String(XFYUN_API_SECRET).getBytes("UTF-8"), "HmacSHA256");
    mac.init(secretKey);
    let signatureSha = mac.doFinal(new java.lang.String(signatureOrigin).getBytes("UTF-8"));
    let signature = android.util.Base64.encodeToString(signatureSha, android.util.Base64.NO_WRAP);
    
    let authorizationOrigin = 'api_key="' + XFYUN_API_KEY + '", algorithm="hmac-sha256", headers="host date request-line", signature="' + signature + '"';
    let authorization = android.util.Base64.encodeToString(
        new java.lang.String(authorizationOrigin).getBytes("UTF-8"), 
        android.util.Base64.NO_WRAP
    );
    
    let authUrl = url + "?" +
        "authorization=" + java.net.URLEncoder.encode(authorization, "UTF-8") +
        "&date=" + java.net.URLEncoder.encode(date, "UTF-8") +
        "&host=" + java.net.URLEncoder.encode(host, "UTF-8");
    
    return authUrl;
}

auto.waitFor();

if (device.sdkInt > 28) {
    threads.start(function () {
        packageName("com.android.systemui").text("立即开始").waitFor();
        text("立即开始").click();
    });
}

if (!requestScreenCapture()) {
    toast("请求截图失败");
    exit();
}
sleep(200);

let storage = storages.create("AutoGLM-705237371@qq.com");
if (storage.get("api_key") == undefined) {
    let input = dialogs.rawInput("请输入api_key", "");
    if (input && input.trim() != "") {
        storage.put("api_key", input);
    } else {
        toast("未输入api_key，退出");
        exit();
    }
}

let PhoneAgent = require("./PhoneAgent.js");

let confirmation_callback = function (message) {
    return dialogs.confirm("敏感操作确认", message);
};

let takeover_callback = function (message) {
    dialogs.alert("请求人工介入", message);
    return true;
};

let phoneAgent = new PhoneAgent(confirmation_callback, takeover_callback);

setInterval(() => {}, 1000);
showInputMethodDialog();

events.on('exit', function () {
    isRecording = false;
    if (bottomDialog != null) {
        try { bottomDialog.close(); } catch(e) {}
        bottomDialog = null;
    }
});