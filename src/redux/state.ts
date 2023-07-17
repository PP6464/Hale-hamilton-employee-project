export type AppState = {
  user: User | null;
  accessToken: string | null;
};

type Action = {
  type: string;
  payload: any;
};

export type User = {
  name: string;
  photoURL: string;
  email: string;
  isAdmin: boolean;
  uid: string;
  department: string;
};

const initialState: AppState = {
  user: null,
  accessToken: null,
};

function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case "logIn":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
      };
    case "logOut":
      return {
        ...state,
        user: null,
        accessToken: null,
      };
    case "updateUser":
      return {
        ...state,
        user: {
          ...state.user,
          name:
            action.payload.name !== undefined
              ? action.payload.name
              : state.user!.name,
          photoURL:
            action.payload.photoURL !== undefined
              ? action.payload.photoURL
              : state.user!.photoURL,
        },
      };
    default:
      return state;
  }
}

export default reducer;
