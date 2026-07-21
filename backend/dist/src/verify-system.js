"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
(async () => {
    const prisma = new client_1.PrismaClient();
    try {
        console.log('=== Workspaces ===');
        const workspaces = await prisma.workspace.findMany();
        console.log(workspaces);
        console.log('=== Workspace Members ===');
        const members = await prisma.workspaceMember.findMany({ take: 5 });
        console.log(members);
        console.log('=== Categories ===');
        const categories = await prisma.category.findMany({ take: 5 });
        console.log(categories);
    }
    catch (e) {
        console.error('Verification error:', e);
    }
    finally {
        await prisma.$disconnect();
    }
})();
//# sourceMappingURL=verify-system.js.map