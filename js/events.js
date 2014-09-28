function loaded() {

    if (sessionStorage.getItem("login_superata") == null)
        mostraLogin();
    else {
        start();
    }


}


function start() {


    //EDIT ALL DOCS
    var $home_edit_button = $('#home_edit_button');
    new FastClick($home_edit_button.get(0));
    $home_edit_button.bind('click', function (e) {

        goToEditMode();

    });

    //SEARCH
    var $home_search_button = $('#home_search_button');
    new FastClick($home_search_button.get(0));
    $home_search_button.bind('click', function () {

        searchMode();

    });

    //CLOUD
    var $home_cloud_button = $('#home_cloud_button');
    new FastClick($home_cloud_button.get(0));
    $home_cloud_button.bind('click', function () {

        save();
        setTimeout(function () {
            location.href = "synch_intro.html";
        }, 800)

    });


    //DONE HOME
    var $home_done_button = $('#home_done_button');
    new FastClick($home_done_button.get(0));
    $home_done_button.bind('click', function (e) {
        backToNormalMode();
    });


    //NEW DOC BUTTON
    currentDocId = new Date().getTime();
    var $home_new_button = $('#home_new_button');
    new FastClick($home_new_button.get(0));
    $home_new_button.bind('click', function (e) {

        collapseAllDocs(true); //con true dico cercare il was_selected .removeClass("was_selected")

        navigator.notification.prompt(
            'Please enter document name',  // message
            addNewDoc,                  // callback to invoke
            'New document',            // title
            ['Ok'],             // buttonLabels
            'Document name'                 // defaultText
        );

        function addNewDoc(promptResult) {

            var cleaned_prompt = promptResult.input1.replace(appConfig.docNameAllowedCharacter, '');
            var $new_doc = $("<span/>").append(getDocHtml(cleaned_prompt, [], true));


            $("#general_container").prepend($new_doc.html());
            bindDocClicks();

            setTimeout(function () {
                $(".NEW-doc").eq(0).find(".NEW-pic-container").trigger("click");
                refreshScroll();
                scrollTop();
            }, 800);


        }
    });


    //SETTINGS
    var settings_button = document.getElementById('settings_button');
    new FastClick(settings_button);
    settings_button.addEventListener('touchstart', function (e) {
        location.href = "settings.html";
    }, false);


    //SEARCH
    $('.NEW-toolbar .inputContainer input').on('input', function (e) {
        if ($(this).data("lastval") != $(this).val()) {
            $(this).data("lastval", $(this).val());
            searchDoc($(this).val());
        }
        ;
    });

    //SEARCH ERASER
    var $home_search_eraser = $('#home_search_eraser');
    new FastClick($home_search_eraser.get(0));
    $home_search_eraser.bind('click', function (e) {
        var $input = $("#toolbar input");
        $input.blur().val("");
        searchDoc("");
        backToNormalMode();
    });


    //BACK BOTTON zoomArea
    var $backbutton = $("#zoomArea").find('.NEW-backbutton');
    new FastClick($backbutton.get(0));
    $backbutton.bind('click', function (e) {
        backToNormalMode();
    });


    //DELETE BOTTON zoomArea
    var $removeThisPicButton = $("#zoomArea").find('.NEW-removeThisPicButton');
    new FastClick($removeThisPicButton.get(0));
    $removeThisPicButton.bind('click', function (e) {
        deleteThisPic();
    });



    refreshContent();
}


function refreshContent() {

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, go, null);

    function go(fs) {
        fs.root.getFile('memory.txt', {}, function (fileEntry) {

            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function (e) {


                    // qui se this.result è vuoto è il caso di app appena installata quindi all'inserimento del primo doc
                    // passo proprio il contenuto dell'html in general_container come Dom da convertire
                    var result = (this.result != "") ? this.result : $("#general_container").html();

                    $("#general_container").html(fromJsonToDom(result));
                    refreshScroll();
                    bindDocClicks();

                    // se c'è un doc espanso gli pompa le thumbnail e lo porto in primo piano con lo scrolling
                    var $expanded = $(".selected");
                    expandThisDoc($expanded,true);
                    var where = $("#mainWrapper").scrollTop() - $("#mainWrapper").offset().top + $expanded.offset().top ;
                    $("#mainWrapper").animate({ scrollTop: where + - 90 }, "slow");




                };

                reader.readAsText(file);
            }, errorHandler);

        }, null);
    }

}







function save(loading) {

    collapseAllDocs();


    if(loading == undefined){
        ActivityIndicator.show("LOADING");
    }

    $(".NEW-doc").each(function () {
        if ($(this).find("img").size() == 0) {
            $(this).remove();
        }
    });

    storage();
}


function storage() {

    var current_status = convertDomToJson( $("#general_container").html() );

    current_status = JSON.stringify(current_status);

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemReady, null);

    function fileSystemReady(fs) {

        // ELIMINO MEMORY.txt
        fs.root.getFile('memory.txt', {}, function (fileEntry) {
            fileEntry.remove(function () {
                // SALVO IL CONTENUTO DEL DOM IN memory.txt
                scriviMemory(fs);
            }, function () {
                alert("non rimuovo")
            });
        }, function () {
            // se memory.txt non esiste = è la prima volta che storo
            scriviMemory(fs)
        });


        function scriviMemory(fs) {
            fs.root.getFile('memory.txt', {
                create: true,
                exclusive: true
            }, function (fileEntry) {
                fileEntry.createWriter(function (writer) {
                    writer.write(current_status);
                    setTimeout(function () {
                        refreshContent();
                    }, 200);
                    setTimeout(function () {
                        ActivityIndicator.hide()
                    }, 500);

                }, function () {
                    alert("non sono riuscito a scrivere in memory.txt")
                });

            }, function () {
                alert("non mi è stato restituito il file memory.txt")
            });

        }


    }

}


function bindDocClicks() {


    var $docs = $(".NEW-doc");


    $docs.each(function () {
        var $doc = $(this);
        var $doc_title = $(this).find(".NEW-title");


        //CLICK SUL DOC STESSO
        new FastClick($doc.get(0));
        $doc.unbind("click").bind('click', function () {


            if (mode == "edit")
                return false;

            if($doc.is(".selected")){
                collapseAllDocs(true);
                return false;
            }

            collapseAllDocs();
            expandThisDoc($(this));


        });

        //CLICK EDIT DOC
        $doc.find(".NEW-edit").unbind("click").bind("click", function (e) {




            setTimeout(function(){
                navigator.notification.prompt(
                    'Please enter document name',  // message
                    editDocName,                  // callback to invoke
                    'Edit document name',            // title
                    ['Ok'],             // buttonLabels
                    $doc_title.html()                 // defaultText
                );

                function editDocName(promptResult) {
                    var cleaned_prompt = promptResult.input1.replace(appConfig.docNameAllowedCharacter, '');
                    $doc_title.html(cleaned_prompt);
                    save();
                }

            },100);

            e.preventDefault();
            e.stopPropagation();




        });


        //CLICK SULLE FOTO

        $doc.find(".NEW-pic-container").each(function () {
            var $pic = $(this);
            $pic.bind("click", function (e) {
                e.stopPropagation();
                e.preventDefault();
                var $pic = $(this);

                if ($pic.html() == "") {
                    dove_pompare = $pic;
                    getPicture(PictureSourceType.PHOTO_LIBRARY);
                } else {

                    //save(true);

                    goToZoomMode($pic);
                    //zoom($pic)

                }

            });
        });


        //CLICK DRAG DOC
        $doc.find(".NEW-drag").bind("click", function (e) {
            //e.stopPropagation();
        });

        //CLICK SU DELETE
        $doc.find(".NEW-delete").each(function () {

            var $del_button = $(this);
            $del_button.bind("click", function (e) {

                e.stopPropagation();
                e.preventDefault();

                navigator.notification.confirm(
                    'Realy want to delete this Doc and all its photos?:', // message
                    eliminaDocumento, // callback to invoke with index of button pressed
                    'Delete', // title
                    ['Yes', 'No'] // buttonLabels
                )
            });

            function eliminaDocumento(index) {
                if (index == 2)
                    return false;

                var doc_html = $doc;
                var array_pic_da_eliminare = new Array();

                $(doc_html).find("img").each(function () {
                    array_pic_da_eliminare.push($(this).attr("id"));
                });

                elimincaPicDaQuestoDoc($doc, array_pic_da_eliminare);

            }

        });


    });


}



function collapseAllDocs(newDocCase) {

        collapseThisDoc($(".NEW-doc.selected"),newDocCase);

}



function expandThisDoc($doc,forceDocToExpand){

    if(!$doc.is(".selected") || forceDocToExpand) {

        $(".NEW-doc.was_selected").removeClass("was_selected");
        $doc.addClass("selected was_selected");

        setTimeout(function () {
            $doc.find(".NEW-pic").each(function () {
                insertThumbNail($(this),$doc);
            })
        }, 350);
    }

}

function collapseThisDoc($doc,newDocCase){

    if(newDocCase)
        $(".NEW-doc.was_selected").removeClass("was_selected");

    if($doc.is(".selected")){
        $doc.find(".NEW-pic").each(function(){
            $(this).attr("src","imm/new_pics.png");

            var $loading = getLoadingHtml();

            $(this).before($loading);
        });

        $doc.removeClass("selected");
    }

}


function insertThumbNail($pic,$doc){
    if(appConfig.picsThumbnail){
        var file_name = $pic.attr("id");


        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemReady, null);

        function fileSystemReady(fs) {
            fs.root.getFile(file_name, {}, function (fileEntry) {

                // Get a File object representing the file,
                // then use FileReader to read its contents.
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    var path = fileEntry.toURL()

                    reader.readAsText(file);
                    reader.onloadend = function (e) {
                        //alert(this.result.length);
                        //alert(path);
                        $doc.find(".PicLoading").remove();
                        $pic.attr("src","data:image/jpeg;base64,"+this.result);


                    };


                }, null);

            }, null);
        }
    }

}







































function elimincaPicDaQuestoDoc(el, pic) {
    if (pic == 0) {
        el.remove();
    } else {


        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemReady, null);

        function fileSystemReady(fs) {
            fs.root.getFile(pic[0], {}, function (fileEntry) {

                fileEntry.remove(function () {
                    pic.splice(0, 1);
                    elimincaPicDaQuestoDoc(el, pic);

                }, null);

            }, null);
        }
    }

}


var mode = "";
function goToEditMode() {

    mode = "edit";
    $("#toolbar").addClass("edit");
    $(".NEW-doc").each(function (index) {
        var $doc = $(this);
        $doc.addClass("edit").removeClass("selected");
        collapseAllDocs();
    });

    var dragg_options = {
        items: '.NEW-doc.edit',
        handle: '.NEW-drag',
        forcePlaceholderSize: true

    }

    $('#general_container').sortable(dragg_options).on('sortable:receive', function (e, ui) {
        ui.item.removeClass('draggable');
    });


    hideFooter();
    refreshScroll();
    scrollTop();
    destroyScroll();


}


function backToNormalMode() {
    var current_mode = mode;
    mode = "";
    if (current_mode == "edit") {
        $("#toolbar").removeClass("edit");
        showFooter();
        $(".NEW-doc").each(function () {
            var $doc = $(this);
            $doc.removeClass("edit");
        });
        setTimeout(function () {
            save();
        }, 200)
    }

    if (current_mode == "search") {
        $("#toolbar").removeClass("search");
        showFooter();
        //$(".NEW-doc").each(function () {
            //var $doc = $(this);
            //$doc.removeClass("edit");
        //});

    }

    if (current_mode == "zoom") {
        hideZoomArea();
        setTimeout(function(){
            showFooter();
            showToolbar();
            showMainWrapper();
            setTimeout(function(){
                $("#zoomAreaScroller").html("");
            },600);
        },300)

    }


}


function searchMode() {
    mode = "search";
    $("#toolbar").addClass("search");
    $("#toolbar .inputContainer input").focus();
    hideFooter();
    collapseAllDocs();

}


function searchDoc(str) {
    if (str == "") {
        $(".NEW-doc").each(function () {
            $(this).show();
        });
    } else {

        var len = str.length;

        $(".NEW-doc").each(function () {
            $(this).hide();
            if ($(this).find(".NEW-title").html().substr(0, len) == str)
                $(this).show();
        })
    }


}


function hideMainWrapper(){
    $("#mainWrapper").addClass("animated slideOutLeft");
    $('#mainWrapper').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', doSomething);
    function doSomething() {
        setTimeout(function () {
            $('#mainWrapper').removeClass("animated slideOutLeft").addClass("slideOutLeftComputed");
        }, 50);
    }
}

function showMainWrapper(){
    $("#mainWrapper").addClass("animated slideInLeft");
    $('#mainWrapper').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', doSomething);
    function doSomething() {
        $('#mainWrapper').removeClass("animated slideInLeft slideOutLeftComputed");
    }
}


function hideFooter() {
    $("#footer").addClass("animated slideOutDown");
}

function showFooter() {
    $("#footer").removeClass("animated slideOutDown");
}


function hideToolbar() {
    $("#toolbar").addClass("animated slideOutUp");
}

function showToolbar() {
    $("#toolbar").removeClass("animated slideOutUp");
}


function showZoomArea(){
    $("#zoomAreaScroller").addClass("animated slideInRight");
    $('#zoomAreaScroller').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', doSomething);
    function doSomething() {
        $('#zoomAreaScroller').removeClass("animated slideInRight");
    }

    setTimeout(function(){
        showZoomAreaButtons();
    },350)
}

function hideZoomArea(){
    zoomAreaScroll.zoom(0);

    hideZoomAreaButtons();
    setTimeout(function(){
        $("#zoomAreaScroller").removeClass("animated").addClass("animated slideOutRight");
        $('#zoomAreaScroller').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', doSomething);
        function doSomething() {
            $('#zoomAreaScroller').removeClass("animated slideOutRight");
        }
    },400)
}


function showZoomAreaButtons(){
    $("#zoomArea").find(".NEW-backbutton").animate({top:"40px",left:"20px"},"easeOutBounce");
    $("#zoomArea").find(".NEW-removeThisPicButton").animate({top:"40px",right:"20px"},"easeOutBounce");
}


function hideZoomAreaButtons(){
    $("#zoomArea").find(".NEW-backbutton").animate({top:"-50px",left:"-50px"},"easeOutBounce");
    $("#zoomArea").find(".NEW-removeThisPicButton").animate({top:"-50px",right:"-50px"},"easeOutBounce");
}




function errorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        case FileError.PATH_EXISTS_ERR:
            msg = 'PATH_EXISTS_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    }
    ;

    alert('Error: ' + msg);
}


var pic_in_zoom = null;
function goToZoomMode($pic){
    ActivityIndicator.show();
    mode = "zoom";
    pic_in_zoom = $pic;

    setTimeout(function(){
        var $img = $pic.find("img");
        var $cloned_img = $img.clone();
        $cloned_img.removeClass("NEW-pic").attr("width","100%");
        $("#zoomAreaScroller").html($cloned_img);
    },200);

    setTimeout(function(){
        ActivityIndicator.hide();
        hideFooter();
        hideToolbar();
        hideMainWrapper();
        showZoomArea();
    },300);

    // peso immagine
    //alert($cloned_img.attr("src").length);

}



function deleteThisPic(){
    navigator.notification.confirm(
        'Do you really want to delete it?', // message
        reallyDeleteThisPic, // callback to invoke with index of button pressed
        'DELETE THIS PHOTO', // title
        ['Yes', 'No'] // buttonLabels
    );
}


function reallyDeleteThisPic(index) {
    if (index == 1){
        ActivityIndicator.show();
        setTimeout(function(){
            var $img = $("#zoomAreaScroller").find("img");
            var file_name = $img.attr("id");
            $img.addClass("animated fadeOutDown");

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, removePic, null);


                    function removePic(fs){
                        fs.root.getFile(file_name, {}, function (fileEntry) {

                            fileEntry.remove(function () {

                                pic_in_zoom.remove();
                                backToNormalMode();
                                ActivityIndicator.hide();
                                setTimeout(function(){save()},300)

                            }, null);


                        }, null);
                    }






        },300);
    }


}

//setTimeout(function(){clearMemory()},1000)

function clearMemory() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, clear, null);

    function clear(fs) {
        fs.root.getFile('memory.txt', {}, function (fileEntry) {

            fileEntry.remove(function () {
                alert('memory.txt cancellato');


            }, null);

        }, null);

    }
}