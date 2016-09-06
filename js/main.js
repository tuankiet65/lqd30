window.fbAsyncInit = function() {
    FB.init({
        appId: '789687234501641',
        xfbml: false,
        version: 'v2.7',
        status: true,
        cookie: true,

    });
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

$("#ava-get-facebook").on('click', function(){
    $("#ava-get-facebook").prop("disabled", true);
    $("#ava-get-facebook").html("Dang dang nhap");
    FB.login(function(response){
        if (response.status == "connected"){
            Materialize.toast("Dang nhap thanh cong.", 5000, "rounded");
            loadAvatarFromFacebook();
        } else {
            Materialize.toast("Dang nhap that bai, vui long dang nhap lai hoac tu chon avatar.", 5000, "rounded");
            console.log(response)
        }
        $("#ava-get-facebook").prop("disabled", false);
        $("#ava-get-facebook").html("Lay avatar tu Facebook");
    })
})

function loadAvatarFromFacebook(){
    FB.api("/me/picture", {
        redirect: false,
        width: 300,
        height: 300
    }, function(response){
        console.log(response);
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
    exportZoom: 1,
});

$("#avatar-cropper").find(".cropit-preview-image-container").append(
                '<img src="img/overlay.png" class="overlay" id="overlay" />');

$("#ava-get-custom").on('click', function(){
    $(".cropit-image-input").click();
});

function imgExport(){
    image = new Image();
    image.src=$("#avatar-cropper").cropit('export', {
        type: "image/png",
    });

    overlay = document.getElementById("overlay");

    canvas = document.createElement("canvas");
    canvas.setAttribute("width", 600);
    canvas.setAttribute("height", 600);

    canvasContext = canvas.getContext("2d", {
        "alpha": false
    });

    canvasContext.fillStyle="#fff",
    canvasContext.fillRect(0, 0, 600, 600);

    canvasContext.drawImage(image, 0, 0);
    canvasContext.drawImage(overlay, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.95);
}