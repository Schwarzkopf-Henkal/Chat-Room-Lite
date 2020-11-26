var ws,output=$('.ChatRoom .Output'),DOC_title=$('title');
var MSGC=0,WFocus=true,M_Notice=false;
var User=new Object(),Server=new Object();
if (!window.WebSocket){
    output.html('');
    Write(`Fucking Error: No Websocket support.\n`,{'color':"#e7483f"});
}
function Initalize(){
    ws=new WebSocket(`ws://${User.host}:${User.port}`);
    Commands.cls.fun();
    ws.onopen=()=>{
        ws.send(JSON.stringify({
            headers:{
                "Content_Type":'application/init',
                "Set_Name":User.name
            }
        }));
    }
    ws.onclose=(CS_E)=>{
        console.log(CS_E);
        $('.Status .Output').html(`<span style='color:#e7483f;'>Cannot find the service</span>`);
        Write(`[ERROR] Error Code : ${CS_E.code}\nCannot find the service.`,{'color':"#e7483f"});
    }
    ws.onmessage=(msg)=>{
        // console.log(msg);
        msg=JSON.parse(msg.data);
        if(msg.headers['Content_Type']==='application/init'){
            Server=msg.headers.Set_serverinfo;
            $('.Status .Output').html('Chat Room');
            $('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   <i class="fas fa-check" style="color:#13c60d;width:20px"></i> '+x).join('\n')}`);
            output.html('');
            Write(`<i class="fas fa-info-circle" style="width:20px"></i> Chat name : ${Server.name}\nUser(s) : ${Server.usrList.join(', ')}\n               JS Chat Room\n/cls      | to clear the messages.\n/exit     | to exit the chat room.\n/notice   | notice on new message.\n`,{"color":"#13c60d"});
        }
        if(msg.headers['Content_Type']==='application/message'){
            if(msg.headers['Style']){
                Write(msg.body+'\n',msg.headers['Style']);
            }else Write(msg.body+'\n');
        }
        if(msg.headers['Content_Type']==='application/command'){
            RemoteCommands[msg.headers['Command']](msg.headers['Parameter']);
        }
    }
}
var RemoteCommands={
    "UsrAdd":(Para)=>{
        if(Server.usrList){
            Server.usrList.push(Para[0]);
            $('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   <i class="fas fa-check" style="color:#13c60d;width:20px"></i> '+x).join('\n')}`);
        }
    },
    "UsrDel":(Para)=>{
        if(Server.usrList){
            Server.usrList.splice(Server.usrList.indexOf(Para[0]),1);
            $('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>'   <i class="fas fa-check" style="color:#13c60d;width:20px"></i> '+x).join('\n')}`);
        }
    }
}
var Commands={
    "cls":{
        fun:()=>{output.empty();}
    },
    "exit":{
        fun:()=>{ws.close()}
    },
    "notice":{
        fun:()=>{
            M_Notice=!M_Notice;
            Write(`<i class="fas fa-wrench"></i> Message notice=${M_Notice}\n`,{"color":"#13c60d"})
        }
    }
},S_Status=0,S_Interface=true;
function Send(msg){
    S_Interface=false;
    if(S_Status!==3){
        if(S_Status===0){
            User.host=msg;
            S_Status++;
            Write(`<i class="fas fa-check" style="color:#13c60d;width:20px"></i> Get Host IP : ${User.host}\n`,{'color':'#13c60d'});
            Write(`Service Port : \n`);
        }else if(S_Status===1){
            User.port=parseInt(msg);
            S_Status++;
            Write(`<i class="fas fa-check" style="color:#13c60d;width:20px"></i> Get Service Port : ${User.port}\n`,{'color':'#13c60d'});
            Write(`Your Name : \n`);
        }else if(S_Status===2){
            User.name=msg;
            S_Status++;
            Initalize();
        }
    }else if(msg[0]==='/'&&Commands[msg.substr(1)]){
        Commands[msg.substr(1)].fun();
    }else {
        ws.send(JSON.stringify({
            headers:{
                Content_Type:'application/message'
            },
            body:msg
        }))
    }
}
window.onload=()=>{
    Write(`Host IP : \n<i class="fa fa-spinner fa-spin" style="width:20px"></i> Public Room: 49.234.17.22:8080 <span style='color:grey;'>·Pending</span>\n`);
    let Ping=new WebSocket('ws://49.234.17.22:8080');
    Ping.onerror=()=>{
        if(S_Interface===true){
            output.empty();
            Write(`Host IP : \n<i class="fas fa-chain-broken" style="color:#e7483f;width:20px"></i> Public Room: 49.234.17.22:8080 <span style='color:#e7483f;'>·Offline</span>\n`);
        }
    };
    Ping.onopen=()=>{
        if(S_Interface===true){
            output.empty();
            Write(`Host IP : \n<i class="fas fa-link" style="color:#13c60d;width:20px"></i> Public Room: 49.234.17.22:8080 <span style='color:#13c60d;'>·Online</span>\n`);
            Ping.close();
        }
    }
}
window.onfocus=()=>{
    WFocus=true;
    DOC_title.html(`JS Chat Room`);
}
window.onblur=()=>{
    WFocus=false;
    MSGC=0;
}
function MSGC_SS(){
    if(WFocus===false&&M_Notice){
        MSGC++;
        DOC_title.html(`(${MSGC}) JS Chat Room`);
    }
}
function Write(msg,style){
    MSGC_SS();
    let EXC='';
    var nextCharacter;
    //在实现@功能的时候，我只能通过创建一个用于Exchange的数组来完成/fn
    for(let i=0,r;i<msg.length;i=r+1){
        r=i;
        let ifMatched=false;
        if(msg[i]==='@'){
            for(let j=0;j<Server.usrList.length;j++)
                if(i+Server.usrList[j].length<msg.length){
                    ifMatched=true;
                    for(let k=1;k<=Server.usrList[j].length;k++)
                        if(Server.usrList[j][k-1]!=msg[i+k]){
                            ifMatched=false;
                            break;
                        }
                    let nextCharacter = i+Server.usrList[j].length+1;
                    if(ifMatched && (nextCharacter>=msg.length || msg[nextCharacter]===' ' || msg[nextCharacter]==='\t' || msg[nextCharacter]==='\n')){
                        EXC+=`<span class='fuckat'>${msg.substr(i,Server.usrList[j].length+1)}</span>`;
                        r=i+Server.usrList[j].length;
                        break;
                    }
                    ifMatched=false;
                }
        }
        if(ifMatched===false)
            EXC+=msg[i];
    }
    msg=EXC;
    // console.log(EXC);
    if(style){
        let StyleText=[];
        Object.keys(style).forEach(key=>{
            StyleText.push(`${key}:${style[key]}`);
        });
        StyleText=StyleText.join(';');
        output.html(`${output.html()}<span style='${StyleText}'>${msg}</span>`)
    }else {
        output.html(output.html()+msg);
    }
}
