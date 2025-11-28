import { NgClass } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BookFilterValues } from '../../../models/book-filter-values';

@Component({
  selector: 'app-wishlist-filter',
  imports: [NgClass, ReactiveFormsModule],
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
export class WishlistFilter {
  formHidden: boolean = true;
  filterForm = new FormGroup({
    title: new FormControl<string>(''),
    author: new FormControl<string>(''),
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
      title: this.filterForm.value.title ?? '',
      author: this.filterForm.value.author ?? '',
      owner: '',
      onShelf: false,
      lent: false,
      borrowed: false,
      libraryBook: false,
    };
  }
}
