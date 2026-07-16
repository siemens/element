/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownComponent } from './si-markdown.component';

describe('SiMarkdownComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
  });

  it('does not render a fragment for empty markdown', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('si-markdown-fragment')).toBeNull();
  });

  it('renders markdown using the built-in templates', async () => {
    fixture.componentRef.setInput(
      'markdown',
      `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

A paragraph with [a link](https://element.siemens.io "Element"), *emphasized*, **important**, and ~~deleted~~ text.[^1]

> A quoted paragraph.

- Unordered item
- [x] Completed task
- [ ] Open task

3. Third item
4. Fourth item

| Left | Center | Right |
| :--- | :----: | ---: |
| One | Two | Three |

![Sample image](https://example.com/image.png "Sample title")

---

First line  
Second line
`
    );
    fixture.detectChanges();
    // need a real tick here!
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(element.querySelector('h1')).toHaveTextContent('Heading 1');
    expect(element.querySelector('h2')).toHaveTextContent('Heading 2');
    expect(element.querySelector('h3')).toHaveTextContent('Heading 3');
    expect(element.querySelector('h4')).toHaveTextContent('Heading 4');
    expect(element.querySelector('h5')).toHaveTextContent('Heading 5');
    expect(element.querySelector('h6')).toHaveTextContent('Heading 6');
    expect(element.querySelector('p')).toHaveTextContent(
      'A paragraph with a link, emphasized, important, and deleted text.'
    );
    expect(element.querySelector('blockquote')).toHaveTextContent('A quoted paragraph.');
    expect(element.querySelector('a')).toHaveAttribute('href', 'https://element.siemens.io');
    expect(element.querySelector('a')).toHaveAttribute('title', 'Element');
    expect(element.querySelector('em')).toHaveTextContent('emphasized');
    expect(element.querySelector('strong')).toHaveTextContent('important');
    expect(element.querySelector('del')).toHaveTextContent('deleted');
    expect(element.querySelector('ul')).toHaveTextContent('Unordered itemCompleted taskOpen task');
    expect(element.querySelector('ol')).toHaveAttribute('start', '3');
    expect(element.querySelectorAll('li')).toHaveLength(5);
    expect(element.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
    expect(element.querySelectorAll('input[type="checkbox"]')[0]).toBeChecked();
    expect(element.querySelectorAll('input[type="checkbox"]')[1]).not.toBeChecked();
    expect(element.querySelector('table')).toHaveClass('table', 'mb-6');
    expect(element.querySelectorAll('th')).toHaveLength(3);
    expect(element.querySelectorAll('td')).toHaveLength(3);
    expect(element.querySelectorAll('th')[0]).toHaveStyle({ textAlign: 'left' });
    expect(element.querySelectorAll('th')[1]).toHaveStyle({ textAlign: 'center' });
    expect(element.querySelectorAll('th')[2]).toHaveStyle({ textAlign: 'right' });
    expect(element.querySelector('img')).toHaveAttribute('src', 'https://example.com/image.png');
    expect(element.querySelector('img')).toHaveAttribute('alt', 'Sample image');
    expect(element.querySelector('img')).toHaveAttribute('title', 'Sample title');
    expect(element.querySelector('hr')).toBeInTheDocument();
    expect(element.querySelector('br')).toBeInTheDocument();
  });

  it('renders sanitized inline HTML', async () => {
    fixture.componentRef.setInput(
      'markdown',
      '<img class="unsafe-html" src="image.png" onerror="alert()">'
    );
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const unsafeImage = element.querySelector('.unsafe-html');

    expect(unsafeImage).not.toBeNull();
    expect(unsafeImage).not.toHaveAttribute('onerror');
  });
});
