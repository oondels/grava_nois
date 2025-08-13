import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AuthUser = Pick<User,
  "uid" | "email" | "displayName" | "photoURL" | "emailVerified">;

class authService {
  async signUpEmail(email: string, password: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user;
  }

  async signInEmail(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  }

  async signInGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;

      return { user, token };
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }
}

export const authServiceInstance = new authService();

// export function subscribeAuth(callback: (u: AuthUser | null) => void) {
//   return onAuthStateChanged(auth, (user) => {
//     if (!user) return callback(null);
//     const { uid, email, displayName, photoURL, emailVerified } = user;
//     callback({ uid, email, displayName, photoURL, emailVerified });
//   });
// }

// export async function signUpEmail(email: string, password: string) {
//   const { user } = await createUserWithEmailAndPassword(auth, email, password);
//   return user;
// }

// export async function signInEmail(email: string, password: string) {
//   const { user } = await signInWithEmailAndPassword(auth, email, password);
//   return user;
// }

// export async function signInGoogle() {
//   const provider = new GoogleAuthProvider();

//   try {
//     const result = await signInWithPopup(auth, provider);
//     const credential = GoogleAuthProvider.credentialFromResult(result);
//     const token = credential?.accessToken;
//     const user = result.user;

//     return { user, token };
//   } catch (error: any) {
//     console.error("Error signing in with Google:", error);
//     // const credential = GoogleAuthProvider.credentialFromError(error);

//     throw error;
//   }
// }

// export async function resetPassword(email: string) {
//   await sendPasswordResetEmail(auth, email);
// }

// export async function signOutApp() {
//   await signOut(auth);
// }
