import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroBase } from './cadastro-base';

describe('CadastroBase', () => {
  let component: CadastroBase;
  let fixture: ComponentFixture<CadastroBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
