import { PrismaClient } from '@prisma/client';

const globalPrisma = new PrismaClient();

/**
 * Marks the organization's onboarding flow as completed.
 * 
 * @param {number} orgId - The ID of the primary Organization
 * @returns {Promise<object>} The updated organization object
 * @throws {Error} If the organization cannot be found
 */
export async function completeOnboarding(orgId) {
  const org = await globalPrisma.organization.findUnique({
    where: { id: orgId }
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  const updatedOrg = await globalPrisma.organization.update({
    where: { id: orgId },
    data: {
      onboarding_completed: true
    }
  });

  return updatedOrg;
}
