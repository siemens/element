/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  afterRenderEffect,
  Component,
  ElementRef,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiSidePanelComponent, SiSidePanelContentComponent } from '@siemens/element-ng/side-panel';

interface ChatHistoryItem {
  id: string;
  title: string;
  aiType: string;
  timestamp: string;
  prompt: string;
  response: string;
}

@Component({
  selector: 'app-sample',
  imports: [
    RouterLink,
    SiApplicationHeaderComponent,
    SiHeaderActionItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective,
    SiIconComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent
  ],
  templateUrl: './si-side-panel-inner-navigation.html'
})
export class SampleComponent {
  readonly collapsed = signal(true);
  readonly selectedChat = signal<ChatHistoryItem | undefined>(undefined);
  readonly chats: ChatHistoryItem[] = [
    {
      id: 'project-summary',
      title: 'Summarize project notes',
      aiType: 'Text generation',
      timestamp: 'Today, 10:32',
      prompt: 'Summarize the key decisions and action items from these project notes.',
      response: 'The team agreed on three priorities and assigned an owner to each action item.'
    },
    {
      id: 'quarterly-results',
      title: 'Compare quarterly results',
      aiType: 'Data analysis',
      timestamp: 'Yesterday, 16:08',
      prompt: 'Compare this quarter with the previous quarter and highlight significant changes.',
      response: 'Revenue increased while operating costs remained stable, improving the margin.'
    },
    {
      id: 'image-description',
      title: 'Describe an uploaded image',
      aiType: 'Image understanding',
      timestamp: 'Monday, 09:15',
      prompt: 'Describe the main elements in this image and their spatial relationship.',
      response: 'The image shows a desk with a laptop centered between a notebook and a plant.'
    }
  ];

  private readonly sidePanelContent = viewChild.required(SiSidePanelContentComponent);
  private readonly chatButtons = viewChildren<ElementRef<HTMLButtonElement>>('chatButton');
  private originIndex?: number;

  constructor() {
    afterRenderEffect(() => {
      if (this.selectedChat()) {
        this.sidePanelContent().focusBackButton();
      } else if (this.originIndex !== undefined) {
        this.chatButtons()[this.originIndex]?.nativeElement.focus();
      }
    });
  }

  showConversation(chat: ChatHistoryItem, index: number): void {
    this.originIndex = index;
    this.selectedChat.set(chat);
  }

  showList(): void {
    this.selectedChat.set(undefined);
  }
}
