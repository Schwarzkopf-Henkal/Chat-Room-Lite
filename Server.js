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
Server.on('connection',(ws,Req)=>{
    let ip=Req.connection.remoteAddress;
    let port=Req.connection.remotePort;
    let ClientId,Status=false;
    ws.on('message',msg=>{
        msg=JSON.parse(msg);
        if(msg.headers['Content_Type']==='application/init'){
            ClientId=msg.headers['Set_Name'];
            // console.log(`${ClientId}`);
            ServerInfo.time=new Date();
            let EventMsg=`[NOTE] ${ServerInfo.time.toTimeString().substring(0,8)}\n${ClientId} entered the chat room!`;
            Bufp+=EventMsg;
            broadcast(EventMsg,{'color':'#13c60d'});
            broadcommand('UsrAdd',[ClientId]);
            ServerInfo.usrList.push(ClientId);
            Status=true;
            ws.send(JSON.stringify({
                headers:{
                    Content_Type:'application/init',
                    Set_serverinfo:ServerInfo
                }
            }));
        }else if(msg.headers.Content_Type==='application/message'){
            broadcast(`[INFO] ${ClientId}: ${msg.body}`);
        }
    });
    ws.on('close',()=>{
        if(ClientId){
            ServerInfo.time=new Date();
            let EventMsg=`[NOTE] ${ServerInfo.time.toTimeString().substring(0,8)}\n${ClientId} left the chat room!`;
            Bufp+=EventMsg;
            broadcast(EventMsg,{'color':'#13c60d'});
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