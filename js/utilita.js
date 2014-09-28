

function tronca(cosa,quanto){
	if(cosa.length>quanto){
		return cosa.substr(0,quanto);
		}
	else return cosa;
}

function eliminaElementoHtml(e){
		if(!e) return false;
		var nodo_da_eliminare=e;
		var padre=e.parentNode;
		padre.removeChild(nodo_da_eliminare);
	}