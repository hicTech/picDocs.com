var all_files = null;
var $target = $("#files_target");


var this_app_version_root;
var all_files_clone;

function synch() {


    all_files_clone = new Array();

    $(".twitter").hide();
    var uuid = device.uuid;

    this_app_version_root = "ver1.2/" + uuid;


    $target = $("#files_target").html("");
    ActivityIndicator.hide();
    ActivityIndicator.hide();
    ActivityIndicator.show("checking Dropbox");
    all_files = new Array();


    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, startSynch, null);

    function startSynch(fs) {
        fs.root.getFile('memory.txt', {}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onloadend = function (e) {
                    all_files = getAllFiles(this.result);
                    client.writeFile(this_app_version_root + '/data_tree.json', this.result, function (error) {
                        neededSpace();
                    });
                };
            }, null);
        }, null);
    }
}

function neededSpace() {

    ActivityIndicator.hide();

    all_files_clone = all_files.slice(0);
    var ammount = 0;
    sumSpace(all_files_clone);




    function sumSpace(arr) {
        ActivityIndicator.hide();
        ActivityIndicator.show("checking space");

        if (arr.length == 0) {

            ActivityIndicator.hide();
            if (ammount > fileSize(free, true)) {
                navigator.notification.alert(
                        'Not enough space on your Dropbox! iDocs needs at least ' + fileSize(ammount) + ' on your Dropbox',  // message
                    null,
                    'Ops!',            // title
                    'ok'                  // buttonName
                );
            }
            else {
                verifyFilesToUpload();
            }

            return false;
        }
        else {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getFile, null);

            function getFile(fs) {

                fs.root.getFile(all_files_clone[0], {}, function (fileEntry) {

                    fileEntry.file(function (file) {
                        var reader = new FileReader();
                        reader.readAsText(file);
                        reader.onloadend = function (e) {

                            ammount += this.result.length;
                            all_files_clone.splice(0, 1);
                            sumSpace(all_files_clone)
                        };
                    }, null);
                }, null);
            }
        }

    }

}

function verifyFilesToUpload() {

    ActivityIndicator.show("Checking Dropbox state");
    var files_on_dropBox = null;

    // files in + in locale che vanno uppati
    var locals_files_to_upload = null;
    // file in + su dropBox che vanno eliminati
    var remote_files_to_remove = null;

    client.readdir(this_app_version_root + "/files/allPhotos", function (error, data) {
        if (error) {
            client.mkdir(this_app_version_root + "/files/allPhotos");
            locals_files_to_upload = all_files;
            remote_files_to_remove = new Array();
        } else {
            files_on_dropBox = data;
            locals_files_to_upload = _.difference(all_files, files_on_dropBox);
            remote_files_to_remove = _.difference(files_on_dropBox, all_files);
        }
        verifyChanges(locals_files_to_upload, remote_files_to_remove);
    });

}


function verifyChanges(local_files, remote_files) {
    ActivityIndicator.hide();
    $target.html("");

    if (local_files.length != 0) {
        $target.append("<div style='margin-top:15px'><b>" + DA_SALVARE_DU_DROPBOX + ":</b></div>");
        _.each(local_files, function (file) {
            var name = file.replace(".jpg", "").replace(".jpeg", "");
            $target.append("<div class='file_to_add_row'>" + name + "</div>");
        })
    }

    if (remote_files.length != 0) {
        $target.append("<div style='margin-top:15px'><b>" + DA_ELIMINARE_DA_DROPBOX + ":</b></div>");
        _.each(remote_files, function (file) {
            $target.append("<div class='file_to_remove_row'>" + file.replace(".jpg", "").replace(".jpeg", "") + "</div>");
        })
    }

    var $synchronize_botton;
    if (remote_files.length != 0 || local_files.length != 0) {
        $synchronize_botton = $("<div style='width:200px; margin:10px auto'><button class='button button_primary'>" + SINCRONIZZATI + "</button></div>");


        $synchronize_botton.unbind("click");
        $synchronize_botton.bind("click", function (e) {
            e.preventDefault();
            // This will redirect the browser to OAuth login.
            doSync(local_files, remote_files);
        });
    } else {
        $synchronize_botton = greatYouAreSyncronized();
    }

    $target.append($synchronize_botton);


}


function doSync(local_files, remote_files) {
    if (local_files.length != 0)
        uploadFiles(local_files, remote_files);
    else {
        if (remote_files.length != 0)
            deleteFiles(remote_files);
    }
}


function uploadFiles(local_files, remote_files) {


    ActivityIndicator.hide();
    if (local_files.length != 0) {
        ActivityIndicator.show("UPLOADING: " + local_files.length + " files left");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, uploadFile, null);

        function uploadFile(fs) {
            fs.root.getFile(local_files[0], {}, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.readAsText(file);
                    reader.onloadend = function (e) {
                        client.writeFile(this_app_version_root + "/files/allPhotos/" + local_files[0], this.result, function (error) {
                            if (error) {
                                alert('Error: ' + error);
                            } else {
                                local_files.splice(0, 1);
                                ActivityIndicator.hide();
                                uploadFiles(local_files, remote_files);
                            }
                        });

                    };

                }, null);

            }, null);
        }
    } else {

        if (remote_files.length == 0) {
            ActivityIndicator.hide();
            $target.html(greatYouAreSyncronized());
        } else {
            deleteFiles(remote_files);
        }
    }
}


function deleteFiles(remote_files) {
    ActivityIndicator.show("REMOVING: " + remote_files.length + " files left");
    if (remote_files.length != 0) {
        client.remove(this_app_version_root + "/files/allPhotos/" + remote_files[0], function (error) {
            if (error) {
                alert('Error: ' + error);
            } else {
                remote_files.splice(0, 1);
                ActivityIndicator.hide();
                deleteFiles(remote_files);
            }
        });
    } else {
        ActivityIndicator.hide();
        $target.html(greatYouAreSyncronized());
    }
}


function getAllFiles(data_tree_json){
    var arr = new Array();
    var data = JSON.parse(data_tree_json);
    _.each(data,function(doc){
        _.each(doc.pics,function(pic){
            arr.push(pic.pic_id);
        })
    });

    return arr;
}


function greatYouAreSyncronized() {
    $(".twitter").show();
    return $("<div>" + SEI_SINCRONIZZATO + "</div>");
}