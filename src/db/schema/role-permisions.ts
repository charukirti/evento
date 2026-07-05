import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { rolesTable } from './roles';
import { permissionsTable } from './permissions';

export const rolePermissionsTable = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => rolesTable.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissionsTable.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]
);

export type NewRolePermission = typeof rolePermissionsTable.$inferInsert;
export type RolePermission = typeof rolePermissionsTable.$inferSelect;
