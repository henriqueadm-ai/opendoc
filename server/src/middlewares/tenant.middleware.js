import { PrismaClient } from '@prisma/client';

/**
 * Cache de PrismaClients por tenant schema para evitar recriação a cada request.
 * Em produção, substituir por pool manager com limite de conexões.
 */
const tenantClients = new Map();

/**
 * Cria ou reutiliza um PrismaClient configurado para o schema do tenant.
 * 
 * @param {string} schemaName ex: "tenant_001"
 * @returns {PrismaClient}
 */
function getTenantPrisma(schemaName) {
  if (tenantClients.has(schemaName)) {
    return tenantClients.get(schemaName);
  }

  const baseUrl = process.env.DATABASE_URL || 'postgresql://opendoc:opendoc@localhost:5432/opendoc';
  // Append schema search_path
  const url = baseUrl.includes('?')
    ? `${baseUrl}&search_path=${schemaName}`
    : `${baseUrl}?search_path=${schemaName}`;

  const client = new PrismaClient({ datasourceUrl: url });
  tenantClients.set(schemaName, client);
  return client;
}

/**
 * Middleware que resolve o tenant a partir do JWT e injeta req.tenantPrisma.
 * Deve ser usado APÓS requireAuth (precisa de req.user com org_id).
 */
export function tenantResolver(req, res, next) {
  if (!req.user || !req.user.org_id) {
    return res.status(401).json({ error: 'Tenant context missing from token' });
  }

  // O schema name segue o padrão tenant_XXX (com zero-padding de 3 dígitos)
  const schema = req.user.schema || `tenant_${String(req.user.org_id).padStart(3, '0')}`;
  
  req.tenantSchema = schema;
  req.tenantPrisma = getTenantPrisma(schema);
  
  next();
}

/**
 * Cleanup: fecha todos os PrismaClients de tenants ativos.
 * Chamar ao desligar o server gracefully.
 */
export async function disconnectAllTenants() {
  for (const [schema, client] of tenantClients) {
    await client.$disconnect();
  }
  tenantClients.clear();
}
