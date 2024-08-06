import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TareasPPage } from './tareas-p.page';

describe('TareasPPage', () => {
  let component: TareasPPage;
  let fixture: ComponentFixture<TareasPPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TareasPPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
