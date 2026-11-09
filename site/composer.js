(function(){
'use strict';
var $=function(id){return document.getElementById(id);}, draft=$('draft'),context=$('draft-context'),status=$('composer-status'),voice=$('voice');
var recognition=null,listening=false,active=draft;
[draft,context].forEach(function(el){el.addEventListener('focus',function(){active=el;});});
$('add-context').addEventListener('click',function(){var editor=$('context-editor');editor.hidden=!editor.hidden;this.setAttribute('aria-expanded',String(!editor.hidden));if(!editor.hidden)context.focus();});
$('send').addEventListener('click',function(){
 if(listening&&recognition)recognition.stop();
 var phrase=draft.value.trim(),background=context.value.trim();
 if(!phrase&&!$('phrase').value.trim()){status.textContent='先写下朋友说的那句话吧。';draft.focus();return;}
 if(phrase){$('phrase').value=phrase;$('friend-message').textContent=phrase;}
 if(background){$('context').value=background;$('context-message').textContent=background;}
 $('sent-messages').hidden=false;$('sent-context').hidden=!$('context').value.trim();$('result').hidden=true;$('translate').hidden=false;draft.value='';context.value='';$('context-editor').hidden=true;$('add-context').setAttribute('aria-expanded','false');status.textContent='消息已发出，点击“一起听听”查看不同的理解。';
});
voice.addEventListener('click',function(){
 if(listening){recognition.stop();return;}
 var Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){status.textContent='浏览器暂不支持语音输入，请使用键盘听写或打字。';return;}
 var target=active,initial=target.value;recognition=new Speech();recognition.lang='zh-CN';recognition.interimResults=false;
 recognition.onstart=function(){listening=true;voice.classList.add('recording');voice.setAttribute('aria-label','停止语音输入');status.textContent='正在听：'+(target===context?'当时发生了什么':'朋友说')+'。再点麦克风停止。语音可能由浏览器在线服务识别。';};
 recognition.onresult=function(e){var text='';for(var i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)text+=e.results[i][0].transcript;target.value=(initial+text).slice(0,target===context?600:240);status.textContent='已转成文字，确认后发送。';};
 recognition.onerror=function(){status.textContent='语音识别未完成，请检查麦克风权限或直接打字。';};
 recognition.onend=function(){listening=false;voice.classList.remove('recording');voice.setAttribute('aria-label','开始语音输入');};
 try{recognition.start();}catch(e){status.textContent='语音暂时无法启动，请使用键盘听写。';}
});
$('settings-toggle').addEventListener('click',function(){var panel=$('key-settings');panel.open=!panel.open;});
})();
