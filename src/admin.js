async function banUser(userId) {
    await fetch("http://localhost:3000/disable-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId })
    })
        .then(res => res.text())
        .then(msg => console.log(msg))
        .catch(err => console.error(err));
}

async function enableUser(userId) {
    await fetch("http://localhost:3000/enable-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId })
    })
        .then(res => res.text())
        .then(msg => console.log(msg))
        .catch(err => console.error(err));
}

async function changeRole(userId, newRole) {
    await fetch("http://localhost:3000/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId, role: newRole })
    })
        .then(res => res.text())
        .then(console.log)
        .catch(console.error);
}

async function getUserData(userId){
    try {
        const res = await fetch("http://localhost:3000/get-user-status?uid=" + userId);
        const data = await res.json();
        return {
            role: data.role,
            disabled: data.disabled
        };
    } catch (err) {
        console.error("Error:", err);
        return null;
    }
}

async function getUsersData(userIds){
    try {
        const res = await fetch("http://localhost:3000/get-users-status?uids=" + encodeURIComponent(JSON.stringify(userIds)));
        return await res.json();
    } catch (err) {
        console.error("Error:", err);
        return null;
    }
}


export {banUser, changeRole, enableUser, getUserData, getUsersData}