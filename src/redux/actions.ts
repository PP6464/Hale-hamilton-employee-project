export const logIn = (uid: string, accessToken: string, userIsAdmin: boolean) => ({
    type: "logIn",
    payload: {
        uid: uid,
        userIsAdmin: userIsAdmin
    }
});
