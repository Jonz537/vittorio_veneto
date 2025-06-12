function banUser(userId) {
    fetch("http://localhost:3000/disable-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId })
    })
        .then(res => res.text())
        .then(msg => console.log(msg))
        .catch(err => console.error(err));
}

function enableUser(userId) {
    fetch("http://localhost:3000/enable-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId })
    })
        .then(res => res.text())
        .then(msg => console.log(msg))
        .catch(err => console.error(err));
}

function changeRole(userId, newRole) {
    fetch("http://localhost:3000/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId, role: newRole })
    })
        .then(res => res.text())
        .then(console.log)
        .catch(console.error);
}

export {banUser, changeRole, enableUser}