import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstoqueListComponent } from './estoque-list.component';

describe('EstoqueList', () => {
  let component: EstoqueListComponent;
  let fixture: ComponentFixture<EstoqueListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstoqueListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EstoqueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
