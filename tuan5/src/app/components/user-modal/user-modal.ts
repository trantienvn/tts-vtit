import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User, UserForm } from '../../models/user.model';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css'
})
export class UserModalComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() loading = false;
  @Output() save   = new EventEmitter<UserForm>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitted = signal(false);
  avatarPreview = signal('');

  get isEdit(): boolean { return !!this.user; }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      last_name:  [this.user?.last_name  || '', Validators.required],
      first_name: [this.user?.first_name || '', Validators.required],
      email:      [this.user?.email      || '', [Validators.required, Validators.email]],
      avatar:     [this.user?.avatar     || '']
    });
    this.avatarPreview.set(this.user?.avatar || '');

    this.form.get('avatar')!.valueChanges.subscribe(v => this.avatarPreview.set(v || ''));
  }

  get f() { return this.form.controls; }

  getInitial(): string {
    return (this.f['first_name'].value || '?')[0]?.toUpperCase() || '?';
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.save.emit(this.form.value as UserForm);
  }

  onCancel(): void { this.cancel.emit(); }
}
