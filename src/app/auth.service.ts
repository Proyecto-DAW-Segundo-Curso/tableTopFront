import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, User, UserCredential } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private router: Router) {
    // Persistencia del estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        console.log('Usuario autenticado con UID:', user.uid);
      } else {
        console.log('Usuario no autenticado');
      }
    });
  }

  // Registrar nuevo usuario
  async register(email: string, password: string, username: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      console.log('Usuario registrado con nombre:', userCredential.user.displayName);
      this.router.navigate(['/dashboard']);
      return userCredential;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Iniciar sesión
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
      return userCredential;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  // Obtener UID del usuario
  getUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  getUserName(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.displayName : null;
  }

  // Obtener token de Firebase
  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('No hay usuario autenticado para obtener token');
      return null;
    }
    
    try {
      console.log('Obteniendo token para usuario:', user.uid);
      // Forzamos actualización del token
      const token = await user.getIdToken(true);
      console.log('Token obtenido correctamente:', token.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  }
}
