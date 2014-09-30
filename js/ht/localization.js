$(document).ready(function(){
    hicGoogleDocsParser({
        "url":"https://docs.google.com/spreadsheet/pub?key=1JZFHIdEAyb4MhEeuMJN0J8t4vjm_OtNgLN1_GQqDQ0Y&output=html",
        "callback":"jsonready",
        "loadingTarget":"#result_json",
        "target" : "#result_json"
    });
});

function jsonready(result,opts){



    $("body").find(".i18n").each(function(){
        var key = $(this).attr("data-loc-key");
        if(_.is(key)){
            var localized_string = getLocalizedString(result,key);
            $(this).html("").html(localized_string);
        }
    })

}

function getLocalizedString(result,key){
    var ret;

    var language = window.navigator.userLanguage || window.navigator.language;

    var lan = (language.indexOf("it") != -1)? "it" : "en";


    _.each(result["trs"],function(tr){
        if ( tr["key"] == key){
            ret = tr[lan];
        }
    });

    return ret;

}