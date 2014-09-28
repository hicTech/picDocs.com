// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = 'ttjmblxpk24h229';

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({
    key: DROPBOX_APP_KEY
});

var user_email;
var quota;
var free;


client.authDriver(new Dropbox.AuthDriver.Cordova());



document.addEventListener("deviceready", deviceReady, false);







function deviceReady() {
    ActivityIndicator.hide();
    ActivityIndicator.show("checking...");
    var $auth_status = $("#auth_status").find("span").html("no user logged");
    var $available_space = $("#available_space").find("span").html("-");


    function auth_callback(error) {
        if (error) {
            alert('Authentication error: ' + error);
            return;
        }
        if (client.isAuthenticated()) {
            // Client is authenticated. Display UI.
            client.getAccountInfo(function (error, info) {
                //alert('Name: ' + info.name);
                //alert('Email: ' + info.email);

                quota = parseInt(info.quota);
                free = parseInt(quota) - parseInt(info.usedQuota);

                $available_space.html(fileSize(free));
                user_email = info.email;
                $auth_status.html(user_email);
            });
            ActivityIndicator.hide();
            userLogged();


            client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
                if (error) {
                    alert('Error opening default datastore: ' + error);
                }





            });
        } else {
            ActivityIndicator.hide();
            navigator.notification.alert('You have to sign in with your Dropbox account', function () {}, 'Ops!!');
            userNotLogged()
        }
    }

    // The login button will start the authentication process.
    $('#loginButton').unbind("click").bind("click",function (e) {
        e.preventDefault();
        // This will redirect the browser to OAuth login.
        client.authenticate(auth_callback);
    });

    // Try to finish OAuth authorization.
    client.authenticate({
        interactive: false
    }, auth_callback);



    $('#logoutButton').unbind("click").bind("click",function (e) {
        e.preventDefault();
        // This will redirect the browser to OAuth login.
        client.signOut(function () {
            $("#files_target").html("");
            client.reset();
            deviceReady();

        });
    });

    $('#synch').unbind("click").bind("click",function (e) {
        e.preventDefault();
        // This will redirect the browser to OAuth login.
        synch();
    });




}


document.addEventListener("resume", function () {
    //alert("resumed");
}, false);



function userNotLogged() {
    $(".logged_element").hide();
    $(".not_logged_element").show();
}

function userLogged() {
    $(".logged_element").show();
    $(".not_logged_element").hide();
}


function fileSize(bytes,exactnumber) {
    var exp = Math.log(bytes) / Math.log(1024) | 0;
    var result = (bytes / Math.pow(1024, exp)).toFixed(2);

    if(exactnumber)
        return result * Math.pow(1000, exp);
    return result + ' ' + (exp == 0 ? 'bytes' : 'KMGTPEZY' [exp - 1] + 'B');
}