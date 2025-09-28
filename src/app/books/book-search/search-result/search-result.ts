import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-result',
  imports: [NgClass],
  template: `
    <div
      class="search-result"
      [ngClass]="{ even: isEven(), odd: !isEven() }"
      (click)="onSelect()"
    >
      <p class="title">{{ title() }}</p>
      <p class="author">{{ authorList() }}</p>
    </div>
  `,
  styleUrl: `search-result.css`,
})
export class SearchResult {
  title = input.required<string>();
  author = input.required<string[]>();
  key = input.required<string>();
  isEven = input.required<boolean>();
  select = output<string>();

  onSelect() {
    this.select.emit(this.key());
  }

  authorList(): string {
    return this.author().join(', ');
  }
}
