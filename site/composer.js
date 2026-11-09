
(function(){
var toggle=document.getElementById('target-toggle'),menu=document.getElementById('target-menu'),draft=document.getElementById('draft'),status=document.getElementById('composer-status'),voice=document.getElementById('voice');
var target='friend',drafts={friend:'',context:''},recognition=null,listening=false;
function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');}
function stopVoice(){if(recognition&&listening)recognition.stop();}
toggle.addEventListener('click',function(){menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));});
menu.querySelectorAll('button').forEach(function(button){button.addEventListener('click',function(){stopVoice();drafts[target]=draft.value;target=button.dataset.target;draft.value=drafts[target];draft.maxLength=target==='friend'?240:600;toggle.innerHTML=(target==='friend'?'朋友说':'当时发生了什么')+' <span>⌃</span>';draft.placeholder=target==='friend'?'把朋友说的那句话写在这里…':'当时在聊什么？发生了什么？';closeMenu();status.textContent='';draft.focus();});});
document.addEventListener('click',function(event){if(!event.target.closest('.target-wrap'))closeMenu();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});
document.getElementById('send').addEventListener('click',function(){stopVoice();var value=draft.value.trim();if(!value){status.textContent='先写点内容，再发送吧。';draft.focus();return;}document.getElementById(target==='friend'?'friend-message':'context-message').textContent=value;document.getElementById(target==='friend'?'phrase':'context').value=value;document.getElementById('result').hidden=true;draft.value='';drafts[target]='';status.textContent=target==='friend'?'已放进“朋友说”气泡。可以继续补充背景。':'背景已补充，点击“一起听听”查看解读。';});
voice.addEventListener('click',function(){
 if(listening){stopVoice();return;}
 var Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){status.textContent='这个浏览器暂不支持语音输入。可以使用手机键盘自带的听写，或直接打字。';return;}
 var current=target,initial=draft.value;
 recognition=new Speech();recognition.lang='zh-CN';recognition.interimResults=false;recognition.continuous=false;
 recognition.onstart=function(){listening=true;voice.classList.add('recording');voice.setAttribute('aria-label','停止语音输入');status.textContent='正在听，再点麦克风可以停止。语音识别可能使用浏览器提供的在线服务。';};
 recognition.onresult=function(e){var text='';for(var i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)text+=e.results[i][0].transcript;}var result=(initial+text).slice(0,current==='friend'?240:600);drafts[current]=result;if(target===current)draft.value=result;status.textContent='已转成文字，确认后再发送。';};
 recognition.onerror=function(e){status.textContent=e.error==='not-allowed'?'未获得麦克风权限，请允许后重试，或使用键盘听写。':'语音识别没有完成，请重试或直接打字。';};
 recognition.onend=function(){listening=false;voice.classList.remove('recording');voice.setAttribute('aria-label','开始语音输入');};
 try{recognition.start();}catch(e){status.textContent='语音暂时无法启动，请直接打字或使用键盘听写。';}
});
})();

document.getElementById('settings-toggle').addEventListener('click',function(){var panel=document.getElementById('key-settings');panel.open=!panel.open;});
