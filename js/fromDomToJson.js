function fromJsonToDom(memory) {
    var ret;
    try {
        var json = JSON.parse(memory);
        return  convertJsonToDom(json);
    }
    catch (err) {
        ret = convertJsonToDom(convertDomToJson(memory));
        return ret;
    }
}


function convertJsonToDom(docs_json) {

    var html = "";
    _.each(docs_json,function(doc){
        html += getDocHtml(doc.doc_name,doc.pics,doc.expanded);
    });



    return html;

}


function convertDomToJson(memory) {


    var $mem = $("<div>" + memory + "</div>");

    var docs_json = {};

    if($mem.find(".doc").size() != 0){ // l'html trovato è della versione 1 di iDocs
        $mem.find(".doc").each(function (index, elemt) {

            var pics_obj = {};
            $(this).find("img").each(function (index) {
                var pic_id = $(this).attr("id");
                pics_obj[index] = {"pic_id":pic_id,"altro":"altro"};
            });

            var doc_name = $(this).find("input").val();
            docs_json[index] = {
                "doc_name": doc_name,
                "pics": pics_obj
            }
        });

        //alert(JSON.stringify(docs_json, null, '\t'));
        return docs_json;
    }
    else{
        $mem.find(".NEW-doc").each(function (index, elem) {

            var selected = $(this).is(".was_selected");

            var pics_obj = {};
            $(this).find("img").each(function (index) {
                var pic_id = $(this).attr("id");
                pics_obj[index] = {"pic_id":pic_id,"altro":"altro"};
            });

            var doc_name = $(this).find(".NEW-title").html();
            docs_json[index] = {
                "doc_name": tronca(doc_name,26),
                "expanded": selected,
                "pics": pics_obj
            }
        });

        //alert(JSON.stringify(docs_json, null, '\t'));
        return docs_json;
    }


}

