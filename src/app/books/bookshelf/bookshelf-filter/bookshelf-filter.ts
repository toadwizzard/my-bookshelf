import { NgClass } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface BookshelfFilterValues {
  hasCheck: boolean,
  owner: string,
  title: string,
  onShelf: boolean,
  lent: boolean,
  borrowed: boolean,
  libraryBook: boolean
}

@Component({
  selector: 'app-bookshelf-filter',
  imports: [ReactiveFormsModule, NgClass],
  template: `
    <div class="form-container">
      <p class="filterTitle" [ngClass]="{open: !formHidden}" (click)="toggleForm()">Filter</p>
      <form [formGroup]="filterForm" (submit)="filterBooks()" [ngClass]="{hidden: formHidden}">
        <div class="checkboxes">
          <input type="checkbox" id="onShelf" formControlName="onShelf"><label for="onShelf">Books on shelf</label><br>
          <input type="checkbox" id="lent" formControlName="lent"><label for="lent">Lent books</label><br>
          <input type="checkbox" id="borrowed" formControlName="borrowed"><label for="borrowed">Borrowed books</label><br>
          <input type="checkbox" id="libraryBook" formControlName="libraryBook"><label for="libraryBook">Borrowed from library</label>
        </div>
        <div>
          <label for="owner">Owner:</label>
          <input type="text" placeholder="Filter by owner" id="owner" formControlName="owner">
        </div>
        <div>
          <label for="title">Title:</label>
          <input type="text" placeholder="Filter by title" id="title" formControlName="title">
        </div>
        <div class="buttons">
          <button class="base-button" type="submit">Filter</button>
          <button class="base-button" (click)="clearFilter()">Clear</button>
        </div>
      </form>
    </div>
  `,
  styleUrl: `../../shared/filter-styles.css`,
})
export class BookshelfFilter {
  formHidden: boolean = true;
  filterForm = new FormGroup({
    owner: new FormControl<string>(''),
    title: new FormControl<string>(''),
    onShelf: new FormControl<boolean>(false),
    lent: new FormControl<boolean>(false),
    borrowed: new FormControl<boolean>(false),
    libraryBook: new FormControl<boolean>(false),
  });
  filter = output<BookshelfFilterValues>();

  toggleForm(){
    this.formHidden = !this.formHidden;
  }

  filterBooks(){
    this.filter.emit(this.getFilterValues());
  }

  clearFilter(){
    this.filterForm.reset();
    this.filter.emit(this.getFilterValues());
  }

  private getFilterValues(): BookshelfFilterValues {
    return {
      owner: this.filterForm.value.owner ?? "",
      title: this.filterForm.value.title ?? "",
      hasCheck: !!this.filterForm.value.onShelf ||
        !!this.filterForm.value.lent ||
        !!this.filterForm.value.borrowed ||
        !!this.filterForm.value.libraryBook,
      onShelf: !!this.filterForm.value.onShelf,
      lent: !!this.filterForm.value.lent,
      borrowed: !!this.filterForm.value.borrowed,
      libraryBook: !!this.filterForm.value.libraryBook
    }
  }
}
