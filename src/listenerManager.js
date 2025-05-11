import {createGroup, joinGroup} from "./GroupManager";
import {
    handleLogin,
    initializeChatView,
    loadChatPage,
    loadLoginPage,
    loadRegisterPage
} from "./index";
import {forgot, registerAuth} from "./RegisterAuth";

function initializeLoginPage(auth, database, storage) {
    $("#login").on("click", () => handleLogin(auth, database, storage));

    $("#signup").on('click', () =>  {
        loadRegisterPage().catch(
            (error) => console.log(error)
        )
    });

    $("#forgot").on("click", () => forgot(auth));
}

function initializerRegisterPage(database) {
    $("#back_register_button").on('click', () =>  {
        loadLoginPage().catch(
            (error) => console.log(error)
        );
    });

    $("#register_button").on('click', () => registerAuth(database));
}

function initializerJoinGroupPage(database, user_id, storageRef, storage) {
    document.getElementById("back_group").addEventListener('click', function(){
        loadChatPage()
            .then(() => initializeChatView(database, user_id, storageRef, storage));
    });

    document.getElementById("join_group").addEventListener('click', () => joinGroup(database, user_id));
    document.getElementById("create_group").addEventListener('click', () => createGroup(database, storage, user_id));
}


export {initializeLoginPage, initializerRegisterPage, initializerJoinGroupPage}