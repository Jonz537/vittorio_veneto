function warning(error) {
    $("#modal_title_warning").html(error);
    $("#warning").modal("show");
}

function request(title, body) {
    $("#modal_title").html(title);
    $("#modal_content").html(body);
    $("#confirmModal").modal("show");
}

function requestFoot(title, body, footer) {
    $("#modal_title").html(title);
    $("#modal_content").html(body);
    $("#footer").html(footer);
    $("#confirmModal").modal("show");
}

function getTimeString() {
    let now = new Date();
    return String(now.getFullYear() % 1000) + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-"
    + String(now.getDate()).padStart(2, '0') + " " + String(now.getHours()) + ":"
    + formatTime(now.getMinutes()) + ":" + formatTime(now.getSeconds())
}


function formatTime(time) {
    return time < 10? ('0' + time) : time;
}

export {warning, request, requestFoot, formatTime, getTimeString}