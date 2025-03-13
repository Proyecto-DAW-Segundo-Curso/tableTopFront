import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User, 
  UserCredential } from '@angular/fire/auth';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Usamos undefined para indicar que aún no se ha determinado el estado
  private currentUserSubject: BehaviorSubject<User | null | undefined> = new BehaviorSubject<User | null | undefined>(undefined);
  public currentUser$: Observable<User | null | undefined> = this.currentUserSubject.asObservable();
  
  // Observable que emite solo cuando el estado de autenticación está determinado (no undefined)
  public authStateReady$: Observable<User | null> = this.currentUser$.pipe(
    filter(user => user !== undefined),
    switchMap(user => of(user as User | null)) // Convertir undefined a null si es necesario
  );

  constructor(private auth: Auth, private router: Router) {
    console.log('Inicializando AuthService, esperando estado de autenticación...');
    
    // Persistencia del estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        console.log('Usuario autenticado con UID:', user.uid);
      } else {
        console.log('Usuario no autenticado');
      }
    }, (error) => {
      console.error('Error en el observador de autenticación:', error);
      this.currentUserSubject.next(null); // En caso de error, asumimos no autenticado
    });
  }

  // Esperar a que el estado de autenticación esté determinado
  waitForAuthReady(): Observable<User | null> {
    return this.authStateReady$.pipe(first());
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
    // El método auth.currentUser podría estar desincronizado con el estado que manejamos
    // Si estamos seguros de que el estado está determinado, podemos confiar en currentUserSubject
    const currentValue = this.currentUserSubject.value;
    if (currentValue !== undefined) {
      return currentValue;
    }
    
    // Si el estado aún no está determinado, recurrimos a auth.currentUser
    return this.auth.currentUser;
  }

  // Obtener usuario actual (versión asíncrona que espera a que el estado esté determinado)
  async getCurrentUserAsync(): Promise<User | null> {
    await firstValueFrom(this.waitForAuthReady());
    return this.currentUserSubject.value || null;
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
