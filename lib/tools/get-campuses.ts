import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { campus as cam } from '@/app/db/schema';

export const getCampuses = tool({
    description: "List all UH system campuses. Use when asked 'what campuses' or 'list universities'.",
    inputSchema: z.object({}),
    execute: async () => {
        try {
            const campuses = await db
                .select({
                    name: cam.name,
                    type: cam.type,
                })
                .from(cam)
                .orderBy(cam.type, cam.name);

            if (!campuses?.length) return 'No campuses found.';

            const unis = campuses.filter(c => c.type === 'university');
            const ccs = campuses.filter(c => c.type === 'community_college');
            const other = campuses.filter(c => c.type !== 'university' && c.type !== 'community_college');

            const lines = [`**${campuses.length} UH System Campuses:**\n`];
            
            if (unis.length) {
                lines.push('🎓 **Universities:**');
                unis.forEach(c => lines.push(`  • ${c.name}`));
                lines.push('');
            }
            
            if (ccs.length) {
                lines.push('🏫 **Community Colleges:**');
                ccs.forEach(c => lines.push(`  • ${c.name}`));
                lines.push('');
            }
            
            if (other.length) {
                lines.push('**Other:**');
                other.forEach(c => lines.push(`  • ${c.name}`));
            }

            return lines.join('\n');
        } catch (error) {
            console.error('getCampuses error:', error);
            return 'Having trouble loading campuses. Try again?';
        }
    }
});
