'use scrict';
const WebSocket = require('ws');
const cin=require("readline-sync");
//ServerInfo Vars
var ServerInfo=new Object();
ServerInfo.usrList=[];
ServerInfo.isAdmin=new Object();
ServerInfo.time=new Date();
ServerInfo.BannedIPs=new Object();
//---
console.log(`请输入服务器端口：`);
ServerInfo.port=parseInt(cin.question('>'));
console.log(`请输入对话名字：`);
ServerInfo.name=cin.question('>');
const Server = new WebSocket.Server({ port: ServerInfo.port });
console.log(`机房聊天工具【服务端】\n服务器端口：[${ServerInfo.port}]\n对话名字：${ServerInfo.name}\n`);
console.log(`时间:${ServerInfo.time.toDateString()}\n-----------------------\n`);
//Environment Vars
const HACK_MSG_MX=10;
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
                        Cli.send(JSON.stringify({
                            headers:{
                                Content_Type:'application/message',
                                Style:{"color":"#e7483f"}
                            },
                            body:"<i class='fas fa-ban' style='width:20px'></i> You are banned from the server.\n"
                        }));
                        Cli.close();
                        broadcast(`<i class="fa fa-exclamation-triangle" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<div class="MessageInfo Warning"><span>@${Cli.ClientId} is banned from the server.</span></div>`,{"color":"#ffff00"})
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
                        Cli.send(JSON.stringify({
                            headers:{
                                Content_Type:'application/message',
                                Style:{"color":"#e7483f"}
                            },
                            body:"<i class='fas fa-ban' style='width:20px'></i> You are banned from the server.\n"
                        }));
                        Cli.close();
                        broadcast(`<i class="fa fa-exclamation-triangle" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<div class="MessageInfo Warning"><span>@${Cli.ClientId} is banned from the server.</span></div>`,{"color":"#ffff00"})
                        Bantotal++;
                    }
                });
                console.log(`Banned ${Bantotal} users in total.`);
            },
            Parameter:true
        },
        "setAdmin":{
            fun:(usrn)=>{
                let Admintotal=0;
                Server.clients.forEach(Cli=>{
                    if(usrn.indexOf(Cli.ClientId)!==-1 && !ServerInfo.isAdmin[Cli.ClientId]){
                        ServerInfo.isAdmin[Cli.ClientId]=true;
                        broadcastAsAlert(`<i class="fa fa-cogs" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<div class="MessageInfo SignIn"><span>@${Cli.ClientId} is set as adminstrator from the server.</span></div>`,'application/adminChange',{"color":"#13c60d"})
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
                    if(usrn.indexOf(Cli.ClientId)!==-1 && ServerInfo.isAdmin[Cli.ClientId]){
                        ServerInfo.isAdmin[Cli.ClientId]=false;
                        broadcastAsAlert(`<i class="fa fa-cogs" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<div class="MessageInfo SignOut"><span>@${Cli.ClientId} is set as common user from the server.</span></div>`,'application/adminChange',{"color":"#e7483f"})
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
Server.on('connection',(ws,Req)=>{
    ws.HACK_MSG_C=0;
    ws.USER_NAME_WRONG=false;
    ws.VERIFIED=false;
    ws.IP=Req.connection.remoteAddress;
    //----连接属性
    ws.on('message',msg=>{
        try{
            msg=JSON.parse(msg);
        }catch(OOPS_LOOKS_LIKE_A_HACK_MESSAGE){
            ws.send(msg);
            ws.HACK_MSG_C++;
            if(ws.HACK_MSG_C>=HACK_MSG_MX){
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"color":"#e7483f"}
                    },
                    body:"<i class='fas fa-ban'></i> You are banned from the server.\n"
                }));
                ws.close();
                broadcast(`<i class="fa fa-exclamation-triangle"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<div class="MessageInfo Warning"><span>@${ws.ClientId} is banned from the server for hack tries.</span></div>`,{"color":"#ffff00"})
            }
            return;
        }
        if(msg.headers['Content_Type']==='application/userlist'){
            // console.log(`${ClientId}`);
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
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"color":"#e7483f"}
                    },
                    body:"<i class='fas fa-info-circle' style='width:20px'></i> Error : This server is currently not available to you.\n"
                }));
                ws.close();
                return;
            }
            ws.ClientId=msg.headers['Set_Name'];
            for(var p=0;p<ServerInfo.usrList.length;p++)
                if(ws.ClientId===ServerInfo.usrList[p]){
                    ws.send(JSON.stringify({
                        headers:{
                            Content_Type:'application/message',
                            Style:{"color":"#e7483f"}
                        },
                        body:"<i class='fas fa-info-circle' style='width:20px'></i> Error : Same Username Found.\n"
                    }));
                    ws.USER_NAME_WRONG=true;
                    ws.close();return;
                }
            ws.VERIFIED=true;
            ServerInfo.time=new Date();
            let EventMsg=`<i class="fas fa-user-plus" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<div class="MessageInfo SignIn"><span>${ws.ClientId} entered the chat room!</span></div>`;
            broadcast(EventMsg,{'color':'#13c60d'});
            broadcommand('UsrAdd',[ws.ClientId]);
            ServerInfo.usrList.push(ws.ClientId);
            ws.send(JSON.stringify({
                headers:{
                    Content_Type:'application/init',
                    Set_serverinfo:ServerInfo
                }
            }));
        }else if(msg.headers.Content_Type==='application/message'){
            if(!ws.VERIFIED){
                ws.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
                        Style:{"color":"#e7483f"}
                    },
                    body:"<i class='fas fa-ban'></i> You are banne from the server.\n"
                }));
                ws.close();
                return;
            }
            ServerInfo.time=new Date();
            broadcast(`<i class="fas fa-comment" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)} ${ws.ClientId}:\n<div class="MessageInfo"><span>${msg.body}</span></div>`);
        }
    });
    ws.on('close',()=>{
        if(ws.ClientId && !ws.USER_NAME_WRONG){
            ServerInfo.isAdmin[ws.ClientId]=false;
            ServerInfo.time=new Date();
            let EventMsg=`<i class="fas fa-user-times" style="width:20px"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n<div class="MessageInfo SignOut"><span>${ws.ClientId} left the chat room!</span></div>`;
            broadcast(EventMsg,{'color':'#e7483f'});
            broadcommand('UsrDel',[ws.ClientId]);
            ServerInfo.usrList.splice(ServerInfo.usrList.indexOf(ws.ClientId),1);
            Status=false;
        }
        ws.VERIFIED=false;
    })
});
function broadcommand(cmd,para){
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
function broadcast(msg,style){
    // console.log(style);
    if(style){
        Server.clients.forEach(Cli=>{
            if(Cli.readyState===WebSocket.OPEN){
                Cli.send(JSON.stringify({
                    headers:{
                        Content_Type:'application/message',
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
                        Content_Type:'application/message'
                    },
                    body:msg
                }));
            }
        });
    }
}
function broadcastAsAlert(msg,contentType,style){
    // console.log(style);
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