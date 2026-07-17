import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { isAdminUid } from "./firestore/queries";

type AuthState = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (!u) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        let admin = await isAdminUid(u.uid);
        
        // Auto-assign admin role to the specific email
        if (!admin && u.email === "swamyrealitykkd@gmail.com") {
          admin = true;
          try {
            const { setDoc, doc } = await import("firebase/firestore");
            await setDoc(doc(db, "admins", u.uid), {
              email: u.email,
              createdAt: new Date(),
            });
          } catch (e) {
            console.error("Failed to auto-assign admin role:", e);
          }
        }

        if (!admin) {
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        } else {
          setUser(u);
          setIsAdmin(true);
        }
      } catch {
        setUser(u);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    let admin = await isAdminUid(cred.user.uid);
    
    // Auto-assign admin role to the specific email
    if (!admin && cred.user.email === "swamyrealitykkd@gmail.com") {
      admin = true;
      try {
        const { setDoc, doc } = await import("firebase/firestore");
        await setDoc(doc(db, "admins", cred.user.uid), {
          email: cred.user.email,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error("Failed to auto-assign admin role:", e);
      }
    }

    if (!admin) {
      await signOut(auth);
      throw new Error("You do not have admin access.");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
