/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  signal,
  viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { elementOptionsVertical } from '@siemens/element-icons';
import {
  SiApplicationHeaderComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import {
  ChatInputAttachment,
  SiAiMessageComponent,
  SiChatInputComponent,
  SiUserMessageComponent
} from '@siemens/element-ng/chat-messages';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';
import {
  SiSidePanelBackButtonComponent,
  SiSidePanelComponent,
  SiSidePanelContentComponent
} from '@siemens/element-ng/side-panel';

import { markdownOptions } from './markdown-options';

interface Conversation {
  id: string;
  group: string;
  title: string;
  prompt: string;
  response: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

@Component({
  selector: 'app-sample',
  imports: [
    RouterLink,
    SiAiMessageComponent,
    SiApplicationHeaderComponent,
    SiChatInputComponent,
    SiHeaderActionItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective,
    SiIconComponent,
    SiMarkdownComponent,
    SiSidePanelBackButtonComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiUserMessageComponent
  ],
  templateUrl: './si-chat-history.html'
})
export class SampleComponent {
  protected readonly markdownOptions = markdownOptions;
  protected readonly icons = addIcons({ elementOptionsVertical });

  readonly collapsed = signal(false);
  readonly activeView = signal<'chat' | 'history'>('chat');
  readonly searchTerm = signal('');
  readonly inputValue = signal('');

  readonly conversations: Conversation[] = [
    {
      id: 'building-faults',
      group: 'Today',
      title: 'Building faults',
      prompt: 'Show me the high priority faults in my building A.',
      // Content lines must start at column 0, otherwise markdown renders them as a code block.
      response: `I've identified several high-priority issues in Building A that need urgent attention:

1. **The HVAC systems on the 3rd and 5th floors are failing to maintain stable temperatures**, creating discomfort and potential equipment risks.
2. **There's a water leakage problem in the basement pump room** that could lead to electrical hazards if ignored.
3. **Elevator Unit #2 has been stalling during busy hours**, and several smoke detectors in Block A-East are currently offline.

These faults must be addressed immediately to maintain safety and compliance.`
    },
    {
      id: 'temperature-west-wing',
      group: 'Today',
      title: 'Temperature fluctuation in west wing',
      prompt: 'Why is the west wing temperature fluctuating?',
      response:
        'The supply-air sensor shows intermittent readings. Inspect the sensor connection before changing the control parameters.'
    },
    {
      id: 'airflow-meeting-rooms',
      group: 'Today',
      title: 'HVAC airflow imbalance in meeting rooms',
      prompt: 'Compare airflow across the meeting rooms.',
      response:
        'Rooms 2.14 and 2.16 are below the expected airflow range. The remaining meeting rooms are operating normally.'
    },
    {
      id: 'chiller-restart',
      group: 'Yesterday',
      title: 'Chiller restart after overnight shutdown',
      prompt: 'Summarize the overnight chiller restart.',
      response:
        'The restart completed successfully at 06:12. No active alarms remain, and the chilled-water loop is stable.'
    },
    {
      id: 'heating-loop',
      group: 'Last 7 days',
      title: 'Heating loop imbalance investigation',
      prompt: 'What did we find in the heating loop investigation?',
      response:
        'The investigation found a partially closed balancing valve on the north branch. Correcting it restored the expected flow.'
    }
  ];

  readonly selectedConversation = signal<Conversation | undefined>(this.conversations[0]);
  readonly messages = signal<ChatMessage[]>(this.messagesFor(this.conversations[0]));
  readonly heading = computed(() => this.selectedConversation()?.title ?? 'New chat');
  readonly primaryActions = computed<ContentActionBarMainItem[]>(() =>
    this.activeView() === 'chat'
      ? [
          {
            type: 'action',
            label: 'Chat history',
            icon: 'element-clock',
            iconOnly: true,
            action: () => this.showHistory(),

          },
          {
            type: 'action',
            label: 'New chat',
            icon: 'element-edit-bulk',
            iconOnly: true,
            action: () => this.startNewChat()
          }
        ]
      : []
  );
  readonly filteredConversationGroups = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const groups = ['Today', 'Yesterday', 'Last 7 days'];

    return groups
      .map(group => ({
        group,
        conversations: this.conversations.filter(
          conversation =>
            conversation.group === group && conversation.title.toLowerCase().includes(searchTerm)
        )
      }))
      .filter(group => group.conversations.length > 0);
  });

  private readonly backButton = viewChild('backButton', {
    read: ElementRef<HTMLButtonElement>
  });
  constructor() {
    afterRenderEffect(() => {
      if (this.activeView() === 'history') {
        this.backButton()?.nativeElement.focus();
      }
    });
  }

  showHistory(): void {
    this.searchTerm.set('');
    this.activeView.set('history');
  }

  showChat(): void {
    this.activeView.set('chat');
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation.set(conversation);
    this.messages.set(this.messagesFor(conversation));
    this.showChat();
  }

  startNewChat(): void {
    this.selectedConversation.set(undefined);
    this.messages.set([]);
    this.showChat();
  }

  sendMessage(event: { content: string; attachments: ChatInputAttachment[] }): void {
    const content = event.content.trim();
    if (!content) {
      return;
    }

    this.messages.update(messages => [
      ...messages,
      { role: 'user', content },
      {
        role: 'ai',
        content: 'This example keeps the response concise. Connect your AI service here.'
      }
    ]);
    this.inputValue.set('');
  }

  private messagesFor(conversation: Conversation): ChatMessage[] {
    return [
      { role: 'user', content: conversation.prompt },
      { role: 'ai', content: conversation.response }
    ];
  }
}
