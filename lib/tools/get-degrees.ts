import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { degree as d } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export const getDegrees = tool({
    description: "List all degree types (B.S., M.A., Ph.D., etc.). Use when asked about degree TYPES, not specific majors.",
    inputSchema: z.object({
        level: z.string().optional().describe("Filter: 'baccalaureate', 'associate', 'graduate', 'doctorate', 'certificate'"),
    }),
    execute: async ({ level }) => {
        try {
            let query = db.select({
                code: d.code,
                name: d.name,
                level: d.level,
            }).from(d).orderBy(d.level, d.code);

            if (level) {
                query = query.where(eq(d.level, level)) as any;
            }

            const degrees = await query;
            if (!degrees?.length) return level ? `No ${level} degrees found.` : 'No degrees found.';

            const byLevel = degrees.reduce((acc, deg) => {
                const lvl = deg.level || 'Other';
                if (!acc[lvl]) acc[lvl] = [];
                acc[lvl].push(deg);
                return acc;
            }, {} as Record<string, typeof degrees>);

            const lines = [`**${degrees.length} Degree Types:**\n`];
            Object.entries(byLevel).forEach(([lvl, degs]) => {
                lines.push(`**${lvl.toUpperCase()}:**`);
                degs.forEach(d => lines.push(`  • ${d.code}${d.name ? ` - ${d.name}` : ''}`));
                lines.push('');
            });

            return lines.join('\n');
        } catch (error) {
            console.error('getDegrees error:', error);
            return 'Having trouble loading degrees. Try again?';
        }
    }
});
