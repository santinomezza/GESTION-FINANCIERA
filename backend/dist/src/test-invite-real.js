"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_1 = require("./common/prisma/prisma.service");
const invitations_service_1 = require("./invitations/invitations.service");
async function main() {
    const prisma = new prisma_service_1.PrismaService();
    const service = new invitations_service_1.InvitationsService(prisma);
    console.log('--- START REAL INVITATION SERVICE TEST ---');
    const code = "388B5D06534E883905927627573164FC";
    const ownerId = "cmr2pl3us0000djobw5f77bx7";
    const otherId = "cmrl2jprx0006mhf6yr30ykrh";
    console.log('\nTesting with OWNER user ID...');
    try {
        const res = await service.useInvitation(code, ownerId);
        console.log('Result for OWNER:', res);
    }
    catch (error) {
        console.error('Failed for OWNER:', error);
    }
    const testUserEmail = `testuser_${Date.now()}@example.com`;
    console.log(`\nCreating temporary test user: ${testUserEmail}`);
    const tempUser = await prisma.user.create({
        data: {
            email: testUserEmail,
            name: 'Temp Test User',
            passwordHash: 'dummy',
        }
    });
    console.log('Testing with NEW user ID:', tempUser.id);
    try {
        const res = await service.useInvitation(code, tempUser.id);
        console.log('Result for NEW user:', res);
        const member = await prisma.workspaceMember.findFirst({
            where: { workspaceId: res.workspaceId, userId: tempUser.id }
        });
        console.log('Verification - Created Member Record:', member);
        await prisma.workspaceMember.delete({ where: { id: member.id } });
        console.log('Cleanup - Member record deleted');
    }
    catch (error) {
        console.error('Failed for NEW user:', error);
    }
    finally {
        await prisma.user.delete({ where: { id: tempUser.id } });
        console.log('Cleanup - Temp user deleted');
    }
    console.log('\n--- END REAL INVITATION SERVICE TEST ---');
}
main()
    .catch(console.error);
//# sourceMappingURL=test-invite-real.js.map