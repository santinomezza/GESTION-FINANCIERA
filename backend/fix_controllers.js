const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/santi/Documentos/GESTIONAR2/backend/src';

// Controllers that need RolesGuard added to @UseGuards AND imports added
const controllersToFix = [
  // File path, relative import prefix for guards
  ['categories/categories.controller.ts', '../common/guards'],
  ['clients/clients.controller.ts', '../common/guards'],
  ['goals/goals.controller.ts', '../common/guards'],
  ['recurring-transactions/recurring-transactions.controller.ts', '../common/guards'],
  ['category-limits/category-limits.controller.ts', '../common/guards'],
  ['exchange-rates/exchange-rates.controller.ts', '../common/guards'],
  ['ai-recommendations/ai-recommendations.controller.ts', '../common/guards'],
  ['notifications/notifications.controller.ts', '../common/guards'],
  ['invoices-ar/invoices-ar.controller.ts', '../common/guards'],
  ['invoices.controller.ts', './common/guards'],
  ['reports/reports.controller.ts', '../common/guards'],
  ['dashboard/dashboard.controller.ts', '../common/guards'],
];

controllersToFix.forEach(([file, guardPath]) => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping (not found):', file);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add RolesGuard import if missing
  if (!content.includes('RolesGuard')) {
    content = content.replace(
      /import \{ WorkspaceGuard \} from '([^']+)';/,
      `import { WorkspaceGuard } from '$1';\nimport { RolesGuard } from '${guardPath}/roles.guard';`
    );
  }

  // 2. Add Roles decorator import if missing
  if (!content.includes("from '") || !content.includes('Roles }')) {
    if (!content.includes("import { Roles }")) {
      // Check if @Roles is used
      if (content.includes('@Roles(')) {
        content = content.replace(
          /import \{ WorkspaceGuard \} from '([^']+)';/,
          `import { WorkspaceGuard } from '$1';\nimport { Roles } from '${guardPath.replace(/\/guards$/, '/decorators')}/roles.decorator';`
        );
      }
    }
  }

  // 3. Add WorkspaceMemberRole import if missing
  if (content.includes('@Roles(WorkspaceMemberRole') && !content.includes("import { WorkspaceMemberRole }") && !content.includes("WorkspaceMemberRole }")) {
    // Check if @prisma/client is already imported
    if (content.includes("from '@prisma/client'")) {
      // Add WorkspaceMemberRole to existing import
      if (!content.includes('WorkspaceMemberRole')) {
        content = content.replace(
          /import \{([^}]+)\} from '@prisma\/client'/,
          (match, imports) => `import {${imports}, WorkspaceMemberRole } from '@prisma/client'`
        );
      }
    } else {
      // Add new import
      const lastImportIdx = content.lastIndexOf("import ");
      const endOfLastImport = content.indexOf(';', lastImportIdx) + 1;
      content = content.slice(0, endOfLastImport) + "\nimport { WorkspaceMemberRole } from '@prisma/client';" + content.slice(endOfLastImport);
    }
  }

  // 4. Add RolesGuard to @UseGuards if missing
  // Match @UseGuards(...) and add RolesGuard if not present
  content = content.replace(/@UseGuards\(([^)]+)\)/g, (match, guards) => {
    if (guards.includes('RolesGuard')) return match;
    return `@UseGuards(${guards}, RolesGuard)`;
  });

  fs.writeFileSync(filePath, content);
  console.log('Fixed:', file);
});

console.log('\nDone!');
