export type AppState = {
    uid: string | null;
    accessToken: string | null;
    userIsAdmin: boolean;
};

type Action = {
    type: string;
    payload: any;
};

const initialState: AppState = {
    uid: null,
    accessToken: null,
    userIsAdmin: false,
};

function reducer(state = initialState, action: Action) {
    switch (action.type) {
        case "logIn":
            return {
                ...state,
                uid: action.payload.uid,
                accessToken: action.payload.accessToken,
                userIsAdmin: action.payload.userIsAdmin,
            };
        default:
            return state;
    }
}

export default reducer;
