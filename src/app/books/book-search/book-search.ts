import { NgClass } from '@angular/common';
import { Component, computed, inject, input, viewChild } from '@angular/core';
import { SearchResult } from './search-result/search-result';
import { BookResultInfo } from '../../models/book-result-info';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BookService } from '../../services/book-service';

@Component({
  selector: 'app-book-search',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: BookSearch,
    },
  ],
  imports: [NgClass, SearchResult, ReactiveFormsModule],
  template: `
    <div class="search-container">
      <form>
        <label for="search">Search for book</label><br />
        <div class="search-input-container">
          <input
            type="text"
            id="search"
            placeholder="Search"
            [formControl]="search"
          />
          <button
            type="submit"
            class="search base-button"
            (click)="openSearch($event)"
            [disabled]="!search.valid || disabled"
          >
            Search
          </button>
        </div>
        @if(search.hasError("searchError") && search.touched && search.dirty){
        <p class="error-msg">
          <span class="material-icons">error</span>
          {{ search.getError('searchError') }}
        </p>
        }
      </form>
      <div
        class="results"
        [ngClass]="{ open: resultsOpen, closed: !resultsOpen }"
      >
        @if (isSearchLoading) {
        <app-search-result
          [title]="'Loading...'"
          [author]="[]"
          [key]="''"
          [isEven]="true"
        />
        } @else { @if (results.length === 0){
        <app-search-result
          [title]="'No books found'"
          [author]="['Try searching for something!']"
          [key]="''"
          [isEven]="true"
        />
        } @else { @for (result of results; track $index) {
        <app-search-result
          [title]="result.title ?? ''"
          [author]="result.author_name ?? []"
          [isEven]="$index % 2 == 0"
          [key]="result.key ?? ''"
          (select)="selectResult($event)"
        />
        } } }
      </div>
      <div class="results-clearfix" [style.height.px]="clearFixHeight()"></div>
      @if(touched && error()) {
      <p class="error-msg">
        <span class="material-icons">error</span>
        {{ error() }}
      </p>
      }
    </div>
  `,
  styleUrls: ['../../shared/form-styles.css', 'book-search.css'],
})
export class BookSearch implements ControlValueAccessor {
  resultsOpen: boolean = false;
  results: BookResultInfo[] = [];
  selectedBook: BookResultInfo | undefined = undefined;

  search = new FormControl<string>('', [Validators.required]);
  isSearchLoading: boolean = false;
  bookService = inject(BookService);
  firstResult = viewChild(SearchResult);
  clearFixHeight = computed<number>(() => {
    const result = this.firstResult();
    return result ? result.height() : 0;
  });

  touched: boolean = false;
  disabled: boolean = false;
  onChange = (selectedBook: BookResultInfo | undefined) => {};
  onTouched = () => {};
  error = input<any>();

  openSearch(event: any) {
    event.preventDefault();
    this.markAsTouched();
    if (this.disabled || !this.search.value) return;
    this.isSearchLoading = true;
    this.bookService.searchBooks(this.search.value).subscribe({
      next: (result) => {
        const filteredResults = result.docs.filter(
          (res) =>
            res.author_name !== undefined ||
            res.title !== undefined ||
            res.key !== undefined
        );
        this.results = filteredResults;
        this.resultsOpen = true;
      },
      error: (err) => {
        this.search.setErrors({ searchError: err.message });
        this.isSearchLoading = false;
      },
      complete: () => {
        this.isSearchLoading = false;
      },
    });
  }

  selectResult(elementKey: string) {
    if (!this.resultsOpen) return;
    this.markAsTouched();
    if (this.disabled) return;
    this.resultsOpen = false;
    const selectedResult = this.results.find(
      (result) => result.key === elementKey
    );
    this.writeValue(selectedResult);
    this.onChange(selectedResult);
  }

  writeValue(selectedBook: BookResultInfo | undefined): void {
    this.selectedBook = selectedBook;
    this.results = this.selectedBook ? [this.selectedBook] : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.disabled === isDisabled) return;
    this.disabled = isDisabled;
    if (this.disabled) this.search.disable();
    else this.search.enable();
  }

  private markAsTouched(): void {
    if (!this.touched) {
      this.onTouched;
      this.touched = true;
    }
  }
}
