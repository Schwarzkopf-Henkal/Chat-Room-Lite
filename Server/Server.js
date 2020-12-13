'use scrict';
const WebSocket = require('ws');
const fs=require('fs');
const cin=require("readline-sync");
const showdown = require("showdown");
const showdownHighlight = require("showdown-highlight");
const showdownKatex = require("showdown-katex");
//ServerInfo Vars
var ServerInfo=new Object(),Settings;
ServerInfo.usrList=[];
ServerInfo.isAdmin=new Object();
ServerInfo.time=new Date();
ServerInfo.BannedIPs=new Object();
ServerInfo.BanName="";
ServerInfo.BanTime=0;
ServerInfo.BannedUntil=new Object();
ServerInfo.isBanned=new Object();
ServerInfo.isBannedIP=new Object();
ServerInfo.multiplyIP=new Object();
ServerInfo.ipNumber=new Object();
ServerInfo.name2IP=new Object();
ServerInfo.tagInfo=new Object();
ServerInfo.tagColor=new Object();
try{
    Settings=JSON.parse(fs.readFileSync("Properties.json"));
}catch{
    console.style_error('Error: Failed to load properties.');
    process.exit(0);
}
//---
var alphabet = ['0','1','2','3','4','5','6','7','8','9',
                'A','B','C','D','E','F','G','H','I','J',
                'K','L','M','N','O','P','Q','R','S','T',
                'U','V','W','X','Y','Z','a','b','c','d',
                'e','f','g','h','i','j','k','l','m','n',
                'o','p','q','r','s','t','u','v','w','x',
                'y','z'];
function generateMixed(n) {
   var res = "";
   for(var i = 0; i < n ; i ++) {
     var id = Math.ceil(Math.random()*61);
     res += alphabet[id];
   }
   return res;
}
console.log(`请输入服务器端口：`);
ServerInfo.port=parseInt(cin.question('>'));
console.log(`请输入对话名字：`);
ServerInfo.name=cin.question('>');
ServerInfo.description=allHtmlSpecialChars(Settings.Description.substr(0,100));
var VerifyCode=generateMixed(Settings.VerifyCodeLen);
console.log(`校验码（用于验证管理员）：${VerifyCode}\n`);
const Server = new WebSocket.Server({ port: ServerInfo.port });
console.log(`机房聊天工具【服务端】\n服务器端口：[${ServerInfo.port}]\n对话名字：${ServerInfo.name}\n`);
console.log(`时间:${ServerInfo.time.toDateString()}\n-----------------------\n`);
//---Commandline Depot
const readline=require('readline');
var scanf=readline.createInterface({
    input:process.stdin,
    output:process.stdout
});
(()=>{
    let LocalCommands={
        "list":{
            fun:(Para)=>{
                if(Para.length===0||Para[0]==='user'){
                    let list=[];
                    Server.clients.forEach(cli=>{if(cli.VERIFIED)list.push(`|---${cli.ClientId} ${cli.IP}`)});
                    console.log(list.join('\n'));
                    return;
                }
                if(Para[0]==='bannedips'){
                    let list=[];
                    for(let i in ServerInfo.BannedIPs)
                        if(ServerInfo.BannedIPs[i]===true)
                            list.push(i);
                    console.log(list.join('\n'));
                    return;
                }
            },
            Parameter:true
        },
        "ban":{
            fun:(usrn)=>{
                let Bantotal=0;
                Server.clients.forEach(Cli=>{
                    if(usrn.indexOf(Cli.ClientId)!==-1){
                        ServerInfo.time=new Date();
                        Cli.send(JSON.stringify({
                            headers:{
                                Content_Type:'application/message',
                                Style:{"type":"style_error"},
                                Set_Name:''
                            },
                            body:"<i class='fas fa-ban' style='width:20px'></i> You are banned from the server.\n"
                        }));
                        Cli.close();
                        broadcast(`<div class="MessageInfo Warning"><i class="fa fa-exclamation-triangle" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${Cli.ClientId} is banned from the server.</span></div>`,'',{"type":"style_warning"})
                        Bantotal++;
                    }
                });
                console.log(`Banned ${Bantotal} users in total.`);
            },
            Parameter:true
        },
        "banip":{
            fun:(usrip)=>{
                let Bantotal=0;
                usrip.forEach((ip)=>{ServerInfo.BannedIPs[ip]=true});
                Server.clients.forEach((Cli)=>{
                    if(ServerInfo.BannedIPs[Cli.IP]===true){
                        ServerInfo.time=new Date();
                        Cli.send(JSON.stringify({
                            headers:{
                                Content_Type:'application/message',
                                Style:{"type":"style_error"},
                                Set_Name:''
                            },
                            body:"<i class='fas fa-ban' style='width:20px'></i> You are banned from the server.\n"
                        }));
                        Cli.close();
                        broadcast(`<div class="MessageInfo Warning"><i class="fa fa-exclamation-triangle" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${Cli.ClientId} is banned from the server.</span></div>`,'',{"type":"style_warning"})
                        Bantotal++;
                    }
                });
                console.log(`Banned ${Bantotal} users in total.`);
            },
            Parameter:true
        },
        "setDev":{
            fun:(usrip)=>{
                let Devtotal=0;
                usrip.forEach((ip)=>{
                    Devtotal+=(!ServerInfo.multiplyIP[ip]);
                    ServerInfo.multiplyIP[ip]=true;

                });
                console.log(`Set ${Devtotal} IPs as developer IP in total.`);
            },
            Parameter:true
        },
        "unsetDev":{
            fun:(usrip)=>{
                let Devtotal=0;
                usrip.forEach((ip)=>{
                    Devtotal+=(ServerInfo.multiplyIP[ip]);
                    ServerInfo.multiplyIP[ip]=false;
                });
                console.log(`Unset ${Devtotal} IPs as developer IP in total.`);
            },
            Parameter:true
        },
        "setAdmin":{
            fun:(usrn)=>{
                let Admintotal=0;
                Server.clients.forEach(Cli=>{
                    ServerInfo.time=new Date();
                    if(usrn.indexOf(Cli.ClientId)!==-1 && !ServerInfo.isAdmin[Cli.ClientId]){
                        ServerInfo.isAdmin[Cli.ClientId]=true;
                        broadcastAsAlert(`<div class="MessageInfo SignIn"><i class="fa fa-user-plus" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${Cli.ClientId} is set as adminstrator from the server.</span></div>`,'application/adminChange',{"type":"style_accept"})
                        Admintotal++;
                    }
                });
                console.log(`Set ${Admintotal} users as adminstrator in total.`);
            },
            Parameter:true
        },
        "unsetAdmin":{
            fun:(usrn)=>{
                let Admintotal=0;
                Server.clients.forEach(Cli=>{
                    ServerInfo.time=new Date();
                    if(usrn.indexOf(Cli.ClientId)!==-1 && ServerInfo.isAdmin[Cli.ClientId]){
                        ServerInfo.isAdmin[Cli.ClientId]=false;
                        broadcastAsAlert(`<div class="MessageInfo SignOut"><i class="fa fa-user-times" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${Cli.ClientId} is set as common user from the server.</span></div>`,'application/adminChange',{"type":"style_error"})
                        Admintotal++;
                    }
                });
                console.log(`Set ${Admintotal} users as common user in total.`);
            },
            Parameter:true
        },
        "recover":{
            fun:(usrip)=>{
                usrip.map((usr)=>{ServerInfo.BannedIPs[usr]=false});
            },
            Parameter:true
        }
    };
    let ThrowERR=[`欸，你刚才是不是输入了什么见不得人的东西啊~`,`不懂哦，唉。`,`根本搞不懂你在说什么！`,`不要乱来！`,`这样下去可是要被绑在耻辱柱上的哦~`];
    CMD();
    function CMD(){
        scanf.question('CRL />',(input)=>{
            (async ()=>{
                input=input.trim().split(/\s+/);
                if(LocalCommands[input[0]]){
                    if(LocalCommands[input[0]].Parameter===true)
                        await LocalCommands[input[0]].fun(input.splice(1,input.length-1));
                    else await LocalCommands[input[0]].fun();
                }else if(input[0]!=='')
                    console.log(ThrowERR[Math.floor(Math.random()*ThrowERR.length)]);
                CMD();
            })();
        });
    }
})();
function getMarkdownCode(msg) {
    var converter = new showdown.Converter({
        emoji: true,
        tables: true,
        strikethrough: true,
        literalMidWordUnderscores: true,
        splitAdjacentBlockquotes: true,
        extensions: [
            showdownKatex({
                throwOnError: true,
                displayMode: false,
                style_errorColor: '#ffff00',
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false },
                    { left: '&&', right: '&&', display: true, asciimath: true },
                ],
            }),
            showdownHighlight,
        ],
    });
    return converter.makeHtml(msg);
}
Server.on('connection',(ws,Req)=>{
    ws.HACK_MSG_C=0;
    ws.USER_NAME_WRONG=false;
    ws.VERIFIED=false;
    ws.IP=Req.connection.remoteAddress;
    //----连接属性
    ws.on('message',msg=>{
        try{
            msg=JSON.parse(msg);
            if(!msg.headers)
                throw '不合格式的消息';
        }catch(OOPS_LOOKS_LIKE_A_HACK_MESSAGE){
            ws.HACK_MSG_C++;
            if(ws.HACK_MSG_C>=Settings.HACK_MSG_MX){
                ServerInfo.time=new Date();
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"type":"style_error"},
                        Set_Name:''
                    },
                    body:"<i class='fas fa-ban' style='width:20px'></i> You are banned from the server.\n"
                }));
                ws.close();
                broadcast(`<div class="MessageInfo Warning"><i class="fa fa-exclamation-triangle"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${ws.ClientId} is banned from the server for hack tries.\n- hack messages received.</span></div>`,'',{"type":"style_warning"})
            }
            return;
        }
        if(msg.headers['Content_Type']==='application/userlist'){
            ServerInfo.time=new Date();
            ws.send(JSON.stringify({
                headers:{
                    Content_Type:'application/userlist',
                    Set_serverinfo:ServerInfo
                }
            }));
        }
        if(msg.headers['Content_Type']==='application/init'){
            if(ServerInfo.BannedIPs[ws.IP]===true){
                ServerInfo.time=new Date();
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"type":"style_error"},
                        Set_Name:''
                    },
                    body:"<i class='fas fa-info-circle' style='width:20px'></i> Error : This server is currently not available to you.\n"
                }));
                ws.close();
                return;
            }
            ws.ClientId=msg.headers['Set_Name'].trim();
            if(ws.ClientId.length==0 || ws.ClientId.length>24){
                ServerInfo.time=new Date();
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"type":"style_error"},
                        Set_Name:''
                    },
                    body:"<i class='fas fa-info-circle' style='width:20px'></i> Error : Username must consist of up to 24 letters, numbers, and underscores\n"
                }));
                ws.USER_NAME_WRONG=true;
                ws.close();return;
            }
            for(var p=0;p<ws.ClientId.length;p++)
                if( !((ws.ClientId[p]>='0' && ws.ClientId[p]<='9') || (ws.ClientId[p]>='a' && ws.ClientId[p]<='z')
                  || (ws.ClientId[p]>='A' && ws.ClientId[p]<='Z') || ws.ClientId[p]=='_')){
                    ServerInfo.time=new Date();
                    ws.send(JSON.stringify({
                        headers:{
                            Content_Type:'application/message',
                            Style:{"type":"style_error"},
                            Set_Name:''
                        },
                        body:"<i class='fas fa-info-circle' style='width:20px'></i> Error : Username must consist of up to 24 letters, numbers, and underscores\n"
                    }));
                    ws.USER_NAME_WRONG=true;
                    ws.close();return;
                }
            for(var p=0;p<ServerInfo.usrList.length;p++)
                if(ws.ClientId===ServerInfo.usrList[p]){
                    ServerInfo.time=new Date();
                    ws.send(JSON.stringify({
                        headers:{
                            Content_Type:'application/message',
                            Style:{"type":"style_error"},
                            Set_Name:''
                        },
                        body:"<i class='fas fa-info-circle' style='width:20px'></i> Error : Same Username Found.\n"
                    }));
                    ws.USER_NAME_WRONG=true;
                    ws.close();return;
                }
            if(ServerInfo.ipNumber[ws.IP]===undefined)
                ServerInfo.ipNumber[ws.IP]=1;
            else
                ServerInfo.ipNumber[ws.IP]=Number(ServerInfo.ipNumber[ws.IP])+1;
            ws.VERIFIED=true;
            ServerInfo.name2IP[ws.ClientId]=ws.IP;
            ServerInfo.time=new Date();
            let EventMsg=`<div class="MessageInfo SignIn"><i class="fas fa-sign-in" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n${ws.ClientId} entered the chat room!</span></div>`;
            broadcast(EventMsg,'',{"type":"style_accept"});
            broadcommand('UsrAdd',[ws.ClientId]);
            ServerInfo.usrList.push(ws.ClientId);
            if(ServerInfo.isBannedIP[ws.IP]){
                if(ServerInfo.BannedUntil[ws.IP]<=(new Date().getTime())){
                    ServerInfo.isBannedIP[ws.IP]=false;
                    ServerInfo.BannedUntil[ws.IP]=0;
                }
            }
            ws.send(JSON.stringify({
                headers:{
                    Content_Type:'application/init',
                    Set_serverinfo:ServerInfo
                }
            }));
            if(ServerInfo.isBannedIP[ws.IP]){
                if(ServerInfo.BannedUntil[ws.IP]<=(new Date().getTime())){
                    ServerInfo.isBannedIP[ws.IP]=false;
                    ServerInfo.BannedUntil[ws.IP]=0;
                }
                else{
                    ServerInfo.isBanned[ws.ClientId]=true;
                    ServerInfo.BanName=ws.ClientId;
                    ServerInfo.BanTime=(ServerInfo.BannedUntil[ws.IP]-new Date().getTime());
                    broadcastAsAlert(`<div class="MessageInfo Error"><i class="fa fa-ban"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${ws.ClientId} is recently banned by adminstrator.</span></div>`,"application/banChange",{"type":"style_error"});
                }
            }
        }else if(msg.headers.Content_Type==='application/message'){
            if(!ws.VERIFIED){
                ServerInfo.time=new Date();
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"type":"style_error"},
                        Set_Name:''
                    },
                    body:"<i class='fas fa-ban' style='width:20px'></i> You are banned from the server.\n"
                }));
                ws.close();
                return;
            }
            if(ServerInfo.isBanned[ws.ClientId]){
                ServerInfo.time=new Date();
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"type":"style_error"},
                        Set_Name:''
                    },
                    body:"<i class='fas fa-ban' style='width:20px'></i> You are still banned from the server.\n"
                }));
                return;
            }
            var rM = msg.body;
            msg.body=getMarkdownCode(HtmlSpecialChars(msg.body));
            ServerInfo.time=new Date();
            broadcastAsMessage(`<i class="fas fa-comment" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)} ${ws.ClientId}`+(ServerInfo.tagInfo[ws.ClientId]?'<span class="userTag" style="background-color:'+ServerInfo.tagColor[ws.ClientId]+'">'+ServerInfo.tagInfo[ws.ClientId]+'</span>':``)+`:\n<div class="MessageInfo Plainmsg" style="overflow-y:hidden;"><div class="Message">`+msg.body,rM,ws.ClientId,msg.headers['Set_Sendnumber'],msg.headers['Set_Senduserlist']);
        }
        else if(msg.headers.Content_Type==='application/banUser'){
            let userName=msg.headers['Set_Name'];
            let banTime=msg.headers['Ban_Time'];
            ServerInfo.BanName=userName;
            ServerInfo.BanTime=banTime;
            ServerInfo.isBanned[userName]=true;
            ServerInfo.isBannedIP[ServerInfo.name2IP[userName]]=true;
            ServerInfo.BannedUntil[ServerInfo.name2IP[userName]]=new Date().getTime()+banTime;
            broadcastAsAlert(`<div class="MessageInfo Error"><i class="fa fa-ban"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${userName} is banned for ${banTime/1000}s by adminstrator.</span></div>`,"application/banChange",{"type":"style_error"});
        }
        else if(msg.headers.Content_Type==='application/unbanUser'){
            let userName=msg.headers['Set_Name'];
            let currentTime=new Date().getTime();
            if(!ServerInfo.isBanned[userName])   return;
            if(ServerInfo.isAdmin[ws.ClientId]){
                ServerInfo.isBanned[userName]=false;
                ServerInfo.isBannedIP[ServerInfo.name2IP[userName]]=false;
                ServerInfo.BannedUntil[ServerInfo.name2IP[userName]]=0;
                ServerInfo.BanName=userName;
                broadcastAsAlert(`<div class="MessageInfo SignIn"><i class="fa fa-commenting"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${userName} is unbanned by adminstrator.</span></div>`,"application/unbanChange",{"type":"style_accept"});
            }
            else if(currentTime>=ServerInfo.BannedUntil[ServerInfo.name2IP[userName]]){
                ServerInfo.isBanned[userName]=false;
                ServerInfo.isBannedIP[ServerInfo.name2IP[userName]]=false;
                ServerInfo.BannedUntil[ServerInfo.name2IP[userName]]=0;
                ServerInfo.BanName=userName;
                broadcastAsAlert(`<div class="MessageInfo SignIn"><i class="fa fa-commenting"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${userName} is unbanned.</span></div>`,"application/unbanChange",{"type":"style_accept"});
            }
            else{
                ServerInfo.time=new Date();
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"type":"style_error"},
                        Set_Name:''
                    },
                    body:"<i class='fas fa-ban' style='width:20px'></i> You are banned from the server.\n"
                }));
                ws.close();
                broadcast(`<div class="MessageInfo Warning"><i class="fa fa-exclamation-triangle" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${ws.ClientId} is banned from the server for hack tries.\n- send unban command ${(ServerInfo.BannedUntil[ServerInfo.name2IP[userName]]-currentTime)/1000}s earlier.</span></div>`,'',{"type":"style_warning"})
            }
        }
        else if(msg.headers.Content_Type==='application/verifyIdentity'){
            let userName=ws.ClientId;
            let quesCode=msg.headers['Set_Code'];
            if(quesCode===VerifyCode){
                if(ServerInfo.isAdmin[userName])    return;
                ServerInfo.isAdmin[userName]=true;
                broadcastAsAlert(`<div class="MessageInfo SignIn"><i class="fa fa-user-plus" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>@${userName} is set as adminstrator by verify code.</span></div>`,'application/adminChange',{"type":"style_accept"})
            }
            else{
                ServerInfo.time=new Date();
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"type":"style_error"},
                        Set_Name:''
                    },
                    body:"<i class='fas fa-times' style='width:20px'></i> The Code Is Wrong.\n"
                }));
            }
        }
        else if(msg.headers.Content_Type==='application/changeUserTag'){
            let userName=ws.ClientId;
            ServerInfo.tagInfo[userName]=msg.headers['Set_Taginfo'];
            ServerInfo.tagColor[userName]=msg.headers['Set_Tagcolor'];
            broadcastAsAlert(`<i class="fas fa-tags" style="width:20px"></i> ${ws.ClientId} set his/her tag as <span class="userTag" style="background-color:${ServerInfo.tagColor[userName]}">${ServerInfo.tagInfo[userName]}</span>.\n`,'application/changeUserTag',{"type":"style_accept"});
        }
        else if(msg.headers.Content_Type==='application/closeUserTag'){
            let userName=ws.ClientId;
            ServerInfo.tagInfo[userName]=undefined;
            ServerInfo.tagColor[userName]=undefined;
            broadcastAsAlert(`<i class="fas fa-tags" style="width:20px"></i> ${ws.ClientId} close his/her tag.\n`,'application/changeUserTag',{"type":"style_error"});
        }
        else if(msg.headers.Content_Type==='application/previewMarkdown'){
            ws.send(JSON.stringify({
                headers:{
                    Content_Type:'application/previewMarkdown'
                },
                body: getMarkdownCode(HtmlSpecialChars(msg.body))
            }));
        }
    });
    ws.on('close',()=>{
        if(ws.ClientId && !ws.USER_NAME_WRONG){
            --ServerInfo.ipNumber[ws.IP];
            ServerInfo.isAdmin[ws.ClientId]=false;
            ServerInfo.isBanned[ws.ClientId]=false;
            ServerInfo.tagInfo[ws.ClientId]=undefined;
            ServerInfo.tagColor[ws.ClientId]=undefined;
            ServerInfo.time=new Date();
            let EventMsg=`<div class="MessageInfo SignOut"><i class="fas fa-sign-out" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<span>${ws.ClientId} left the chat room!</span></div>`;
            broadcast(EventMsg,'',{"type":"style_error"});
            broadcommand('UsrDel',[ws.ClientId]);
            ServerInfo.usrList.splice(ServerInfo.usrList.indexOf(ws.ClientId),1);
            Status=false;
        }
        ws.VERIFIED=false;
    })
});
function broadcommand(cmd,para){
    ServerInfo.time=new Date();
    Server.clients.forEach(Cli=>{
        if(Cli.readyState===WebSocket.OPEN){
            Cli.send(JSON.stringify({
                headers:{
                    Content_Type:'application/command',
                    Command:cmd,
                    Parameter:para
                },
            }));
        }
    });
};
function broadcast(msg,from,style){
    ServerInfo.time=new Date();
    if(style){
        Server.clients.forEach(Cli=>{
            if(Cli.readyState===WebSocket.OPEN){
                Cli.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:style,
                        Set_Name:from
                    },
                    body:msg
                }));
            }
        });
    }else {
        Server.clients.forEach(Cli=>{
            if(Cli.readyState===WebSocket.OPEN){
                Cli.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Set_Name:from
                    },
                    body:msg
                }));
            }
        });
    }
}
function broadcastAsAlert(msg,contentType,style){
    ServerInfo.time=new Date();
    if(style){
        Server.clients.forEach(Cli=>{
            if(Cli.readyState===WebSocket.OPEN){
                Cli.send(JSON.stringify({
                    headers:{
                        Content_Type:contentType,
                        Set_serverinfo:ServerInfo,
                        Style:style
                    },
                    body:msg
                }));
            }
        });
    }else {
        Server.clients.forEach(Cli=>{
            if(Cli.readyState===WebSocket.OPEN){
                Cli.send(JSON.stringify({
                    headers:{
                        Content_Type:contentType,
                        Set_serverinfo:ServerInfo,
                    },
                    body:msg
                }));
            }
        });
    }
}
function broadcastAsMessage(msg,rawMessage,from,len,idx){
    ServerInfo.time=new Date();
    Server.clients.forEach(Cli=>{
        if(Cli.readyState===WebSocket.OPEN &&
          (len==0 || idx[Cli.ClientId]===true)){
            Cli.send(JSON.stringify({
                headers:{
                    Content_Type:'application/message',
                    Set_Rawmessage:rawMessage,
                    Set_Name:from
                },
                body:msg
            }));
        }
    });
}
function HtmlSpecialChars(text) {
    var ret = "";
    var inCodeBlock = false;
    var inShortCodeBlock = false;
    var inQuote = true;
    var tillSpace = true;
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;',
      '\\': '\\\\'
    };
    for(var p=0;p<text.length;p++){
        if(text[p]=='\n' || text[p]=='\r')  tillSpace=true;
        else if(text[p]!=' ' && text[p]!='\t')  tillSpace=false;
        if(p>=2 && text[p]=='`' && text[p-1]=='`' && text[p-2]=='`' && (p==2 || (inCodeBlock?tillSpace:text[p-3]!='`')))
            inCodeBlock = !inCodeBlock;
        else if(p>=1 && text[p]=='`' && text[p-1]=='`' && (p==1 || text[p-2]!='`') && !inCodeBlock)
            inShortCodeBlock = !inShortCodeBlock;
        else if(text[p]=='`' && (p==0 || text[p-1]!='`') && !inCodeBlock)
            inShortCodeBlock = !inShortCodeBlock;
        if(!inCodeBlock && !inShortCodeBlock){
            if(text[p]=='\n')   inQuote = true;
            else if(text[p]!='>' && text[p]!=' ' && text[p]!='\t')  inQuote=false;
            if(!inQuote)  
                ret += ((text[p]=='&' || text[p]=='<' || text[p]=='>'
                    || text[p]=='"' || text[p]=='\'' || text[p]=='\\')?map[text[p]]:text[p]);
            else    ret+=text[p];
        }
        else    ret+=text[p];
    }
    return ret;
}
function allHtmlSpecialChars(text){
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;',
      '\\': '\\\\'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
