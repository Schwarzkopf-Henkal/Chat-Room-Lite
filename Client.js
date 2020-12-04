var ws,output=$('.ChatRoom .Output'),DOC_title=$('title');
var MSGC=0,WFocus=true,M_Notice=true;
var User=new Object(),Server=new Object(),isAdmin=new Object(),isBanned=new Object();
var SendUserList=new Object(),SendNumber=0;
var SendUsers=[];
var closeNotice=new Object();
var isBannedNow=false;
function changeSendUserType(msg){
	if(msg===User.name){
		Write(`<i class="fas fa-times" style="width:20px"></i> You are not allowed to do this.\n`,{'color':"#e7483f"});
		return;
	}
	if(SendUserList[msg]===true){
		SendUserList[msg]=false;
		--SendNumber;
		SendUsers.splice(SendUsers.indexOf(msg),1);
	}
	else{
		SendUserList[msg]=true;
		++SendNumber;
		SendUsers.push(msg);
	}
	Write(`<i class="fa fa-send" style="width:20px"></i> Set Recipient List: ${SendNumber==0?"All":'['+SendUsers.join(", ")+']'}\n`,{'color':'#ffff00'});
	$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description :\n    ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>' '+(SendUserList[x]===true?`<i class="fas fa-send" style="cursor:pointer;width:20px;color:#13c60d" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
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
			document.getElementById('AlertS').className=(M_Notice?"fas fa-bell light":"fas fa-bell-slash");
			Write(`<i class="fas fa-wrench" style="width:20px"></i> Message notice = ${M_Notice}\n`,{"color":"#13c60d"})
		}
	}
},S_Status=0,S_Interface=true;
if (!window.WebSocket){
	output.html('');
	Write(`Fucking Error: No Websocket support.\n`,{'color':"#e7483f"});
}
function ChangeInputContent(str){
	$('.Input').val(str);
}
function AddInputContent(str){
	$('.Input').val($('.Input').val()+str);
}
function unbanSelf(){
	ws.send(JSON.stringify({
		headers:{
			"Content_Type":'application/unbanUser',
			"Set_Name":User.name
		}
	}));
}
function changeNoticeOption(userName){
	if(userName===User.name){
		Write(`<i class="fas fa-times" style="width:20px"></i> Try to ignore yourself?\n`,{'color':"#e7483f"});
		return;
	}
	if(closeNotice[userName]===true)
		closeNotice[userName]=false,Write(`<i class="fas fa-eye" style="width:20px"></i> You will see messages from ${userName} now.\n`,{'color':`#13c60d`});
	else	closeNotice[userName]=true,Write(`<i class="fas fa-eye-slash" style="width:20px"></i> You won\'t see messages from ${userName} now.\n`,{'color':`#e7483f`});
	$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description :\n    ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>' '+(SendUserList[x]===true?`<i class="fas fa-send" style="cursor:pointer;width:20px;color:#13c60d" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
}
function Initalize(){
	ws=new WebSocket(`ws://${User.host}`);
	ws.onopen=()=>{
		$(".loadToServer").html(`<i class="fas fa-check" style="color:#13c60d;width:20px"></i> Connected Successfully!`);
		$(".loadToServer").attr("style","color:#13c60d");
		ws.send(JSON.stringify({
			headers:{
				"Content_Type":'application/userlist'
			}
		}));
	}
	ws.onerror=()=>{
		$(".loadToServer").html(`<i class="fas fa-times" style="color:#e7483f;width:20px"></i> Cannot Connect To The Server!`);
		$(".loadToServer").attr("style","color:#e7483f");
	}
	ws.onclose=(CS_E)=>{
		if(S_Status==1){
			$(".loadToServer").html(`<i class="fas fa-times" style="color:#e7483f;width:20px"></i> Cannot Connect To The Server!`);
			$(".loadToServer").attr("style","color:#e7483f");
			return;
		}
		$('.Status .Output').html(`<span style='color:#e7483f;'><i class="fas fa fa-exclamation-circle" style="width:20px"></i>Cannot find the service</span>`);
		Write(`<i class="fa fa-exclamation-circle" style="width:20px"></i> Error Code : ${CS_E.code}\nCannot find the service.`,{'color':"#e7483f"});
	}
	ws.onmessage=(msg)=>{
		msg=JSON.parse(msg.data);
		if(msg.headers['Content_Type']==='application/userlist'){
			Server=msg.headers.Set_serverinfo;
			Write(`<i class="fas fa-users" style="width:20px"></i> User(s) : ${Server.usrList.join(', ')}\n`);
			S_Status++;Write("Your Unique Name: \n");
		}
		if(msg.headers['Content_Type']==='application/init'){
			Server=msg.headers.Set_serverinfo;
			isAdmin=Server.isAdmin;
			SendUserList[User.name]=true;
			$('.Status .Output').html('<i class="fas fa-close" onclick="Send(\'/exit\')" style="cursor:pointer;color:#e7483f;width:20px"></i><i class="fas fa-bell light" id="AlertS" onclick="Send(\'/notice\')" style="width:20px;cursor:pointer;"></i> Chat Room');
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description :\n    ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>' '+(SendUserList[x]===true?`<i class="fas fa-send" style="cursor:pointer;width:20px;color:#13c60d" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
			output.html('');
			Write(`<i class="fas fa-info-circle" style="width:20px"></i> Chat name : ${Server.name}\nUser(s) : ${Server.usrList.join(', ')}\n	   Chat Room Lite\n/cls	  | to clear the messages.\n/exit     | to exit the chat room.\n/notice   | notice on new message.\n`,{"color":"#13c60d"});
		}
		if(msg.headers['Content_Type']==='application/message'){
			if(S_Status!=3)	return;
			if(closeNotice[msg.headers['Set_Name']]===true)	return;
			if(msg.headers['Set_Rawmessage'])
				msg.body=msg.body+msg.headers['Set_Rawmessage']+`</span></div>`;
			if(msg.headers['Style']){
				Write(msg.body,msg.headers['Style']);
			}else Write(msg.body);
		}
		if(msg.headers['Content_Type']==='application/command'){
			RemoteCommands[msg.headers['Command']](msg.headers['Parameter']);
		}
		if(msg.headers['Content_Type']==='application/adminChange'){
			Server=msg.headers.Set_serverinfo;
			if(!isAdmin[User.name] && Server.isAdmin[User.name])
				Write("<i class='fas fa-cogs' style='width:20px'></i> You are set as adminstrator from the server.\n",{"color":"#13c60d"});
			else if(isAdmin[User.name] && !Server.isAdmin[User.name])
				Write("<i class='fas fa-cogs' style='width:20px'></i> You are set as common user from the server.\n",{"color":"#e7483f"});
			else	Write(msg.body,msg.headers['Style']);
			isAdmin=Server.isAdmin;
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description :\n    ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>' '+(SendUserList[x]===true?`<i class="fas fa-send" style="cursor:pointer;width:20px;color:#13c60d" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
		}
		if(msg.headers['Content_Type']==='application/banChange'){
			Server=msg.headers.Set_serverinfo;
			let banTime=Server.BanTime;
			isBanned=Server.isBanned;
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description :\n    ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>' '+(SendUserList[x]===true?`<i class="fas fa-send" style="cursor:pointer;width:20px;color:#13c60d" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
			if(Server.BanName===User.name){
				Write(`<i class='fas fa-ban' style='width:20px'></i> You are banned for ${banTime/1000}s from the server.\n`,{"color":"#e7483f"});
				isBannedNow=true;
				$(".Input").attr("readOnly",true);
				setTimeout("unbanSelf()",banTime);
			}
			else	Write(msg.body,msg.headers['Style']);;
		}
		if(msg.headers['Content_Type']==='application/unbanChange'){
			Server=msg.headers.Set_serverinfo;
			isBanned=Server.isBanned;
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description :\n    ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>' '+(SendUserList[x]===true?`<i class="fas fa-send" style="cursor:pointer;width:20px;color:#13c60d" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
			if(Server.BanName===User.name){
				isBannedNow=false;
				$(".Input").attr("readOnly",false);
				Write(`<i class='fas fa-commenting' style='width:20px'></i> You are unbanned.\n`,{"color":"#13c60d"});
			}
			else	Write(msg.body,msg.headers['Style']);
		}
	}
}
var RemoteCommands={
	"UsrAdd":(Para)=>{
		if(Server.usrList){
			Server.usrList.push(Para[0]);
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description :\n    ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>' '+(SendUserList[x]===true?`<i class="fas fa-send" style="cursor:pointer;width:20px;color:#13c60d" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
		}
	},
	"UsrDel":(Para)=>{
		if(Server.usrList){
			Server.usrList.splice(Server.usrList.indexOf(Para[0]),1);
			isAdmin[Para[0]]=false;
			closeNotice[Para[0]]=false;
			if(SendUserList[Para[0]])
				SendUsers.splice(SendUsers.indexOf(Para[0]),1);
			SendNumber-=SendUserList[Para[0]];
			SendUserList[Para[0]]=false;
			$('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description :\n    ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>' '+(SendUserList[x]===true?`<i class="fas fa-send" style="cursor:pointer;width:20px;color:#13c60d" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban" style="cursor:pointer;color:#e7483f;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check" style="cursor:pointer;color:#13c60d;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x).join('\n')}`);
		}
	}
}
function checkEmpty(msg){
	for(var i=0;i<msg.length;i++)
		if(!(msg[i]==' ' || msg[i]=='\n' || msg[i]=='\r' || msg[i]=='\t'))
			return false;
	return true;
}
function parseCommand(msg){
	let cmd=msg.trim().split(/\s+/);
	if(cmd.length==1 && Commands[cmd[0]])
		Commands[cmd[0]].fun();
	else if(cmd[0]==="ban"){
		if(!isAdmin[User.name])
			Write(`<i class="fas fa-times" style="width:20px"></i> The command is disabled as you are not an adminstrator.\n`,{"color":"#e7483f"});
		else if(Server.usrList.indexOf(cmd[1])===-1)
			Write(`<i class="fas fa-times" style="width:20px"></i> User ${cmd[1]} Not Found.\n`,{"color":"#e7483f"});
		else{
			var banSecond=60;
			if(cmd.length>2)	banSecond=parseInt(cmd[2]);
			ws.send(JSON.stringify({
				headers:{
					"Content_Type":'application/banUser',
					"Set_Name":cmd[1],
					"Ban_Time":banSecond*1000
				}
			}));
		}
	}
	else if(cmd[0]==="unban"){
		if(!isAdmin[User.name])
			Write(`<i class="fas fa-times" style="width:20px"></i> The command is disabled as you are not an adminstrator.\n`,{"color":"#e7483f"});
		else if(Server.usrList.indexOf(cmd[1])===-1)
			Write(`<i class="fas fa-times" style="width:20px"></i> User ${cmd[1]} Not Found.\n`,{"color":"#e7483f"});
		else{
			ws.send(JSON.stringify({
				headers:{
					"Content_Type":'application/unbanUser',
					"Set_Name":cmd[1]
				}
			}));
		}
	}
	else if(cmd[0]==="verify"){
		if(cmd.length>1)
			ws.send(JSON.stringify({
				headers:{
					"Content_Type":'application/verifyIdentity',
					"Set_Code":cmd[1]
				}
			}));
		else
			Write(`<i class="fas fa-times" style="width:20px"></i> Code Not Found.\n`,{"color":"#e7483f"});
	}
	else{
		ws.send(JSON.stringify({
			headers:{
				Content_Type:'application/message',
				Set_Sendnumber:SendNumber,
				Set_Senduserlist:SendUserList
			},
			body:'/'+msg
		}))
	}
}
function Send(msg){
	if(checkEmpty(msg))	return;
	snsArr=msg.split(/[(\r\n)\r\n]+/);
	let idx=0;
	for(;idx<snsArr.length;idx++)
		if($.trim(snsArr[idx])!="")
			break;
	if(S_Status!==3){
		if(S_Status===0){
			User.host=$.trim(snsArr[idx]);
			S_Status++;
			Write2(`<span class="loadToServer"><i class="fa fa-spinner fa-spin"></i> Loading to the server : ${User.host} ... </span>\n`,{},Initalize);
		}else if(S_Status===2){
			User.name=$.trim(snsArr[idx]);
			S_Status++;S_Interface=false;
			Commands.cls.fun();
			ws.send(JSON.stringify({
				headers:{
					"Content_Type":'application/init',
					"Set_Name":User.name
				}
			}));
		}
		else ;
	}
	else if(msg[0]==='/'){
		parseCommand(msg.substr(1));
	}else {
		ws.send(JSON.stringify({
			headers:{
				Content_Type:'application/message',
				Set_Sendnumber:SendNumber,
				Set_Senduserlist:SendUserList
			},
			body:msg
		}))
	}
}
function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return(false);
}
window.onload=()=>{
	Write2(`<i class="fas fa-globe"></i> IP List: \n<span class="chatRoomList"><i class="fa fa-spinner fa-spin"></i> Public Room: 49.234.17.22:8080 <span style='color:grey;'>·Pending</span></span>\n`,{},function(){
		let Ping=new WebSocket('ws://49.234.17.22:8080');
		Ping.onerror=()=>{
			if(S_Interface===true){
				$(".chatRoomList").html(`<i class="fas fa-chain-broken" style="color:#e7483f;width:20px"></i> Public Room: 49.234.17.22:8080 <span style='color:#e7483f;'>·Offline</span>`);
			}
		};
		Ping.onopen=()=>{
			if(S_Interface===true){
				$(".chatRoomList").html(`<span onclick="if(S_Status==0) Send('49.234.17.22:8080');" style="cursor:pointer"><i class="fas fa-link" style="color:#13c60d;width:20px"></i> Public Room: 49.234.17.22:8080 <span style='color:#13c60d;'>·Online</span></span>`);
				Ping.close();
			}
		}
		if(getQueryVariable("ip")){
			let IPByGet = getQueryVariable("ip");
			Write(`Get IP from URL : ${IPByGet}\n`);
			Send(IPByGet);
		}
		else Write(`Host IP [IP:port] :\n`);
	});
	
}
window.onfocus=()=>{
	WFocus=true;
	DOC_title.html(`Chat Room Lite`);
}
window.onblur=()=>{
	WFocus=false;
	MSGC=0;
}
window.onbeforeunload = function() {
    ws.close();
}
function MSGC_SS(){
	if(WFocus===false&&M_Notice){
		MSGC++;
		DOC_title.html(`(${MSGC}) Chat Room Lite`);
	}
}
function Write2(msg,style,callback){
	Write(msg,style);
	callback();
}
function Write(msg,style){
	let scrollBotton=false;
	if(output.scrollTop()+14>output[0].scrollHeight-output.height())	scrollBotton=true;
	MSGC_SS();
	let EXC='';
	var nextCharacter;
	//在实现@功能的时候，我只能通过创建一个用于Exchange的数组来完成/fn
	for(let i=0,r;i<msg.length;i=r+1){
		r=i;
		let ifMatched=false;
		if(msg[i]==='@'){
			for(let j=0;j<Server.usrList.length;j++)
				if(User.name === Server.usrList[j] && i+Server.usrList[j].length<msg.length){
					ifMatched=true;
					for(let k=1;k<=Server.usrList[j].length;k++)
						if(Server.usrList[j][k-1]!=msg[i+k]){
							ifMatched=false;
							break;
						}
					let nextCharacter = i+Server.usrList[j].length+1;
					if(ifMatched && (nextCharacter>=msg.length-14 || msg[nextCharacter]===' ' || msg[nextCharacter]==='\t' || msg[nextCharacter]==='\n')){
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
	if(style){
		let StyleText=[];
		Object.keys(style).forEach(key=>{
			StyleText.push(`${key}:${style[key]}`);
		});
		StyleText=StyleText.join(';');
		output.append(`<span style='${StyleText}'>${msg}</span>`);
	}else output.append(msg);
	if(scrollBotton)
		output.scrollTop(output[0].scrollHeight);
}