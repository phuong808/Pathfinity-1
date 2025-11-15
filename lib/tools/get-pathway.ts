import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { 
    degreeProgram as dp, 
    degreePathway as dpath,
    pathwayCourse as pc,
    course as c,
    campus as cam,
    degree as d
} from '@/app/db/schema';
import { sql, eq, and, inArray } from 'drizzle-orm';

async function tablesReady(): Promise<boolean> {
    try {
        const res = await db.execute(sql`
            SELECT 
                to_regclass('public.degree_programs') AS degree_programs,
                to_regclass('public.degree_pathways') AS degree_pathways,
                to_regclass('public.pathway_courses') AS pathway_courses
        `);
        const rows = (res as { rows?: unknown[] }).rows || (Array.isArray(res) ? res : []);
        const first = rows[0] as Record<string, unknown> | undefined;
        return !!(first?.degree_programs && first?.degree_pathways && first?.pathway_courses);
    } catch {
        return false;
    }
}

export const getPathway = tool({
    description: "Get the complete semester-by-semester academic pathway for a degree program. Shows all courses required for each semester organized by year. Use when users want to see a roadmap, plan, or full course sequence for a specific degree program.",
    inputSchema: z.object({
        programId: z.number().optional().describe("The degree program ID from getDegreeProgram results"),
        majorName: z.string().optional().describe("Major name if programId not available"),
        campusId: z.string().optional().describe("Campus ID to help find the program"),
    }),
    execute: async ({ programId, majorName, campusId }) => {
        try {
            const ready = await tablesReady();
            if (!ready) {
                return {
                    found: false,
                    message: 'Pathway information is not available yet. I can still help create a general academic plan based on typical requirements.',
                };
            }

            let targetProgramId = programId;

            // If no programId provided, try to find it by major name and campus
            if (!targetProgramId && majorName) {
                const conditions = [sql`${dp.majorTitle} ILIKE ${`%${majorName}%`}`];
                if (campusId) {
                    conditions.push(eq(dp.campusId, campusId));
                }

                const [program] = await db
                    .select({ id: dp.id })
                    .from(dp)
                    .where(and(...conditions))
                    .limit(1);

                if (!program) {
                    return {
                        found: false,
                        message: `Could not find a degree program for "${majorName}"${campusId ? ` at the specified campus` : ''}. Please use getDegreeProgram first to find the exact program.`,
                    };
                }

                targetProgramId = program.id;
            }

            if (!targetProgramId) {
                return {
                    found: false,
                    message: 'Please provide either a programId or majorName to retrieve the pathway.',
                };
            }

            // Get program details
            const [programInfo] = await db
                .select({
                    programName: dp.programName,
                    majorTitle: dp.majorTitle,
                    track: dp.track,
                    totalCredits: dp.totalCredits,
                    campusName: cam.name,
                    degreeCode: d.code,
                })
                .from(dp)
                .leftJoin(cam, eq(dp.campusId, cam.id))
                .leftJoin(d, eq(dp.degreeId, d.id))
                .where(eq(dp.id, targetProgramId))
                .limit(1);

            if (!programInfo) {
                return {
                    found: false,
                    message: 'Could not find the specified degree program.',
                };
            }

            // Get all pathway semesters ordered by sequence
            const pathways = await db
                .select()
                .from(dpath)
                .where(eq(dpath.degreeProgramId, targetProgramId))
                .orderBy(dpath.sequenceOrder);

            if (!pathways.length) {
                return {
                    found: false,
                    message: `No pathway data available for ${programInfo.majorTitle}. The program exists but doesn't have a structured semester plan yet.`,
                };
            }

            // Get all courses for these pathways
            const pathwayIds = pathways.map(p => p.id);
            const pathwayCourses = await db
                .select({
                    pathwayId: pc.pathwayId,
                    courseName: pc.courseName,
                    credits: pc.credits,
                    category: pc.category,
                    isElective: pc.isElective,
                    isGenEd: pc.isGenEd,
                    notes: pc.notes,
                    sequenceOrder: pc.sequenceOrder,
                    coursePrefix: c.coursePrefix,
                    courseNumber: c.courseNumber,
                    courseTitle: c.courseTitle,
                })
                .from(pc)
                .leftJoin(c, eq(pc.courseId, c.id))
                .where(inArray(pc.pathwayId, pathwayIds))
                .orderBy(pc.pathwayId, pc.sequenceOrder);

            // Group courses by pathway
            const coursesByPathway = new Map<number, typeof pathwayCourses>();
            for (const course of pathwayCourses) {
                if (!coursesByPathway.has(course.pathwayId)) {
                    coursesByPathway.set(course.pathwayId, []);
                }
                coursesByPathway.get(course.pathwayId)!.push(course);
            }

            // Format the pathway output
            const lines = [
                `**${programInfo.majorTitle}** ${programInfo.track ? `(${programInfo.track})` : ''}`,
                `${programInfo.degreeCode || 'Degree'} • ${programInfo.campusName}`,
                `Total Credits: ${programInfo.totalCredits || 'N/A'}`,
                '',
                '**Semester-by-Semester Plan:**',
                '',
            ];

            let currentYear = 0;
            for (const pathway of pathways) {
                if (pathway.yearNumber !== currentYear) {
                    currentYear = pathway.yearNumber;
                    lines.push(`**Year ${currentYear}**`);
                    lines.push('');
                }

                const semesterName = pathway.semesterName
                    .replace('_semester', '')
                    .replace(/\b\w/g, l => l.toUpperCase());
                
                lines.push(`**${semesterName}** (${pathway.semesterCredits || 0} credits)`);

                const courses = coursesByPathway.get(pathway.id) || [];
                courses.forEach((course, idx) => {
                    const courseName = course.courseTitle 
                        ? `${course.coursePrefix} ${course.courseNumber} - ${course.courseTitle}`
                        : course.courseName;
                    
                    let line = `  ${idx + 1}. ${courseName} (${course.credits} cr)`;
                    
                    if (course.category) {
                        line += ` [${course.category}]`;
                    }
                    if (course.isElective) {
                        line += ` *Elective*`;
                    }
                    if (course.notes) {
                        line += `\n     Note: ${course.notes}`;
                    }
                    
                    lines.push(line);
                });

                lines.push('');
            }

            return {
                found: true,
                programId: targetProgramId,
                pathwayData: {
                    program_name: programInfo.programName,
                    major_title: programInfo.majorTitle,
                    institution: programInfo.campusName,
                    total_credits: programInfo.totalCredits,
                    pathways: pathways.map(p => ({
                        year: p.yearNumber,
                        semester: p.semesterName,
                        credits: p.semesterCredits,
                        courses: coursesByPathway.get(p.id) || [],
                    })),
                },
                formatted: lines.join('\n'),
            };
        } catch (error) {
            console.error('getPathway error:', error);
            return {
                found: false,
                error: true,
                message: 'I\'m having trouble retrieving the pathway right now. Please try again.',
            };
        }
    }
});
