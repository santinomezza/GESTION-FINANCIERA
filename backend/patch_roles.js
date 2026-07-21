const fs = require('fs');
const path = require('path');

const controllers = [
  'transactions/transactions.controller.ts',
  'categories/categories.controller.ts',
  'clients/clients.controller.ts',
  'invoices.controller.ts',
  'invoices-ar/invoices-ar.controller.ts',
  'goals/goals.controller.ts',
  'recurring-transactions/recurring-transactions.controller.ts',
  'category-limits/category-limits.controller.ts',
  'dashboard/dashboard.controller.ts',
  'ai-recommendations/ai-recommendations.controller.ts',
  'reports/reports.controller.ts'
];

controllers.forEach(file => {
  const filePath = path.join('C:/Users/santi/Documentos/GESTIONAR2/backend/src', file);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping', filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure WorkspaceGuard and RolesGuard are imported
  if (!content.includes('WorkspaceGuard')) {
    content = content.replace(/import \{.*\} from '.*jwt-auth.guard';?/, match => 
      match + '\nimport { WorkspaceGuard } from \'../common/guards/workspace.guard\';\nimport { RolesGuard } from \'../common/guards/roles.guard\';\nimport { Roles } from \'../common/decorators/roles.decorator\';\nimport { WorkspaceMemberRole } from \'@prisma/client\';'
    );
  }

  // Update controller UseGuards
  content = content.replace(/@UseGuards\(JwtAuthGuard\)/, '@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)');
  
  // Add @Roles(WorkspaceMemberRole.ADMIN) to POST, PATCH, PUT, DELETE
  // Using a regex to find methods
  content = content.replace(/@(Post|Patch|Put|Delete)\([^)]*\)\s*(?:@[A-Za-z0-9_({:,\s'"})]*)?\s*(?:async\s+)?[a-zA-Z0-9_]+\s*\(/g, match => {
    if (match.includes('@Roles')) return match;
    return '@Roles(WorkspaceMemberRole.ADMIN)\n  ' + match;
  });

  fs.writeFileSync(filePath, content);
  console.log('Updated', file);
});
