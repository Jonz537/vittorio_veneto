import {equalTo, get, onValue, orderByChild, push, query, ref, set} from "firebase/database";
import {warning} from "./Utils";
import {ref as storageRef, uploadBytes} from "firebase/storage";
import {loadChatPage, initializeChatView} from "./index";

async function joinGroup(database, userId, storage){
    const group_to_enter = $("#group_to_enter").val();
    const group_password = $("#group_password").val();

    if(group_to_enter !== "" && group_password !== ""){

        let snapshotPassword = await get(ref(database, "chat/messages/" + group_to_enter + "/psw"));
        let passwordGiusta = snapshotPassword.val();

        let queryAlreadyInGroup = query(ref(database, "chat/users/" + userId + "/chats"), orderByChild("chatname"), equalTo(group_to_enter));
        let alreadyGroupSnapshot = await get(queryAlreadyInGroup);

        if(!alreadyGroupSnapshot.exists()){
            if(group_password === passwordGiusta){
                const join_group_ref = ref(database, 'chat/users/' + userId + '/chats');
                const new_join_group_ref = push(join_group_ref);

                set(new_join_group_ref, {
                    chatname: group_to_enter
                });

                loadChatPage()
                    .then(() => initializeChatView(database, userId, storageRef, storage));

            }else{
                warning("Wrong group name e password");
            }
        }else{
            warning("You are already in this group");
        }

        // onValue(ref(database, "chat/messages/" + group_to_enter + "/psw"),(snapshot) => {
        //
        //     let passwordGiusta = snapshot.val();
        //
        //     let queryAlreadyInGroup = query(ref(database, "chat/users/" + userId + "/chats"), orderByChild("chatname"), equalTo(group_to_enter));
        //
        //     onValue(queryAlreadyInGroup, (snapshot) => {
        //
        //         if(!snapshot.exists()){
        //             if(group_password === passwordGiusta){
        //                 const join_group_ref = ref(database, 'chat/users/' + userId + '/chats');
        //                 const new_join_group_ref = push(join_group_ref);
        //
        //                 set(new_join_group_ref, {
        //                     chatname: group_to_enter
        //                 });
        //
        //                 loadChatPage()
        //                     .then(() => initializeChatView(database, userId, storageRef, storage));
        //
        //             }else{
        //                 warning("Credenziali errate");
        //             }
        //         }else{
        //             warning("Sei gia in questo gruppo");
        //         }
        //     }, {
        //         onlyOnce:true
        //     });
        // }, {
        //     onlyOnce:true
        // });

    }else{
        warning("Fill in all the fields");
    }
}

function createGroup(database, storage, userId){
    const group_to_create = $("#group_to_create").val();
    const group_create_password = $("#group_create_password").val();

    const file = document.getElementById('group_create_image').files[0];

    if (group_to_create === "" || group_create_password === "" || file === undefined) {
        warning("Fill in all the fields")
        return;
    }

    const postListRefe = ref(database, 'chat');
    const newPostRefe = push(postListRefe);

    const fileRef = storageRef(storage, 'images/' + newPostRefe.key + "." + file.type.substring(6, 10));

    uploadBytes(fileRef, file).then(() => {

        set(ref(database, "chat/messages/" + group_to_create), {
            img: newPostRefe.key + "." + file.type.substring(6, 10),
            psw: group_create_password,
        }).catch();

        set(ref(database, "chat/messages/" + group_to_create + "/messages"), {
            first: "first"
        }).catch();

        const joinGroupRef = ref(database, 'chat/users/' + userId + '/chats');
        const newJoinGroupRef = push(joinGroupRef);

        set(newJoinGroupRef, {
            chatname: group_to_create
        });

        loadChatPage()
            .then(() => initializeChatView(database, userId, storageRef, storage));
    });
}

export {joinGroup, createGroup}