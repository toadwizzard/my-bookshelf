import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { SearchResult } from './search-result/search-result';
import { BookResultInfo } from '../../models/book-result-info';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../services/book-service';

@Component({
  selector: 'app-book-search',
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
            class="search"
            (click)="openSearch($event)"
            [disabled]="!search.valid"
          >
            Search
          </button>
        </div>
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
      <div class="results-clearfix"></div>
      <input type="text" [formControl]="bookKeyInput()" [hidden]="true" />
    </div>
  `,
  styleUrls: ['../../shared/form-styles.css', 'book-search.css'],
})
export class BookSearch {
  resultsOpen: boolean = false;
  results: BookResultInfo[] = [];
  bookKeyInput = input.required<FormControl<string | null>>();

  search = new FormControl<string>('', [Validators.required]);
  isSearchLoading: boolean = false;
  bookService = inject(BookService);

  openSearch(event: any) {
    event.preventDefault();
    if (!this.search.value) return;
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
        this.results = [
          {
            title: 'An error occurred:',
            author_name: [err],
            key: '',
          },
        ];
      },
      complete: () => {
        this.isSearchLoading = false;
      },
    });
  }

  selectResult(elementKey: string) {
    this.resultsOpen = false;
    const selectedResult = this.results.find(
      (result) => result.key === elementKey
    );
    this.results = selectedResult ? [selectedResult] : [];
    this.bookKeyInput().setValue(selectedResult?.key ?? '');
  }
}
