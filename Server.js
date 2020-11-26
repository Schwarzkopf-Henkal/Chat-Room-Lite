'use scrict';
const WebSocket = require('ws');
const cin=require("readline-sync");
const fs=require('fs');
var ServerInfo=new Object();
ServerInfo.usrList=[];
ServerInfo.time=new Date();
console.log(`请输入服务器端口：`);
ServerInfo.port=parseInt(cin.question('>'));
console.log(`请输入对话名字：`);
ServerInfo.name=cin.question('>');
const Server = new WebSocket.Server({ port: ServerInfo.port });
console.log(`机房聊天工具【服务端】\n服务器端口：[${ServerInfo.port}]\n对话名字：${ServerInfo.name}\n`);
console.log(`时间:${ServerInfo.time.toDateString()}\n-----------------------\n`);
var Filename=`chat_${ServerInfo.time.toDateString().split(' ').join('-')}.log`;
var Bufp=`*-*-*-*-*[${ServerInfo.time.toDateString()}]*-*-*-*-*\n\n`;
fs.writeFile(Filename,``,(err,stats)=>{
    if(err){
        console.log('ERROR : data file cannot be opened!\n');
        process.exit();
    }
})
//---Commandline Depot
const readline=require('readline');
var scanf=readline.createInterface({
    input:process.stdin,
    output:process.stdout
});
(()=>{
    let LocalCommands={
        "list":{
            fun:()=>{
                console.log(ServerInfo.usrList.map(usr=>'|---'+usr).join('\n'));
            },
            Parameter:false
        },
        "log":{
            fun:()=>{
                //当然，一开始就没怎么想着要做服务器日志的功能，所以显然只能输出一些没啥用的东西。
                console.log(Bufp);
            },
            Parameter:false
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
                            body:"<i class='fas fa-ban'></i> You are banned from the server."
                        }));
                        Cli.close();
                        broadcast(`<i class="fa fa-exclamation-triangle"></i> @${Cli.ClientId} is banned from the server.`,{"color":"#ffff00"})
                        Bantotal++;
                    }
                });
                console.log(`Banned ${Bantotal} users in total.`);
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
    let ip=Req.connection.remoteAddress;
    let port=Req.connection.remotePort;
    let ClientId,Status=false;
    // console.log(ws.url);
    // ws.
    ws.on('message',msg=>{
        msg=JSON.parse(msg);
        if(msg.headers['Content_Type']==='application/init'){
            ClientId=msg.headers['Set_Name'];
            // console.log(`${ClientId}`);
            ServerInfo.time=new Date();
            let EventMsg=`<i class="fas fa-user-plus"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n${ClientId} entered the chat room!`;
            Bufp+=EventMsg;
            broadcast(EventMsg,{'color':'#13c60d'});
            broadcommand('UsrAdd',[ClientId]);
            ServerInfo.usrList.push(ClientId);
            Status=true;
            ws.ClientId=ClientId;
            ws.send(JSON.stringify({
                headers:{
                    Content_Type:'application/init',
                    Set_serverinfo:ServerInfo
                }
            }));
        }else if(msg.headers.Content_Type==='application/message'){
            broadcast(`${ServerInfo.time.toTimeString().substring(0,8)} ${ClientId}: ${msg.body}`);
        }
    });
    ws.on('close',()=>{
        if(ClientId){
            ServerInfo.time=new Date();
            let EventMsg=`<i class="fas fa-user-times"></i> ${ServerInfo.time.toTimeString().substring(0,8)}\n${ClientId} left the chat room!`;
            Bufp+=EventMsg;
            broadcast(EventMsg,{'color':'#e7483f'});
            broadcommand('UsrDel',[ClientId]);
            ServerInfo.usrList.splice(ServerInfo.usrList.indexOf(ClientId),1);
            Status=false;
        }
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
