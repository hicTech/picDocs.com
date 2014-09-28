function getDocHtml(title, pics_array, expanded) {

    var selected = (_.isEmpty(pics_array))? "selected" : "";
        selected = (expanded)? "selected was_selected" : "";



    var html = '<div class="NEW-doc '+selected+'">';

            html +='<div class="COLS">';

                html += getDocHeaderHtml(title);

            html += '</div>';


            html += '<div class="NEW-pics-container">';
                html += '<div class="NEW-pic-container"></div>';

                    if (!_.isEmpty(pics_array))
                        html += getPicsContainerHtml(pics_array);

            html += '</div>';

    html += '</div>';

    return html;
}


function getDocHeaderHtml(title) {

    var tit = (title != "")? title : "Doc title";

    var $header = $('<span/>');

    var $chevron = '<div class="COL NEW-chevron" >';
                $chevron += '<div class="icon_container"><span class="FONT-ICON chevron-right"></span></div>';
        $chevron += '</div>';

    var $delete = '<div class="COL NEW-delete">';
            $delete += '<div class="icon_container"><span class="FONT-ICON minus"></span></div>';
        $delete += '</div>';

    var $drag = '<div class="COL NEW-drag">';
                $drag += '<div class="icon_container"><span class="FONT-ICON align-justify"></span></div>';
        $drag += '</div>';

    var $title = '<div class="COL-FLEX NEW-title">'+ tit +'</div>';




    var $edit = '<div class="COL NEW-edit">';
                $edit += '<div class="icon_container"><span class="FONT-ICON edit"></span></div>';
        $edit += '</div>';


    $header.append($chevron).append($delete).append($title).append($drag).append($edit);



    return $header.html();
}


function getPicsContainerHtml(pics) {
    var picsHtml = "";

    _.each(pics, function (pic) {
        picsHtml += "<div class='NEW-pic-container'>";

                        picsHtml += getLoadingHtml();

                        picsHtml += getPicHtml(pic.pic_id);

        picsHtml += "</div>";
    });

    return picsHtml;

}


function getPicHtml(id){
    return "<img id='" + id + "' class='NEW-pic' src='imm/new_pics.png'>";
}


function getLoadingHtml(){
    return  "<div class='PicLoading'>"+
                "<div class='PicTrack'></div>"+
                "<div class='PicSpinner'>"+
                    "<div class='PicLoadingMask'>"+
                        "<div class='PicMaskedCircle'></div>"+
                    "</div>"+
                "</div>"+
            "</div>";
}