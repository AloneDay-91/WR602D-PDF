/**
 * Returns true if the user has access to the given tool based on its minPlan.
 * Mirrors the Symfony role hierarchy: ROLE_PREMIUM > ROLE_BASIC > ROLE_USER
 */
export function hasToolAccess(user, tool) {
    const plan = tool.minPlan?.name;
    if (!plan || plan === 'FREE') return true;
    if (plan === 'BASIC') return user?.isBasic ?? false;
    if (plan === 'PREMIUM') return user?.isPremium ?? false;
    return false;
}