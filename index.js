var overlaySrc = "img/material_600.png";

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

var _paq = _paq || [];
_paq.push(["setDomains", ["*.lqd30.tuankiet65.moe"]]);
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
    var u = "//analytics.cabfansub.com/";
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

Raven.config('https://3a4a387f63c14060a084ee158cf41b4a@sentry.io/97386').install();

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
    $("#ava-load-facebook").html("Dang dang nhap");
    FB.login(function(response) {
        if (response.status == "connected") {
            Materialize.toast("Dang nhap thanh cong.", 5000, "rounded");
            loadAvatarFromFacebook();
            ravenSetUserInfo();
        } else {
            Materialize.toast("Dang nhap that bai, vui long dang nhap lai hoac tu chon avatar.", 5000, "rounded");
            console.log(response)
        }
        $("#ava-load-facebook").prop("disabled", false);
        $("#ava-load-facebook").html("<i class=\"fa fa-facebook-official\"></i> Lay avatar tu Facebook");
    })
})

function ravenSetUserInfo(){
    Raven.setUserContext(FB.getAuthResponse())
}

function loadAvatarFromFacebook() {
    FB.api("/me/picture", {
        redirect: false,
        width: 400,
        height: 400
    }, function(response) {
        $("#avatar-cropper").cropit("imageSrc", response.data.url);
    })
}

$("#avatar-cropper").cropit({
    width: 230,
    height: 230,
    minZoom: "fill",
    maxZoom: 2,
    freeMove: true,
    smallImage: "stretch",
    exportZoom: 1.5
});

$("#ava-load-local").on('click', function() {
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
    filename = "LQD30 - " + Date.now().toString() + ".png";
    download(imgExport(), filename, "image/png");
})

$("#ava-save-facebook").on("click", function() {
    $("#ava-save-facebook-progress").show();
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
                        console.log(resp);
                        $("#status").text("Đã đăng ảnh, bạn sẽ được chuyển tới trong giây lát...");
                        setTimeout(function(id){
                            window.location = "https://facebook.com/photo.php?fbid="+id; 
                        }, 1000, resp.id)
                        
                    },
                    error: function(resp) {
                        $("#status").text("Đã gặp lỗi: "+resp);
                        throw resp;
                    }
                })
            })
        } else {
            $("#status").text("Dang nhap that bai");
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

$(".modal-trigger").leanModal();
$("#ava-save-facebook-modal-trigger").on("click", function(){
    $("#ava-save-facebook-progress").hide();
})

$('.button-collapse').sideNav();

$("#ava-choose-overlay-blue-drop").on("click", function(){
    overlaySrc = "img/blue_drop.png";
    $("#overlay").prop("src", overlaySrc);
    $("#ava-choose-overlay-modal").closeModal();
})

$("#ava-choose-overlay-material").on("click", function(){
    overlaySrc = "img/material.png";
    $("#overlay").prop("src", overlaySrc);
    $("#ava-choose-overlay-modal").closeModal();
})

$(function(){
    $("#ava-choose-overlay-modal").openModal();  
})