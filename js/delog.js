setInterval("avanzaClock()",1000);

var datatime=new Date().getTime();

localStorage.setItem("clock",datatime);

if(!localStorage.getItem("tipo_sessione"))
	localStorage.setItem("tipo_sessione","no_multitasking");

function avanzaClock(){
	var old_clock=localStorage.getItem("clock")
	var new_clock=new Date().getTime();
	localStorage.setItem("clock",new_clock);
	if(parseInt(new_clock)-parseInt(old_clock)>6000){

		if(localStorage.getItem('password')!="" && localStorage.getItem("tipo_sessione")=="multitasking")
			document.location.href="../index.html";
	}

}

function cambiaTipoSessione(stato){
	if(stato){
		localStorage.setItem("tipo_sessione","no_multitasking");
		document.getElementById("div_info_sessione_1").style.display="none";
		document.getElementById("div_info_sessione_2").style.display="block";
	}
	else{
		localStorage.setItem("tipo_sessione","multitasking");
		document.getElementById("div_info_sessione_1").style.display="block";
		document.getElementById("div_info_sessione_2").style.display="none";

	}
	//alert("sessione:"+ localStorage.getItem("tipo_sessione"))
		
}




var agent="4";



if(navigator.userAgent.indexOf("3_1_2")!=-1)
agent="3.1.2";

if(navigator.userAgent.indexOf("3_1_3")!=-1)
agent="3.1.3";

if(navigator.userAgent.indexOf("3_2")!=-1)
agent="3.2";

