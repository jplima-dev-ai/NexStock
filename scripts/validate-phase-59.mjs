import { readFileSync } from "node:fs"; import { join } from "node:path";
const root=process.cwd(); const service=readFileSync(join(root,"js/services/audit-service.js"),"utf8"); const view=readFileSync(join(root,"js/views/audit-view.js"),"utf8");
for(const value of ["createAuditTimeline","describeAudit","workspaceId","aria-live","timeline"]) if(!(service+view).includes(value)) throw new Error(`Audit Explorer incompleto: ${value}`);
process.stdout.write("Fase 59: histórico em timeline compreensível aprovado.\n");
