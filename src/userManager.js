import {getDownloadURL} from "firebase/storage";
import {createGroup, joinGroup} from "./GroupManager";

function initializeView(database, user_id, storageRef, storage) {

    //Download image
    getDownloadURL(storageRef(storage, 'gs://trentochat.appspot.com/images/Wallpaper_2.jpg'))
        .then((url) => $("#pfp").prop('src', url))
        .catch((error) => console.log("Image error:" + error));

    //Download users username
    document.getElementById("newChat").addEventListener('click', function(){
        // TODO replace hidden
        $("#enterChat").removeAttr("hidden");
        $("#chat_div").prop("hidden", true);
    });

    document.getElementById("back_group").addEventListener('click', function(){
        // TODO replace hidden
        $("#enterChat").prop("hidden", true);
        $("#chat_div").prop("hidden", false);
    });

    document.getElementById("join_group").addEventListener('click', () => joinGroup(database, user_id));
    document.getElementById("create_group").addEventListener('click', () => createGroup(database, storage, user_id));
}

export {initializeView}