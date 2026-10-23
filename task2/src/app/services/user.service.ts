import { Injectable, signal } from '@angular/core';
import { User, UserForm } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly STORAGE_KEY = 'vss_users';

  users = signal<User[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      this.users.set(JSON.parse(raw));
    } else {
      // Seed với dữ liệu mẫu
      const seed: User[] = [
        { id: 1, first_name: 'George',  last_name: 'Bluth',   email: 'george.bluth@reqres.in',   avatar: 'https://reqres.in/img/faces/1-image.jpg' },
        { id: 2, first_name: 'Janet',   last_name: 'Weaver',  email: 'janet.weaver@reqres.in',   avatar: 'https://reqres.in/img/faces/2-image.jpg' },
        { id: 3, first_name: 'Emma',    last_name: 'Wong',    email: 'emma.wong@reqres.in',      avatar: 'https://reqres.in/img/faces/3-image.jpg' },
        { id: 4, first_name: 'Eve',     last_name: 'Holt',    email: 'eve.holt@reqres.in',       avatar: 'https://reqres.in/img/faces/4-image.jpg' },
        { id: 5, first_name: 'Charles', last_name: 'Morris',  email: 'charles.morris@reqres.in', avatar: 'https://reqres.in/img/faces/5-image.jpg' },
      ];
      this.users.set(seed);
      this.save();
    }
  }

  private save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users()));
  }

  private nextId(): number {
    const list = this.users();
    return list.length ? Math.max(...list.map(u => u.id)) + 1 : 1;
  }

  getAll(): User[] {
    return this.users();
  }

  getById(id: number): User | undefined {
    return this.users().find(u => u.id === id);
  }

  add(form: UserForm): User {
    const newUser: User = { id: this.nextId(), ...form, avatar: form.avatar || '' };
    this.users.update(list => [...list, newUser]);
    this.save();
    return newUser;
  }

  update(id: number, form: UserForm): User | null {
    const idx = this.users().findIndex(u => u.id === id);
    if (idx === -1) return null;
    const updated: User = { ...this.users()[idx], ...form };
    this.users.update(list => list.map(u => u.id === id ? updated : u));
    this.save();
    return updated;
  }

  delete(id: number): void {
    this.users.update(list => list.filter(u => u.id !== id));
    this.save();
  }
}
