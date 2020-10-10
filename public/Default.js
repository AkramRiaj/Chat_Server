

var socket;

var tempUserName = '';  

var userListPermanent = {};

var userList = [];


$(document).ready(function ()
{
    socket = io.connect('http://localhost:8080');
    socket.on('connect', addUser);
    socket.on('updatechat', processMessage);
    socket.on('updateusers', updateUserList);
    socket.on('base64 file', FileProcess);
    $('#datasend').click(sendMessage);
    $('#data').keypress(processEnterPress);
	$('#userSearch').keyup(userSearch);


    $('#uploadfile').bind('change', function (e) {
        var data = e.originalEvent.target.files[0];
        readThenSendFile(data);
    });
});


function userSearch(e)
{
     if($('#userSearch').val() == '')
     {

                  $('#users').empty();
                  $.each(userListPermanent, function (key, value) {
                  $('#users').append('<div>' + key + '</div>');
                  });

     }else
     {
        
           var seachValue = $('#userSearch').val();
           var searchBasedName = {};
           for(var l =0 ; l < userList.length ; l++)
           {
                 if(userList[l].startsWith(seachValue)==true)
                 {
		    searchBasedName[userList[l]]=userList[l];
                 } 
           }

          if ($.isEmptyObject(searchBasedName))
          {

                  $('#users').empty();
                  $.each(userListPermanent, function (key, value) {
                  $('#users').append('<div>' + key + '</div>');
                  });
            
          }else
          {

                  $('#users').empty();
                  $.each(searchBasedName, function (key, value) {
                  $('#users').append('<div>' + key + '</div>');
                  });

          }

     }
}




function readThenSendFile(data) {

    var reader = new FileReader();
    reader.onload = function (evt) {
        var msg = {};
        msg.username = tempUserName;
        msg.file = evt.target.result;
        msg.fileName = data.name;
        socket.emit('base64 file', msg);
    };
    reader.readAsDataURL(data);
}


function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function FileProcess( msg) 
{

        var fileExtension =  msg.fileName.substr((msg.fileName.lastIndexOf('.') + 1));
        var allowedImage = ['jpg','jpeg','png','gif'];
        if(isInArray(fileExtension , allowedImage))
		{

           var canv = document.createElement("canvas");
           var randomNumber = Math.floor((Math.random() * 100000) + 1);
           canv.setAttribute("id", "can_" + randomNumber);
           var ctx = canv.getContext('2d');
           var img1 = new Image();
           img1.onload = function () {
            ctx.drawImage(img1, 0, 0);
        }
        img1.src = msg.file;
        document.getElementById("conversation").insertBefore(canv , document.getElementById("conversation").firstChild);
           
         var dataDiv = document.createElement('div');
		 dataDiv.innerHTML = ( msg.username + ':' + msg.fileName);
		
		document.getElementById("conversation").insertBefore(dataDiv, document.getElementById("conversation").firstChild);
      
         }
		 else
         {

          
          var aElem = document.createElement('a');
          aElem.href=msg.file; 
          var aElemTN = document.createTextNode(msg.username + ':' + msg.fileName); 
          aElem.appendChild(aElemTN);
          document.getElementById("conversation").insertBefore(aElem , document.getElementById("conversation").firstChild);
        
          
         
         }
     
       
}





function addUser()
{
    tempUserName = prompt("What's your name?");
    socket.emit('adduser', tempUserName);
	
}

function processMessage(username, data) {

    var dataDiv = document.createElement('div');
    dataDiv.innerHTML = '<b>' + username + ': </b>' + data  + '<br />';
    document.getElementById("conversation").insertBefore(dataDiv , document.getElementById("conversation").firstChild);
  
}


function updateUserList(data) {
    $('#users').empty();
    userListPermanent = {};
    userList = [] ;
    var increment = 0;
    $.each(data, function (key, value) {

        $('#users').append('<div>' + key + '</div>');
	userListPermanent[key]=key;
        userList[increment] = key;
        increment = increment + 1;
        
    });
}

function sendMessage()
{
    var message = $('#data').val();
    $('#data').val('');
    socket.emit('sendchat', message);
    $('#data').focus();
}

function processEnterPress(e)
{
    if (e.which == 13) {
        e.preventDefault();
        $(this).blur();
        $('#datasend').focus().click();
    }
}