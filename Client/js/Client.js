var ws,output=$('.ChatRoom .Output'),DOC_title=$('title');
var MSGC=0,WFocus=true,M_Notice=true;
var User=new Object(),Server=new Object(),isAdmin=new Object(),isBanned=new Object();
var SendUserList=new Object(),SendNumber=0;
var SendUsers=[];
var closeNotice=new Object();
var isBannedNow=false;
var recentIPs=[];
var onlineIPs=['49.234.17.22:8080'];
const MAX_RECENTIP_LENGTH=5;
var readUrlIP=true;
function SetFeedback(func1,func2){
	func1();func2();
}
var Commands={
	"cls":{
		fun:()=>{output.empty();}
	},
	"exit":{
		fun:()=>{
			S_Status=0;S_Interface=true;
			if(ws.readyState===WebSocket.OPEN)	ws.close();
			$('.Status .Output').html(`<span class="style_error"><i class="fas fa fa-exclamation-circle" style="width:20px"></i>Please enter a chat room</span>`);
			output.html('');$('.UserInfo .Output').html('');InitWindow();
		}
	},
	"notice":{
		fun:()=>{
			M_Notice=!M_Notice;
			document.getElementById('AlertS').className=(M_Notice?"fas fa-bell style_light":"fas fa-bell-slash");
			Write(`<i class="fas fa-wrench" style="width:20px"></i> Message notice = ${M_Notice}\n`,{'type':'style_accept'})
		}
	}
},S_Status=0,S_Interface=true;
function InitWindow(){
	Write2(`<i class="fas fa-server"></i> IP Menu: \n<div style="text-align:center;"><span class="chatRoomList" style="display: inline-block;"></span></div>\n`,{},function(){
		for(var p=0;p<onlineIPs.length;p++){
			SetFeedback(function(){$(".chatRoomList").append(`<span class="onlineIPCard OIP${p+""}"><i class="fas fa-globe" style="font-size:30px;float:left;margin-right:5px;"></i><span><i class="fa fa-spinner fa-spin"></i> Online Server #${(p+1)+""}\n${onlineIPs[p]}</span></span>`);},function(){
			let Ping=new WebSocket(`ws://${onlineIPs[p]}`);
			Ping.info=p;
			Ping.onerror=()=>{
				if(S_Interface===true){
					$(`.OIP${Ping.info+""}`).html(`<i class="fas fa-globe" style="font-size:30px;float:left;margin-right:5px;"></i><span><i class="fa fa-chain-broken style_error"></i> Online IP #${(Ping.info+1)+""}\n${onlineIPs[Ping.info]}</span>`);
				}
			};
			Ping.onopen=()=>{
				if(S_Interface===true){
					$(`.OIP${Ping.info+""}`).html(`<i class="fas fa-globe" style="font-size:30px;float:left;margin-right:5px;"></i><span><i class="fa fa-link style_accept"></i> Online IP #${(Ping.info+1)+""}\n${onlineIPs[Ping.info]}</span>`);
					$(`.OIP${Ping.info+""}`).click(function(){
						if(S_Status==0)
							Send(`${onlineIPs[Ping.info]}`);
					});
					$(`.OIP${Ping.info+""}`).attr('style','cursor:pointer');
					Ping.close();
				}
			}});
		}
		for(var p=0;p<recentIPs.length;p++){
			SetFeedback(function(){$(".chatRoomList").append(`<span class="recentIPCard RIP${p+""}"><i class="fas fa-history" style="font-size:30px;float:left;margin-right:5px;"></i><span><i class="fa fa-spinner fa-spin"></i> Recent IP #${(p+1)+""}\n${recentIPs[p]}</span></span>`);},function(){
			let Ping=new WebSocket(`ws://${recentIPs[p]}`);
			Ping.info=p;
			Ping.onerror=()=>{
				if(S_Interface===true){
					$(`.RIP${Ping.info+""}`).html(`<i class="fas fa-history" style="font-size:30px;float:left;margin-right:5px;"></i><span><i class="fa fa-chain-broken style_error"></i> Recent IP #${(Ping.info+1)+""}\n${recentIPs[Ping.info]}</span>`);
				}
			};
			Ping.onopen=()=>{
				if(S_Interface===true){
					$(`.RIP${Ping.info+""}`).html(`<i class="fas fa-history" style="font-size:30px;float:left;margin-right:5px;"></i><span><i class="fa fa-link style_accept"></i> Recent IP #${(Ping.info+1)+""}\n${recentIPs[Ping.info]}</span>`);
					$(`.RIP${Ping.info+""}`).click(function(){
						if(S_Status==0)
							Send(`${recentIPs[Ping.info]}`);
					});
					$(`.RIP${Ping.info+""}`).attr('style','cursor:pointer');
					Ping.close();
				}
			}});
		}
		$(".chatRoomList").append(`<span class="newIPCard"><i class="fas fa-plus" style="font-size:30px;float:left;margin-right:5px;"></i><span>Want a new IP?\n--------------</span></span>`);
		if(getQueryVariable("ip") && readUrlIP){
			let IPByGet = getQueryVariable("ip");
			Write(`Get IP from URL : ${IPByGet}\n`);
			Send(IPByGet);
		}
		else Write(`<i class="fas fa-info-circle" style="width:20px"></i>Type the IP in [IP:port] format if you want to add IP.\n`,{'type':'style_accept'});
		readUrlIP=false;
	});
}
function flushOutput(){
  $('.UserInfo .Output').html(`<i class="fas fa-comments" style="width:20px"></i> Chat Name : ${Server.name}\n<i class="fas fa-bookmark" style="width:20px"></i> Description : ${Server.description}\n<i class="fas fa-user" style="width:20px"></i> User : ${User.name}\n<i class="fas fa-users" style="width:20px"></i> User List : \n${Server.usrList.map(x=>(SendUserList[x]===true?`<i class="fas fa-send style_accept" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`:`<i class="fas fa-send-o" style="cursor:pointer;width:20px;" onclick="changeSendUserType(\'`+x+`\')"></i>`)+(closeNotice[x]===true?`<i class="fas fa-bell-slash" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`:`<i class="fas fa-bell style_light" style="cursor:pointer;width:20px;" onclick="changeNoticeOption(\'`+x+`\')"></i>`)+(isBanned[x]?`<i class="fas fa-ban style_error" style="cursor:pointer;width:20px" onclick="ChangeInputContent(\'/unban `+x+`\')"></i>`:(isAdmin[x]?'<i class="fas fa-user-secret" style="width:20px"></i>':'<i class="fas fa-check style_accept" style="cursor:pointer;width:20px" onclick="ChangeInputContent(\'/ban '+x+'\')"></i>'))+'<i class="fas fa-at" style="cursor:pointer" onclick="AddInputContent(\'@'+x+' \')" style="width:20px"></i> '+x+(Server.tagInfo[x]?'<span class="userTag" style="background-color:'+Server.tagColor[x]+'">'+Server.tagInfo[x]+'</span>':'')).join('\n')}`);
}
function changeSendUserType(msg){
	if(msg===User.name){
		Write(`<i class="fas fa-times" style="width:20px"></i> You are not allowed to do this.\n`,{'type':'style_error'});
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
	Write(`<i class="fa fa-send" style="width:20px"></i> Set Recipient List: ${SendNumber==0?"All":'['+SendUsers.join(", ")+']'}\n`,{'type':'style_warning'});
	flushOutput();
}
function setTheme(str){
	localStorage.setItem('themeT',str,{expires:7});
	$(".setDefaultCss").attr("href",`./themes/${str}/main.css`);
	$(".setHighlightCss").attr("href",`./themes/${str}/highlight.css`);
	Write(`<i class="fas fa-eyedropper" style="width:20px"></i> Theme Changed: ${str}\n`,{'type':'style_accept'});
}
if (!window.WebSocket){
	output.html('');
	Write(`Fucking Error: No Websocket support.\n`,{'type':'style_error'});
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
		Write(`<i class="fas fa-times" style="width:20px"></i> Try to ignore yourself?\n`,{'type':'style_error'});
		return;
	}
	if(closeNotice[userName]===true)
		closeNotice[userName]=false,Write(`<i class="fas fa-eye" style="width:20px"></i> You will see messages from ${userName} now.\n`,{'type':'style_accept'});
	else	closeNotice[userName]=true,Write(`<i class="fas fa-eye-slash" style="width:20px"></i> You won\'t see messages from ${userName} now.\n`,{'type':`style_error`});
	flushOutput();
}
function Initalize(){
	ws=new WebSocket(`ws://${User.host}`);
	ws.onopen=()=>{
		$(".loadToServer:last").html(`<i class="fas fa-check style_accept" style="width:20px"></i>Connected Successfully! [-> ${User.host}]`);
		$(".loadToServer:last").addClass('style_accept');
		ws.send(JSON.stringify({
			headers:{
				"Content_Type":'application/userlist'
			}
		}));
	}
	ws.onerror=()=>{
		$(".loadToServer:last").html(`<i class="fas fa-times" style="width:20px"></i>Cannot Connect To The Server! [-> ${User.host}]`);
		$(".loadToServer:last").addClass('style_error');S_Status--;
	}
	ws.onclose=(CS_E)=>{
		if(S_Status==1){
			$(".loadToServer:last").html(`<i class="fas fa-times" style="width:20px"></i>Cannot Connect To The Server! [-> ${User.host}]`);
			$(".loadToServer:last").addClass('style_error');S_Status--;
			return;
		}
		if(S_Status==0){
			return;
		}
		$('.Status .Output').html(`<span class="style_error"><i class="fas fa fa-exclamation-circle" style="width:20px"></i>Cannot find the service</span>`);
		Write(`<i class="fa fa-exclamation-circle" style="width:20px"></i> Error Code : ${CS_E.code}\nCannot find the service.`,{'type':'style_error'});
	}
	ws.onmessage=(msg)=>{
		msg=JSON.parse(msg.data);
		if(msg.headers['Content_Type']==='application/userlist'){
			Server=msg.headers.Set_serverinfo;
			Write(`<i class="fas fa-users" style="width:20px"></i> User(s) : ${Server.usrList.join(', ')}\n`);
			S_Status++;Write("Your Unique Name: \n");
		}
		if(msg.headers['Content_Type']==='application/init'){
			//Server.usrList.splice(Server.usrList.indexOf(Para[0]),1);
			if(recentIPs.indexOf(User.host)!=-1)
				recentIPs.splice(recentIPs.indexOf(User.host),1);
			recentIPs.push(User.host);
			while(recentIPs.length>MAX_RECENTIP_LENGTH)
				recentIPs.splice(0,1);
			localStorage.setItem('recentI',recentIPs.join(','),{expires:7});
			Server=msg.headers.Set_serverinfo;
			isAdmin=Server.isAdmin;
			SendUserList[User.name]=true;
			$('.Status .Output').html('<i class="fas fa-close style_error" onclick="Send(\'/exit\')" style="cursor:pointer;width:20px"></i><i class="fas fa-bell style_light" id="AlertS" onclick="Send(\'/notice\')" style="width:20px;cursor:pointer;"></i> Chat Room');
			flushOutput();
			output.html('');
			Write(`<i class="fas fa-info-circle" style="width:20px"></i> Chat name : ${Server.name}\nUser(s) : ${Server.usrList.join(', ')}\n	   Chat Room Lite\n/cls	  | to clear the messages.\n/exit     | to exit the chat room.\n/notice   | notice on new message.\n/tag      | to set your own tag.\n/untag    | to reset your tag.\n/theme    | to set the theme.\n`,{'type':'style_accept'});
		}
		if(msg.headers['Content_Type']==='application/message'){
			if(S_Status!=3)	return;
			if(closeNotice[msg.headers['Set_Name']]===true)	return;
			if(msg.headers['Set_Rawmessage']){
				msg.body=`<div>`+msg.body+`</div><div class="showContent" data-no-cache="true"><i class="fas fa-angle-down" style="width:20px;"></i><span class="sh-btn">Unfold</span></div></div></div>`;
				if(msg.headers['Style']){
					Write2(msg.body,msg.headers['Style'],function(){
					$('.fa-comment:last').each(function(){
						$(this).css('cusorr', 'pointer');
						$(this).click(function(){
							$('.Input').val((ws.headers['Set_Rawmessage']).split('\n').map(x=>("> "+x)).join('\n'));
						});
					});
					$('.Message:last').each(function(){
						if($(this).height()<82){
							$(this).next('.showContent').hide();
						}else{
							$(this).css("height","82px");
							$(this).css("--lcollapsed-height","82px");
						}
					});
					$('.showContent:last').click(function () {
						var htm = $(this).find('.sh-btn').html();
						if (htm == "Unfold") {
							$(this).find('.sh-btn').html('Fold');
							$(this).find('i').removeClass('fas fa-angle-down').addClass('fas fa-angle-up');
							$(this).prev('.Message').css('height', 'auto');
							$(this).prev('.Message').css('--lcollapsed-height', 'auto');
						} else {
							$(this).find('.sh-btn').html('Unfold');
							$(this).find('i').removeClass('fas fa-angle-up').addClass('fas fa-angle-down');
							$(this).prev('.Message').css('height', '82px');
							$(this).prev('.Message').css('--lcollapsed-height', '82px');
						}
					});
				});}
				else Write2(msg.body,{},function(){
					$('.fa-comment:last').each(function(){
						$(this).css('cursor', 'pointer');
						$(this).click(function(){
							$('.Input').val((msg.headers['Set_Rawmessage']).split('\n').map(x=>("\n> "+x)).join(''));
						});
					});
					$('.Message:last').each(function(){
						if($(this).height()<82){
							$(this).next('.showContent').hide();
						}else{
							$(this).css("height","82px");
							$(this).css("--lcollapsed-height","82px");
						}
					});
					$('.showContent:last').click(function () {
						var htm = $(this).find('.sh-btn').html();
						if (htm == "Unfold") {
							$(this).find('.sh-btn').html('Fold');
							$(this).find('i').removeClass('fas fa-angle-down').addClass('fas fa-angle-up');
							$(this).prev('.Message').css('height', 'auto');
							$(this).prev('.Message').css('--lcollapsed-height', 'auto');
						} else {
							$(this).find('.sh-btn').html('Unfold');
							$(this).find('i').removeClass('fas fa-angle-up').addClass('fas fa-angle-down');
							$(this).prev('.Message').css('height', '82px');
							$(this).prev('.Message').css('--lcollapsed-height', '82px');
						}
					});
				});
			}
			else{
				if(msg.headers['Style']){
					Write(msg.body,msg.headers['Style']);
				}else Write(msg.body);
			}
		}
		if(msg.headers['Content_Type']==='application/command'){
			RemoteCommands[msg.headers['Command']](msg.headers['Parameter']);
		}
		if(msg.headers['Content_Type']==='application/adminChange'){
			Server=msg.headers.Set_serverinfo;
			if(!isAdmin[User.name] && Server.isAdmin[User.name])
				Write("<i class='fas fa-cogs' style='width:20px'></i> You are set as adminstrator from the server.\n",{'type':'style_accept'});
			else if(isAdmin[User.name] && !Server.isAdmin[User.name])
				Write("<i class='fas fa-cogs' style='width:20px'></i> You are set as common user from the server.\n",{"type":"style_error"});
			else	Write(msg.body,msg.headers['Style']);
			isAdmin=Server.isAdmin;
			flushOutput();
		}
		if(msg.headers['Content_Type']==='application/banChange'){
			Server=msg.headers.Set_serverinfo;
			let banTime=Server.BanTime;
			isBanned=Server.isBanned;
			flushOutput();
			if(Server.BanName===User.name){
				Write(`<i class='fas fa-ban' style='width:20px'></i> You are banned for ${banTime/1000}s from the server.\n`,{"type":"style_error"});
				isBannedNow=true;
				$(".Input").attr("readOnly",true);
				setTimeout("unbanSelf()",banTime);
			}
			else	Write(msg.body,msg.headers['Style']);
		}
		if(msg.headers['Content_Type']==='application/unbanChange'){
			Server=msg.headers.Set_serverinfo;
			isBanned=Server.isBanned;
			flushOutput();
			if(Server.BanName===User.name){
				isBannedNow=false;
				$(".Input").attr("readOnly",false);
				Write(`<i class='fas fa-commenting' style='width:20px'></i> You are unbanned.\n`,{'type':'style_accept'});
			}
			else	Write(msg.body,msg.headers['Style']);
		}
		if(msg.headers['Content_Type']==='application/changeUserTag'){
			Server=msg.headers.Set_serverinfo;
			if(S_Status!=3)	return;
			if(msg.headers['Style']){
				Write(msg.body,msg.headers['Style']);
			}else Write(msg.body);
			flushOutput();
		}
	}
}
var RemoteCommands={
	"UsrAdd":(Para)=>{
		if(Server.usrList){
			Server.usrList.push(Para[0]);
			flushOutput();
		}
	},
	"UsrDel":(Para)=>{
		if(Server.usrList){
			Server.usrList.splice(Server.usrList.indexOf(Para[0]),1);
			isAdmin[Para[0]]=false;
			closeNotice[Para[0]]=false;
			if(SendUserList[Para[0]]===true)
				SendUsers.splice(SendUsers.indexOf(Para[0]),1),--SendNumber;
			SendUserList[Para[0]]=false;
			flushOutput();
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
			Write(`<i class="fas fa-times" style="width:20px"></i> The command is disabled as you are not an adminstrator.\n`,{"type":"style_error"});
		else if(Server.usrList.indexOf(cmd[1])===-1)
			Write(`<i class="fas fa-times" style="width:20px"></i> User ${cmd[1]} Not Found.\n`,{"type":"style_error"});
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
			Write(`<i class="fas fa-times" style="width:20px"></i> The command is disabled as you are not an adminstrator.\n`,{"type":"style_error"});
		else if(Server.usrList.indexOf(cmd[1])===-1)
			Write(`<i class="fas fa-times" style="width:20px"></i> User ${cmd[1]} Not Found.\n`,{"type":"style_error"});
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
			Write(`<i class="fas fa-times" style="width:20px"></i> Code Not Found.\n`,{"type":"style_error"});
	}
	else if(cmd[0]==="tag"){
		if(cmd.length<3){
			Write(`<i class="fas fa-times" style="width:20px"></i> Argument List Length Error!\n`,{"type":"style_error"});
			return;
		}
		User.tName = cmd[1];
		User.tColor= cmd[2];
		if(User.tName.length>10){
			Write(`<i class="fas fa-times" style="width:20px"></i> Tag Name Longer Than 10!\n`,{"type":"style_error"});
			return;
		}
		if(!testColor(User.tColor)){
			Write(`<i class="fas fa-times" style="width:20px"></i> Invalid Tag Color！\n`,{"type":"style_error"});
			return;
		}
		ws.send(JSON.stringify({
			headers:{
				Content_Type:'application/changeUserTag',
				Set_Taginfo:User.tName,
				Set_Tagcolor:User.tColor
			}
		}));
	}
	else if(cmd[0]==="untag"){
		ws.send(JSON.stringify({
			headers:{
				Content_Type:'application/closeUserTag'
			}
		}));
	}
	else if(cmd[0]==="theme"){
		if(cmd.length<2){
			Write(`<i class="fas fa-times" style="width:20px"></i> Argument List Length Error!\n`,{"type":"style_error"});
			return;
		}
		setTheme(cmd[1]);
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
function testColor(color) {
    var re1 = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i
    var re2 = /^rgb\(([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\)$/i
    var re3 = /^rgba\(([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,(1|1.0|0.[0-9])\)$/i
    return re1.test(color) || re2.test(color) || re3.test(color);
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
			Write(`<i class="fas fa-check" style="width:20px"></i> Get Name: ${User.name}\n`,{'type':"style_accept"});
			S_Status++;S_Interface=false;
			Commands.cls.fun();
			ws.send(JSON.stringify({
				headers:{
					"Content_Type":'application/init',
					"Set_Name":User.name
				}
			}));
		}
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
	if(localStorage.getItem('recentI')==undefined)
		localStorage.setItem('recentI',"",{expires:7});
	var rI = localStorage.getItem('recentI');
	if(rI!=="")
		recentIPs=rI.split(',');
	else	recentIPs=[];
	InitWindow();
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
		let StyleText="";
		Object.keys(style).forEach(key=>{
			// StyleText.push(`${key}:${style[key]}`);
			StyleText+=(style[key]+' ');
		});
		output.append(`<span class='${StyleText}'>${msg}</span>`);
	}else output.append(msg);
	if(scrollBotton)
		output.scrollTop(output[0].scrollHeight);
}
