
var currentId;

function PictureSourceType() {
};
PictureSourceType.PHOTO_LIBRARY = 0;
PictureSourceType.CAMERA = 1;


function getPicture(sourceType) {

    navigator.notification.confirm(
        'Take photo from:', // message
        cameraSource, // callback to invoke with index of button pressed
        'Source', // title
        ['Camera', 'Library','Back'] // buttonLabels
    );

    function cameraSource(index) {
        if (index == 2) {

            //PHOTO LIBRARY
            navigator.camera.getPicture(getPicture_Success, onFailCamera, {
                quality: 100,
                targetWidth:800,
                targetHeight:1420,
                //allowEdit: true,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                destinationType: Camera.DestinationType.DATA_URL
            });
        } else {
            if (index == 1) {
                //CAMERA
                navigator.camera.getPicture(getPicture_Success, onFailCamera, {
                    destinationType: Camera.DestinationType.DATA_URL,
                    quality: 100,
                    targetWidth:1500,
                    targetHeight:2663
                });
            } else {
                if (index == 40000){
                    //CAMERA EDITABLE
                    navigator.camera.getPicture(getPicture_Success, onFailCamera, {
                        quality: 100,
                        allowEdit: true,
                        //sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        destinationType: Camera.DestinationType.DATA_URL
                    });
                }
                else{
                    return false;
                }

            }
        }

    }


    /*
     var options = { quality: 0 }; // 10 è il max ma cambia molto poco come qualità e si risparmiano byte
     if (sourceType != undefined) {
     options["sourceType"] = sourceType;
     }
     // if no sourceType specified, the default is CAMERA
     navigator.camera.getPicture(getPicture_Success, null, options);

     */


    //navigator.camera.getPicture( cameraSuccess, null, { sourceType : PHOTOLIBRARY } );


    function onFailCamera(message) {
        alert('Failed open Camera because: ' + message);
    }

};


var dove_pompare;
var file_name;

var file;

function getPicture_Success(imageData) {

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemReady, null);

    function fileSystemReady(fs) {


        file = imageData;
        file_name = new Date().getTime() + ".jpg";


        fs.root.getFile(file_name, {
            create: true,
            exclusive: true
        }, function (fileEntry) {


            fileEntry.createWriter(function (writer) {
                writer.write(file);
            }, null);


            dove_pompare.html(getPicHtml(file_name)); /* src='data:image/jpeg;base64,"+file+"' */
            save();

            // fileEntry.isFile === true
            // fileEntry.name == 'log.txt'
            // fileEntry.fullPath == '/log.txt'

        }, errorHandler);


    }


    /*


     file=imageData;
     file_name=new Date().getTime()+".jpeg";
     var img= new FileWriter(); //Initialized the FileWriter VAR
     PhoneGap.exec("File.write",file_name,imageData,false);
     navigator.notification.loadingStart();
     if(agent=="4")
     setTimeout("we()",4500)
     else
     setTimeout("we()",5500)
     */

}


/*
sessionStorage.setItem('src', '');
sessionStorage.setItem('pic_in_zoom_id', '');

function zoom(el) {


    var file_name = $(el).find("img").attr("id");

    sessionStorage.setItem('pic_in_zoom_id', file_name);


    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, filesystemReady, null);


    function filesystemReady(fs) {
        fs.root.getFile(file_name, {}, function (fileEntry) {


            // Get a File object representing the file,
            // then use FileReader to read its contents.
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.readAsText(file);

                //document.location.href = "zoom.html";

                reader.onloadend = function (e) {

                    src = file_name;

                    sessionStorage.setItem('src', src);


                    document.location.href = "zoom.html";

                };


            }, null);

        }, null);
    }


}
    */
