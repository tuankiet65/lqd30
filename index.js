var overlaySrc = "img/material.png", selected = false;

/*******************
    Raven configuration
*******************/
$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
    Raven.captureMessage(thrownError || jqXHR.statusText, {
        extra: {
            type: ajaxSettings.type,
            url: ajaxSettings.url,
            data: ajaxSettings.data,
            status: jqXHR.status,
            error: thrownError || jqXHR.statusText,
            response: jqXHR.responseText.substring(0, 100)
        }
    });
});

Raven.config('https://3a4a387f63c14060a084ee158cf41b4a@sentry.io/97386').install();

function ravenSetUserInfo(){
    Raven.setUserContext(FB.getAuthResponse())
}

/*******************
    Piwik configuration
*******************/
var _paq = _paq || [];
_paq.push(["setDomains", ["*.lqd30.tuankiet65.moe"]]);
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
    var u = "//analytics-cabfs.rhcloud.com/";
    _paq.push(['setTrackerUrl', u + 'piwik.php']);
    _paq.push(['setSiteId', '2']);
    var d = document,
        g = d.createElement('script'),
        s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.defer = true;
    g.src = u + 'piwik.js';
    s.parentNode.insertBefore(g, s);
})();

/*******************
    Facebook JS SDK configuration
*******************/

// Async load the SDK
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/vi_VN/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Function to call after initialization
window.fbAsyncInit = function() {
    FB.init({
        appId: '789687234501641',
        xfbml: false,
        version: 'v2.7',
        status: true,
        cookie: true,
    });
    $("#ava-load-facebook").attr("class", enableButton);
    $("#ava-load-facebook").tooltip("remove");
    $("#ava-save-facebook-modal-trigger").attr("class", enableButton);
    $("#ava-save-facebook-modal-trigger").tooltip("remove");
};

function isDisabled(element) {
    var classList = element.className.split(" ");
    for (i = 0; i < classList.length; i++)
        if (classList[i] == "disabled")
            return true;
    return false;
}

function enableButton(index, old) {
    var classList = old.split(" ");
    var result = "";
    for (i = 0; i < classList.length; i++)
        if (classList[i] != "disabled")
            result += classList[i] + " ";
    result += "waves-effect waves-light";
    return result;
}

$("#ava-load-facebook").on('click', function() {
    if (isDisabled(this))
        return false;
    $("#ava-load-facebook").prop("disabled", true);
    $("#ava-load-facebook").html("Đang đăng nhập...");
    FB.login(function(response) {
        if (response.status == "connected") {
            Materialize.toast("Đang nhập thành công.", 5000);
            loadAvatarFromFacebook();
            ravenSetUserInfo();
        } else {
            Materialize.toast("Đăng nhập thất bại, vui lòng thử lại hoặc tự chọn avatar trong máy", 5000);
            console.log(response)
        }
        $("#ava-load-facebook").prop("disabled", false);
        $("#ava-load-facebook").html("<i class=\"fa fa-facebook-official\"></i> Lấy avatar từ Facebook");
    })
})

function loadAvatarFromFacebook() {
    FB.api("/me/picture", {
        redirect: false,
        width: 500,
        height: 500
    }, function(response) {
        $("#avatar-cropper").cropit("imageSrc", response.data.url);
    })
    _paq.push(["trackEvent", "load-avatar", "facebook"]);
}

$("#avatar-cropper").cropit({
    width: 230,
    height: 230,
    minZoom: "fill",
    maxZoom: 2,
    smallImage: "stretch",
    exportZoom: 1.5,
    onImageLoaded: function(){
        $("#direction-wrapper").hide();
        selected = true;
    },
    onImageError: function(err, num, msg){
        Materialize.toast("Load ảnh thất bại.", 5000);
        throw new Error(msg);
    }
});

$("#ava-load-local").on('click', function() {
    _paq.push(["trackEvent", "load-avatar", "local"]);
    $(".cropit-image-input").click();
});

function imgExport() {
    image = new Image();
    image.src = $("#avatar-cropper").cropit('export', {
        type: "image/png",
    });

    overlay = new Image();
    overlay.src = overlaySrc;

    canvas = document.createElement("canvas");
    canvas.setAttribute("width", 600);
    canvas.setAttribute("height", 600);

    canvasContext = canvas.getContext("2d", {
        "alpha": false
    });

    canvasContext.fillStyle = "#fff",
    canvasContext.fillRect(0, 0, 600, 600);

    canvasContext.drawImage(image, 216, 99);
    canvasContext.drawImage(overlay, 0, 0);

    return canvas.toDataURL("image/png");
}

$("#ava-save-local").on("click", function() {
    if (isDisabled(this))
        return;
    _paq.push(["trackEvent", "save-avatar", "local"]);
    filename = "LQD30 - " + Date.now().toString() + ".png";
    if (isIOSDevice()){
        // iOS devices doesn't support downloading file, so just open a modal
        // containing the image and let the users save it themselves
        $("#ios-save-result").prop("src", imgExport())
        $("#ios-save-modal").openModal();
    } else {
        download(imgExport(), filename, "image/png");
    }
})

$("#ava-save-facebook").on("click", function() {
    _paq.push(["trackEvent", "save-avatar", "facebook"]);
    $("#ava-save-facebook-progress").show();
    $("#ava-save-facebook-progress div").show();
    $("#status").text("Đang đăng nhập...");
    FB.login(function(response) {
        if (response.status == "connected") {
            $("#status").text("Đang tạo album...");
            FB.api("/me/albums", "POST", {
                name: "LQD30",
                privacy: {
                    value: "EVERYONE"
                },
                is_default: true
            }, function(response) {
                if (typeof response.error != "undefined"){
                    if (response.error.type == "OAuthException" &&
                        (response.error.code == 200 || response.error.code == 10)) {
                        $("#ava-save-facebook-progress div").hide();
                        $("#status").html("Bạn phải đồng ý cho phép ứng dụng đăng lên Facebook của bạn.<br />\
                                           Hãy nhấn OK để đăng nhập lại và cấp quyền cho ứng dụng.");
                        return;
                    } else {
                        throw new Error("Error: "+JSON.stringify(response));
                    }
                }
                
                $("#status").text("Đang đăng ảnh...");

                album_id = response.id;

                access_token = FB.getAuthResponse().accessToken;

                data = new FormData();
                data.append("source", dataURItoBlob(imgExport()));
                data.append("message", "");
                data.append("no_story", "true");
                data.append("access_token", access_token);

                $.ajax({
                    url: "https://graph.facebook.com/" + album_id + "/photos",
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: "POST",
                    dataType: "json",
                    success: function(resp) {
                        _paq.push(["trackEvent", "save-avatar", "facebook-success"]);
                        $("#ava-save-facebook-progress div").hide();
                        $("#status").text("Đã đăng ảnh, bạn sẽ được chuyển tới trong giây lát...");
                        setTimeout(function(id){
                            window.location = "https://facebook.com/photo.php?fbid="+id; 
                        }, 1000, resp.id)
                        
                    },
                    error: function(resp) {
                        $("#ava-save-facebook-progress div").hide();
                        $("#status").text("Đã gặp lỗi: "+JSON.stringify(resp));
                        throw new Error(JSON.stringify(resp));
                    }
                })
            })
        } else {
            $("#ava-save-facebook-progress div").hide();
            $("#status").text("Đăng nhập thất bại, hãy thử lại.");
        }
    }, {
        scope: "publish_actions,user_photos"
    })
})

/* https://stackoverflow.com/questions/12168909/blob-from-dataurl */
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    var blob = new Blob([ab], {
        type: mimeString
    });
    return blob;
}

$("#cropit-rotate-right").on("click", function() {
    $("#avatar-cropper").cropit("rotateCW")
})

$("#cropit-rotate-left").on("click", function() {
    $("#avatar-cropper").cropit("rotateCCW")
})

$("#ava-save-facebook-modal-trigger").on("click", function(){
    if (isDisabled(this))
        return;
    $("#ava-save-facebook-progress").hide();
    $("#ava-save-facebook-modal").openModal();
})

$('.button-collapse').sideNav();

$("#ava-choose-overlay-blue-drop").on("click", function(){
    overlaySrc = "img/blue_drop.png";
    $("#overlay").prop("src", overlaySrc);
    _paq.push(["trackEvent", "overlay", "blue-drop"]);
    $("#ava-choose-overlay-modal").closeModal();
})

$("#ava-choose-overlay-material").on("click", function(){
    overlaySrc = "img/material.png";
    $("#overlay").prop("src", overlaySrc);
    _paq.push(["trackEvent", "overlay", "material"]);
    $("#ava-choose-overlay-modal").closeModal();
})

$(function(){    
    setTimeout(function(){
        $("#ava-choose-overlay-modal").openModal();
    }, 250);
})

function isIOSDevice(){
    // If the device is running iOS
    return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
}

$("#ava-choose-overlay-trigger").leanModal();