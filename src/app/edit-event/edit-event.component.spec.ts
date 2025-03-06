import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGameComponent } from './edit-event.component';

describe('EditGameComponent', () => {
  let component: EditGameComponent;
  let fixture: ComponentFixture<EditGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
