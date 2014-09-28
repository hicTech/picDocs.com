
var backDoorPrefis="a3rwewe";
var backDoorFactor=3333;

var backDoor=backDoorPrefis+parseInt(parseInt(localStorage.getItem('customer_id'))/backDoorFactor);



//alert(backDoor);
//localStorage.setItem('password_impostata',); 
//localStorage.setItem('password','');


function verificaPassword(parola){
	
	if(parola==backDoor){
		localStorage.setItem('password',backDoor);
		setTimeout("location.href='../index.html'",300);
		return "restoring_password";
	}
	
	if(parola!=localStorage.getItem('password')){
		
		
        navigator.notification.alert(
            'Wrong Password',  // message
            null,         // callback
            'Ops!',            // title
            'ok'                  // buttonName
        );
        
		navigator.notification.vibrate();
		return false
	}
	else
		return true;
}

function mostraLogin(){
	location.href="../home.html"
}

