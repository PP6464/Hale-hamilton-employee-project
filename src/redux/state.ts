export type AppState = {
    user: User | null;
    accessToken: string | null;
};

type Action = {
    type: string;
    payload: any;
};

export type User = {
    name: string,
    photoURL: string,
    email: string,
    isAdmin: boolean,
    uid: string,
}

const initialState: AppState = {
    user: null,
    accessToken: null,
};

function reducer(state = initialState, action: Action) {
    switch (action.type) {
        case "logIn":
            return {
                ...state,
                uid: action.payload.user.uid,
                accessToken: action.payload.accessToken,
                userIsAdmin: action.payload.user.userIsAdmin,
            };
        default:
            return state;
    }
}

export default reducer;
