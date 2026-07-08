import { db } from '../db/db';
import {
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
} from '../db/schema';

const ROLES = [
  { name: 'admin' },
  { name: 'user' },
  { name: 'organizer' },
] as const;

const PERMISSIONS = [
  // Organizer
  { name: 'event:create' },
  { name: 'event:update:own' },
  { name: 'event:publish' },
  { name: 'event:cancel:own' },
  { name: 'booking:read:own-event' },
  // Admin
  { name: 'user:read:all' },
  { name: 'user:delete:any' },
  { name: 'organizer:approve' },
  { name: 'organizer:reject' },
  { name: 'organizer:revoke' },
  { name: 'event:read:all' },
  { name: 'event:delete:any' },
  { name: 'booking:read:all' },
];

type RoleName = (typeof ROLES)[number]['name'];
const ROLE_PERMISSION_MAP: Record<RoleName, string[]> = {
  user: [],
  organizer: [
    'event:create',
    'event:update:own',
    'event:publish',
    'event:cancel:own',
    'booking:read:own-event',
  ],
  admin: [
    'user:read:all',
    'user:delete:any',
    'organizer:approve',
    'organizer:reject',
    'organizer:revoke',
    'event:read:all',
    'event:delete:any',
    'booking:read:all',
  ],
};

export async function seedRolesPermissions() {
  console.log('Seeding roles....');
  await db
    .insert(rolesTable)
    .values(ROLES.map((name) => name))
    .onConflictDoNothing();

  console.log('Seeding permissions...');

  await db
    .insert(permissionsTable)
    .values(PERMISSIONS.map((name) => name))
    .onConflictDoNothing();

  console.log('Fetching roles and permissions from the database...');

  const roles = await db.select().from(rolesTable);
  const permissions = await db.select().from(permissionsTable);

  const roleIdByName = new Map(roles.map((role) => [role.name, role.id]));
  const permissionIdByName = new Map(
    permissions.map((permission) => [permission.name, permission.id])
  );

  console.log('Building role_permissions rows');

  const rolePermissionRows: { roleId: string; permissionId: string }[] = [];

  for (const roleName of ROLES) {
    const roleId = roleIdByName.get(roleName.name);
    if (!roleId) {
      throw Error(`Role ${roleName.name} not found in the database.`);
    }

    for (const permissionName of ROLE_PERMISSION_MAP[roleName.name]) {
      const permissionId = permissionIdByName.get(permissionName);
      if (!permissionId) {
        throw new Error(
          `Permission ${permissionName} not found in the database.`
        );
      }
      rolePermissionRows.push({ roleId, permissionId });
    }
  }

  if (rolePermissionRows.length > 0) {
    console.log(
      `Seeding ${rolePermissionRows.length} role_permission mappings...`
    );
    await db
      .insert(rolePermissionsTable)
      .values(rolePermissionRows)
      .onConflictDoNothing();
  }

  console.log('Seeding complete.');
}

seedRolesPermissions()
  .catch((err) => {
    console.error('Seeding failed', err);
    process.exit(1);
  })
  .finally(() => console.log('Seed script finished running'));
