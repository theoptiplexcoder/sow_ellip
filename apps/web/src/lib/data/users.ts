export type ProjectRole = 'creator' | 'approver' | 'executive_viewer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  status: 'active' | 'inactive';
  projectCount: number;
}

export const users: AppUser[] = [
  {
    id: 'user-1',
    name: 'Dana Whitfield',
    email: 'dana@northwind.io',
    avatarInitials: 'DW',
    status: 'active',
    projectCount: 6,
  },
  {
    id: 'user-2',
    name: 'Casey Odom',
    email: 'casey@northwind.io',
    avatarInitials: 'CO',
    status: 'active',
    projectCount: 4,
  },
  {
    id: 'user-3',
    name: 'Priya Shah',
    email: 'priya.shah@northwind.io',
    avatarInitials: 'PS',
    status: 'active',
    projectCount: 3,
  },
  {
    id: 'user-4',
    name: 'Marcus Yee',
    email: 'marcus.yee@northwind.io',
    avatarInitials: 'MY',
    status: 'active',
    projectCount: 5,
  },
  {
    id: 'user-5',
    name: 'Talia Brooks',
    email: 'talia@northwind.io',
    avatarInitials: 'TB',
    status: 'active',
    projectCount: 2,
  },
  {
    id: 'user-6',
    name: 'Ravi Kapoor',
    email: 'ravi@northwind.io',
    avatarInitials: 'RK',
    status: 'active',
    projectCount: 3,
  },
  {
    id: 'user-7',
    name: 'Emma Lindqvist',
    email: 'emma@northwind.io',
    avatarInitials: 'EL',
    status: 'inactive',
    projectCount: 1,
  },
  {
    id: 'user-8',
    name: 'Jon Alvarez',
    email: 'jon@northwind.io',
    avatarInitials: 'JA',
    status: 'active',
    projectCount: 4,
  },
];

export function getUser(id: string) {
  return users.find((u) => u.id === id);
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return initials.slice(0, 2).toUpperCase();
}

export function createUser(input: { name: string; email: string }): AppUser {
  const user: AppUser = {
    id: `user-${Date.now()}`,
    name: input.name,
    email: input.email,
    avatarInitials: initialsFor(input.name),
    status: 'active',
    projectCount: 0,
  };
  users.push(user);
  return user;
}
