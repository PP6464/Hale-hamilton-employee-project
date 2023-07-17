import { User } from "./state";

export const logIn = (user: User) => ({
  type: "logIn",
  payload: {
    user: user
  },
});

export const logOut = () => ({
  type: "logOut",
});

export const updateUser = (name?: string, photoURL?: string) => ({
  type: "updateUser",
  payload: {
    name: name,
    photoURL: photoURL,
  },
});
