import { PrismaClient } from '@prisma/client';

const globalPrisma = new PrismaClient();

/**
 * Validates a slug format.
 * Slug must be alphanumeric, dashes, or underscores.
 * @param {string} slug
 * @returns {boolean}
 */
export function isValidSlug(slug) {
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

/**
 * Creates a new organization in the public schema and provisions a new
 * PostgreSQL schema specific to that organization.
 * 
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.slug
 * @returns {Promise<object>} The created organization record
 */
export async function createOrganization({ name, slug }) {
  if (!isValidSlug(slug)) {
    throw new Error('Invalid slug format. Alphanumeric, dash, and underscore only.');
  }

  // 1. We must execute in a transaction so we don't have orphan schemas if insert fails.
  // Wait, Prisma doesn't easily let us DDL (CREATE SCHEMA) inside a standard interactive transaction
  // safely alongside regular DML in some cases, but $executeRawUnsafe can be run.
  // However, `CREATE SCHEMA` might be safer outside or we handle rollback manually.
  // Actually, we can just insert the org first, get its ID, then create the schema.
  // If schema creation fails, we can delete the org.

  const org = await globalPrisma.organization.create({
    data: {
      name,
      slug,
      // Temporarily use a placeholder schema_name, then update it.
      schema_name: `tenant_temp_${Date.now()}`
    }
  });

  const schemaName = `tenant_${String(org.id).padStart(3, '0')}`;

  try {
    // Update org with the proper schema name
    await globalPrisma.organization.update({
      where: { id: org.id },
      data: { schema_name: schemaName }
    });

    // 2. Provision the database schema physical boundary
    // Prisma $executeRawUnsafe is required since schema names cannot be parameterized securely in standard SQL.
    // We sanitize it heavily by enforcing the tenant_XXX format.
    const sanitizedSchemaName = schemaName.replace(/[^a-zA-Z0-9_]/g, '');
    
    await globalPrisma.$executeRawUnsafe(`CREATE SCHEMA "${sanitizedSchemaName}";`);

    return org;
  } catch (err) {
    // Rollback organization creation if schema provisioning fails
    await globalPrisma.organization.delete({ where: { id: org.id } }).catch(() => {});
    throw new Error('Failed to provision tenant schema', { cause: err });
  }
}
