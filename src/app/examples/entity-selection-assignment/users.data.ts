/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/** Fictional placeholder people; `example.com` is reserved for documentation. */
export const USERS: User[] = [
  'Alex Doe',
  'Blake Roe',
  'Casey Sample',
  'Dana Example',
  'Eli Doe',
  'Finley Roe',
  'Gray Sample',
  'Harper Example',
  'Indy Doe',
  'Jamie Roe',
  'Kai Sample',
  'Logan Example',
  'Morgan Doe',
  'Noel Roe',
  'Oakley Sample',
  'Parker Example',
  'Quinn Doe',
  'Reese Roe',
  'Sage Sample',
  'Taylor Example',
  'Uma Doe',
  'Val Roe',
  'Wren Sample',
  'Xen Example',
  'Yael Doe',
  'Zion Roe'
].map(name => {
  const slug = name.toLowerCase().replaceAll(' ', '.');
  return { id: slug, name, email: `${slug}@example.com` };
});

export const USERS_BY_ID = new Map(USERS.map(user => [user.id, user]));

export const INITIAL_MEMBER_IDS = [
  'morgan.doe',
  'casey.sample',
  'harper.example',
  'quinn.doe',
  'eli.doe',
  'taylor.example'
];

/** Ids of all users that are not members, in alphabetical order. */
export const nonMemberIds = (memberIds: readonly string[]): string[] =>
  USERS.filter(user => !memberIds.includes(user.id)).map(user => user.id);

export const plural = (count: number, singular: string, pluralForm = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : pluralForm}`;
