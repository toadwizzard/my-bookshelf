import { NgClass } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BookFilterValues } from '../../../models/book-filter-values';

@Component({
  selector: 'app-bookshelf-filter',
  imports: [ReactiveFormsModule, NgClass],
  template: `
    <div class="form-container">
      <p
        class="filterTitle"
        [ngClass]="{ open: !formHidden }"
        (click)="toggleForm()"
        (keyup.enter)="toggleForm()"
        tabindex="0"
      >
        Filter
      </p>
      <form
        [formGroup]="filterForm"
        (submit)="filterBooks()"
        [ngClass]="{ hidden: formHidden }"
      >
        <div class="checkboxes">
          <input type="checkbox" id="onShelf" formControlName="onShelf" /><label
            for="onShelf"
            >Books on shelf</label
          ><br />
          <input type="checkbox" id="lent" formControlName="lent" /><label
            for="lent"
            >Lent books</label
          ><br />
          <input
            type="checkbox"
            id="borrowed"
            formControlName="borrowed"
          /><label for="borrowed">Borrowed books</label><br />
          <input
            type="checkbox"
            id="libraryBook"
            formControlName="libraryBook"
          /><label for="libraryBook">Borrowed from library</label>
        </div>
        <div>
          <label for="owner">Owner:</label>
          <input
            type="text"
            placeholder="Filter by owner"
            id="owner"
            formControlName="owner"
          />
        </div>
        <div>
          <label for="title">Title:</label>
          <input
            type="text"
            placeholder="Filter by title"
            id="title"
            formControlName="title"
          />
        </div>
        <div>
          <label for="author">Author:</label>
          <input
            type="text"
            placeholder="Filter by author"
            id="author"
            formControlName="author"
          />
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
    author: new FormControl<string>(''),
    onShelf: new FormControl<boolean>(false),
    lent: new FormControl<boolean>(false),
    borrowed: new FormControl<boolean>(false),
    libraryBook: new FormControl<boolean>(false),
  });
  filter = output<BookFilterValues>();

  toggleForm() {
    this.formHidden = !this.formHidden;
  }

  filterBooks() {
    this.filter.emit(this.getFilterValues());
  }

  clearFilter() {
    this.filterForm.reset();
    this.filter.emit(this.getFilterValues());
  }

  private getFilterValues(): BookFilterValues {
    return {
      owner: this.filterForm.value.owner ?? '',
      title: this.filterForm.value.title ?? '',
      author: this.filterForm.value.author ?? '',
      onShelf: !!this.filterForm.value.onShelf,
      lent: !!this.filterForm.value.lent,
      borrowed: !!this.filterForm.value.borrowed,
      libraryBook: !!this.filterForm.value.libraryBook,
    };
  }
}
