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
        } else {
            Materialize.toast("Dang nhap that bai, vui long dang nhap lai hoac tu chon avatar.", 5000, "rounded");
            console.log(response)
        }
        $("#ava-load-facebook").prop("disabled", false);
        $("#ava-load-facebook").html("<i class=\"fa fa-facebook-official\"></i> Lay avatar tu Facebook");
    })
})

function loadAvatarFromFacebook() {
    FB.api("/me/picture", {
        redirect: false,
        width: 600,
        height: 600
    }, function(response) {
        $("#avatar-cropper").cropit("imageSrc", response.data.url);
    })
}

$("#avatar-cropper").cropit({
    imageBackground: true,
    imageBackgroundBorderWidth: 50,
    minZoom: "fit",
    maxZoom: 2,
    freeMove: true,
    smallImage: "stretch",
    exportZoom: 1.5,
});

$("#avatar-cropper").find(".cropit-preview-image-container").append(
    '<img src="overlay.png" class="overlay" id="overlay" />');

$("#ava-load-local").on('click', function() {
    $(".cropit-image-input").click();
});

function imgExport() {
    image = new Image();
    image.src = $("#avatar-cropper").cropit('export', {
        type: "image/png",
    });

    overlay = new Image();
    overlay.src = "overlay.png";

    canvas = document.createElement("canvas");
    canvas.setAttribute("width", 600);
    canvas.setAttribute("height", 600);

    canvasContext = canvas.getContext("2d", {
        "alpha": false
    });

    canvasContext.fillStyle = "#fff",
    canvasContext.fillRect(0, 0, 600, 600);

    canvasContext.drawImage(image, 0, 0);
    canvasContext.drawImage(overlay, 0, 0);

    return canvas.toDataURL();
}

$("#ava-save-local").on("click", function() {
    filename = "LQD30 - " + Date.now().toString() + ".png";
    download(imgExport(), filename, "image/png");
})

$("#ava-save-facebook").on("click", function() {
    $("#ava-save-facebook-progress").show();
    $("#status").text("Dang nhap...");
    FB.login(function(response) {
        if (response.status == "connected") {
            $("#status").text("Dang tao album...");
            FB.api("/me/albums", "POST", {
                name: "LQD30",
                privacy: {
                    value: "EVERYONE"
                },
                is_default: true
            }, function(response) {
                $("#status").text("Dang dang anh...");

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
                        $("#status").text("Da dang anh, ban se duoc chuyen toi trong 2 giay");
                        setTimeout(function(id){
                            window.location = "https://facebook.com/photo.php?fbid="+id; 
                        }, 2000, resp.id)
                        
                    },
                    error: function(resp) {
                        console.log(resp);
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

 $("#ava-save-facebook-modal-trigger").leanModal();
 $("#ava-save-facebook-modal-trigger").on("click", function(){
    $("#ava-save-facebook-progress").hide();
 })