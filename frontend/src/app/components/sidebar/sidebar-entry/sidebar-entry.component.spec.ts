import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarEntryComponent } from './sidebar-entry.component';

describe('SidebarEntryComponent', () => {
  let component: SidebarEntryComponent;
  let fixture: ComponentFixture<SidebarEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarEntryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarEntryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
