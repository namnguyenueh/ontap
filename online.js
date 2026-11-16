/* ============================================================
   ĐẾM SỐ NGƯỜI ĐANG ÔN TẬP (Firebase Realtime Database)
   Mỗi máy chỉ gửi: một mã ngẫu nhiên + mã rút gọn của chủ đề đang ôn.
   Không gửi mã cán bộ, không gửi nội dung câu hỏi.
   ============================================================ */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyC_qfa5yNBKH50U9hIVhcHK9K53eE2Bxjg",
  authDomain: "ontap-online.firebaseapp.com",
  databaseURL: "https://ontap-online-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ontap-online",
  appId: "1:653619034168:web:d0bab572be8c9f6fe80ecd"
};

(function(){
  var api={start:function(){},topic:function(){}};
  window.ONLINE=api;
  var CFG=window.FIREBASE_CONFIG;
  if(!CFG||!CFG.databaseURL)return;

  var SDK='https://www.gstatic.com/firebasejs/10.12.2/';
  var sid=(Date.now().toString(36)+Math.random().toString(36).slice(2,10));
  var db=null,me=null,curK='',started=false,visible=!document.hidden,connected=false,offset=0;
  var data={},ready=false,beat=null;
  var STALE=5*60*1000; // bỏ qua máy không báo hiệu quá 5 phút

  function hk(s){var h=2166136261;s=String(s||'');for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
  function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
  function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}

  function counts(){
    var now=Date.now()+offset,total=0,byK={};
    Object.keys(data).forEach(function(k){var v=data[k];if(!v||typeof v.t!=='number'||now-v.t>STALE)return;total++;if(v.k)byK[v.k]=(byK[v.k]||0)+1;});
    return {total:total,byK:byK};
  }
  var pending=false;
  function render(){
    if(pending)return;pending=true;
    (window.requestAnimationFrame||setTimeout)(function(){
      pending=false;
      var c=ready?counts():null;
      var els=document.querySelectorAll('.online');
      for(var i=0;i<els.length;i++){
        var el=els[i],t='';
        if(c&&c.total){
          var tp=el.getAttribute('data-topic')==='1'&&curK&&c.byK[curK];
          t='🟢 '+fmt(c.total)+(tp?' người đang ôn · '+fmt(c.byK[curK])+' cùng chủ đề':' người đang ôn tập');
        }
        if(el.textContent!==t)el.textContent=t;
      }
    });
  }
  function payload(){var o={t:firebase.database.ServerValue.TIMESTAMP};if(curK)o.k=curK;return o;}
  function announce(){
    if(!me||!connected)return;
    if(visible){me.onDisconnect().remove();me.set(payload());}
    else me.remove();
  }
  function begin(){
    try{
      var app=firebase.apps.length?firebase.app():firebase.initializeApp(CFG);
      db=app.database();
      me=db.ref('presence/'+sid);
      db.ref('.info/serverTimeOffset').on('value',function(s){offset=s.val()||0;});
      db.ref('.info/connected').on('value',function(s){connected=!!s.val();announce();});
      if(uKey&&!uTimer)uTimer=setTimeout(uSend,800);
      db.ref('presence').on('value',function(s){data=s.val()||{};ready=true;render();},function(){ready=false;render();});
      beat=setInterval(function(){if(visible)announce();render();},2*60*1000);
      document.addEventListener('visibilitychange',function(){visible=!document.hidden;announce();});
      window.addEventListener('pagehide',function(){try{me.remove();}catch(e){}});
      var appEl=document.getElementById('app');
      if(appEl&&window.MutationObserver)new MutationObserver(render).observe(appEl,{childList:true,subtree:true});
    }catch(e){}
  }

  /* Ghi nhận người học (mã cán bộ + số liệu tổng hợp, không có nội dung câu hỏi) */
  var uKey='',uGet=null,uTimer=null,uFirst=false;
  function uSend(){
    uTimer=null;if(!db||!uKey||!uGet)return;
    try{
      var s=uGet();if(!s)return;
      s.l=firebase.database.ServerValue.TIMESTAMP;
      var ref=db.ref('users/'+uKey);ref.update(s);
      if(!uFirst){uFirst=true;ref.child('f').transaction(function(v){return v||(Date.now()+offset);});}
    }catch(e){}
  }
  api.user=function(code,getter){
    uKey=String(code||'').trim().toUpperCase().replace(/[.#$\[\]\/\s]/g,'_').slice(0,40);uGet=getter;
    if(!uTimer)uTimer=setTimeout(uSend,db?500:6000);
  };
  api.report=function(){if(uKey&&!uTimer)uTimer=setTimeout(uSend,4000);};
  api.start=function(){
    if(started)return;started=true;
    load(SDK+'firebase-app-compat.js').then(function(){return load(SDK+'firebase-database-compat.js');}).then(begin).catch(function(){});
  };
  api.topic=function(name){
    var k=name?hk(name):'';
    if(k===curK){render();return;}
    curK=k;
    if(me&&connected&&visible)me.set(payload());
    render();
  };
})();
