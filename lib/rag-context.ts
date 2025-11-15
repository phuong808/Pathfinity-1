/**
 * RAG Context Builder
 * Builds rich context from the database for the chatbot using semantic search
 */

import { semanticSearch } from './semantic-search';
import { db } from '@/app/db/index';
import { 
  course, 
  degreeProgram,
  degreePathway,
  campus,
  degree,
  majorCareerMapping,
  careerPathway
} from '@/app/db/schema';
import { eq, like, or, and, inArray } from 'drizzle-orm';

interface RagContext {
  relevantCourses: Array<{
    code: string;
    title: string;
    description: string;
    campus: string;
    credits: string;
  }>;
  relevantPrograms: Array<{
    programName: string;
    majorTitle: string;
    degreeCode: string;
    campus: string;
    totalCredits: number | null;
  }>;
  relevantPathways: Array<{
    programName: string;
    semesterCount: number;
    totalCredits: number | null;
  }>;
  relevantMajorCareers: Array<{
    majorName: string;
    degreeType: string;
    credits: string;
    careerPathways: string[];
  }>;
  contextSummary: string;
}

/**
 * Build comprehensive context from user query for RAG
 */
export async function buildRagContext(
  userQuery: string,
  options: {
    includeCourses?: boolean;
    includePrograms?: boolean;
    limit?: number;
  } = {}
): Promise<RagContext> {
  const {
    includeCourses = true,
    includePrograms = true,
    limit = 5,
  } = options;

  const context: RagContext = {
    relevantCourses: [],
    relevantPrograms: [],
    relevantPathways: [],
    relevantMajorCareers: [],
    contextSummary: '',
  };

  try {
    // Use semantic search to find relevant information
    const searchResults = await semanticSearch(userQuery, limit * 2, 0.3);

    // Process search results
    for (const result of searchResults) {
      // Course-related results (when coursePrefix and courseNumber are present)
      if (result.coursePrefix && result.courseNumber && includeCourses && context.relevantCourses.length < limit) {
        context.relevantCourses.push({
          code: `${result.coursePrefix} ${result.courseNumber}`,
          title: result.courseTitle || 'Untitled',
          description: result.courseDesc || '',
          campus: result.campusName || '',
          credits: result.numUnits || 'N/A',
        });
      }

      // Major-Career results (when refId starts with 'major-' or 'career-')
      if (result.content && context.relevantMajorCareers.length < limit) {
        const metadata = result.content as Record<string, unknown>;
        
        // Check if it's a major result
        if (metadata?.majorId && metadata?.majorName) {
          const majorId = metadata.majorId as number;
          
          // Fetch major details with career pathways
          const [majorDetails] = await db
            .select()
            .from(majorCareerMapping)
            .where(eq(majorCareerMapping.id, majorId))
            .limit(1);

          if (majorDetails && majorDetails.careerPathwayIds && majorDetails.careerPathwayIds.length > 0) {
            // Get career pathway titles
            const careers = await db
              .select({ title: careerPathway.title })
              .from(careerPathway)
              .where(inArray(careerPathway.id, majorDetails.careerPathwayIds));

            context.relevantMajorCareers.push({
              majorName: majorDetails.majorName,
              degreeType: majorDetails.degreeType,
              credits: majorDetails.credits || 'N/A',
              careerPathways: careers.map(c => c.title),
            });
          }
        }
        
        // Check if it's a career result - find related majors
        if (metadata?.careerId && metadata?.careerTitle) {
          // Find majors that lead to this career
          const majorsWithCareer = await db
            .select()
            .from(majorCareerMapping)
            .where(
              eq(majorCareerMapping.campusId, 'uh-manoa')
            )
            .limit(20);

          // Filter majors that include this career
          const careerId = metadata.careerId as number;
          for (const major of majorsWithCareer) {
            if (major.careerPathwayIds?.includes(careerId) && context.relevantMajorCareers.length < limit) {
              const careers = await db
                .select({ title: careerPathway.title })
                .from(careerPathway)
                .where(inArray(careerPathway.id, major.careerPathwayIds || []));

              context.relevantMajorCareers.push({
                majorName: major.majorName,
                degreeType: major.degreeType,
                credits: major.credits || 'N/A',
                careerPathways: careers.map(c => c.title),
              });
            }
          }
        }
      }

      // Program-related results from metadata
      if (result.content && includePrograms) {
        const metadata = result.content as Record<string, unknown>;
        if (metadata?.programId && context.relevantPrograms.length < limit) {
          // Fetch program details
          const programId = metadata.programId as number;
          const [programDetails] = await db
            .select({
              programName: degreeProgram.programName,
              majorTitle: degreeProgram.majorTitle,
              totalCredits: degreeProgram.totalCredits,
              degreeCode: degree.code,
              campusName: campus.name,
            })
            .from(degreeProgram)
            .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
            .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
            .where(eq(degreeProgram.id, programId))
            .limit(1);

          if (programDetails) {
            context.relevantPrograms.push({
              programName: programDetails.programName,
              majorTitle: programDetails.majorTitle || '',
              degreeCode: programDetails.degreeCode || '',
              campus: programDetails.campusName || '',
              totalCredits: programDetails.totalCredits,
            });
          }
        }
      }
    }

    // Build context summary with richer information
    const summaryParts: string[] = [];

    if (context.relevantCourses.length > 0) {
      summaryParts.push(
        `📚 RELEVANT COURSES (${context.relevantCourses.length} found via semantic search):\n` +
        context.relevantCourses
          .map(c => `  • ${c.code}: ${c.title}\n    ${c.credits} credits @ ${c.campus}\n    ${c.description.substring(0, 150)}${c.description.length > 150 ? '...' : ''}`)
          .join('\n\n')
      );
    }

    if (context.relevantPrograms.length > 0) {
      summaryParts.push(
        `🎓 RELEVANT DEGREE PROGRAMS (${context.relevantPrograms.length} found via semantic search):\n` +
        context.relevantPrograms
          .map(p => {
            const credits = p.totalCredits ? ` - ${p.totalCredits} total credits` : '';
            return `  • ${p.majorTitle} (${p.degreeCode})${credits}\n    Campus: ${p.campus}`;
          })
          .join('\n\n')
      );
    }

    if (context.relevantMajorCareers.length > 0) {
      summaryParts.push(
        `💼 RELEVANT MAJORS & CAREER PATHWAYS (${context.relevantMajorCareers.length} found via semantic search):\n` +
        context.relevantMajorCareers
          .map(mc => {
            const careerList = mc.careerPathways.length > 5 
              ? mc.careerPathways.slice(0, 5).join(', ') + `, and ${mc.careerPathways.length - 5} more`
              : mc.careerPathways.join(', ');
            return `  • ${mc.majorName} (${mc.degreeType}) - ${mc.credits} credits\n    Career Pathways: ${careerList}`;
          })
          .join('\n\n')
      );
    }

    if (summaryParts.length > 0) {
      context.contextSummary = 
        `\n=== SEMANTIC SEARCH RESULTS FROM DATABASE ===\n` +
        `The following information was found by searching ${context.relevantCourses.length + context.relevantPrograms.length + context.relevantMajorCareers.length} embeddings:\n\n` +
        summaryParts.join('\n\n') +
        `\n\n⚠️  IMPORTANT: These are CONFIRMED to exist in the database. Use tools to get complete details.`;
    }

  } catch (error) {
    console.error('Error building RAG context:', error);
    // Return empty context on error
  }

  return context;
}

/**
 * Get detailed course information with prerequisites
 */
export async function getCourseContext(courseCode: string, campusId?: string) {
  const match = courseCode.trim().match(/^([A-Z]+)\s*(\d+[A-Z]*)$/i);
  if (!match) return null;

  const [, prefix, number] = match;

  const conditions = [
    eq(course.coursePrefix, prefix.toUpperCase()),
    eq(course.courseNumber, number.toUpperCase()),
  ];

  if (campusId) {
    conditions.push(eq(course.campusId, campusId));
  }

  const [result] = await db
    .select({
      id: course.id,
      prefix: course.coursePrefix,
      number: course.courseNumber,
      title: course.courseTitle,
      description: course.courseDesc,
      credits: course.numUnits,
      department: course.deptName,
      metadata: course.metadata,
      campusName: campus.name,
    })
    .from(course)
    .leftJoin(campus, eq(course.campusId, campus.id))
    .where(and(...conditions))
    .limit(1);

  return result;
}

/**
 * Get degree program with pathway summary
 */
export async function getProgramContext(programId: number) {
  const [program] = await db
    .select({
      id: degreeProgram.id,
      programName: degreeProgram.programName,
      majorTitle: degreeProgram.majorTitle,
      track: degreeProgram.track,
      totalCredits: degreeProgram.totalCredits,
      typicalDuration: degreeProgram.typicalDurationYears,
      description: degreeProgram.description,
      degreeCode: degree.code,
      degreeName: degree.name,
      degreeLevel: degree.level,
      campusName: campus.name,
    })
    .from(degreeProgram)
    .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
    .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
    .where(eq(degreeProgram.id, programId))
    .limit(1);

  if (!program) return null;

  // Get pathway summary
  const pathways = await db
    .select({
      yearNumber: degreePathway.yearNumber,
      semesterName: degreePathway.semesterName,
      semesterCredits: degreePathway.semesterCredits,
    })
    .from(degreePathway)
    .where(eq(degreePathway.degreeProgramId, programId))
    .orderBy(degreePathway.sequenceOrder);

  return {
    ...program,
    semesterCount: pathways.length,
    pathwayYears: pathways.length > 0 ? Math.max(...pathways.map(p => p.yearNumber)) : 0,
  };
}

/**
 * Search for related courses by keywords
 */
export async function findRelatedCourses(
  keywords: string[],
  campusId?: string,
  limit: number = 10
) {
  const searchConditions = keywords.map(keyword => 
    or(
      like(course.courseTitle, `%${keyword}%`),
      like(course.courseDesc, `%${keyword}%`),
      like(course.coursePrefix, `%${keyword}%`)
    )
  );

  const conditions = [or(...searchConditions)];
  if (campusId) {
    conditions.push(eq(course.campusId, campusId));
  }

  const results = await db
    .select({
      prefix: course.coursePrefix,
      number: course.courseNumber,
      title: course.courseTitle,
      description: course.courseDesc,
      credits: course.numUnits,
      campusName: campus.name,
    })
    .from(course)
    .leftJoin(campus, eq(course.campusId, campus.id))
    .where(and(...conditions))
    .limit(limit);

  return results;
}

/**
 * Get comprehensive context for answering complex queries
 */
export async function getComprehensiveContext(userQuery: string) {
  const context = await buildRagContext(userQuery, {
    includeCourses: true,
    includePrograms: true,
    limit: 8,
  });

  // Extract keywords for additional searches
  const keywords = userQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['what', 'when', 'where', 'which', 'about', 'tell', 'show'].includes(word));

  // If we have specific subject keywords, do additional course search
  if (keywords.length > 0 && context.relevantCourses.length < 5) {
    const additionalCourses = await findRelatedCourses(keywords.slice(0, 3), undefined, 5);
    for (const c of additionalCourses) {
      if (context.relevantCourses.length >= 8) break;
      const alreadyAdded = context.relevantCourses.some(
        existing => existing.code === `${c.prefix} ${c.number}`
      );
      if (!alreadyAdded) {
        context.relevantCourses.push({
          code: `${c.prefix} ${c.number}`,
          title: c.title || 'Untitled',
          description: c.description || '',
          campus: c.campusName || '',
          credits: c.credits || 'N/A',
        });
      }
    }
  }

  return context;
}

/**
 * Get major-career pathway information
 */
export async function getMajorCareerContext(majorName: string, campusId: string = 'uh-manoa') {
  const [major] = await db
    .select()
    .from(majorCareerMapping)
    .where(
      and(
        eq(majorCareerMapping.campusId, campusId),
        eq(majorCareerMapping.majorName, majorName)
      )
    )
    .limit(1);

  if (!major || !major.careerPathwayIds || major.careerPathwayIds.length === 0) {
    return null;
  }

  const careers = await db
    .select()
    .from(careerPathway)
    .where(inArray(careerPathway.id, major.careerPathwayIds));

  return {
    major: {
      name: major.majorName,
      degreeType: major.degreeType,
      credits: major.credits,
    },
    careers: careers.map(c => ({
      title: c.title,
      category: c.category,
      description: c.description,
    })),
  };
}

/**
 * Find majors that lead to a specific career
 */
export async function findMajorsForCareer(careerTitle: string, campusId: string = 'uh-manoa') {
  // Find the career pathway
  const [career] = await db
    .select()
    .from(careerPathway)
    .where(eq(careerPathway.normalizedTitle, careerTitle.toLowerCase().trim()))
    .limit(1);

  if (!career) {
    return [];
  }

  // Find all majors that include this career
  const allMajors = await db
    .select()
    .from(majorCareerMapping)
    .where(eq(majorCareerMapping.campusId, campusId));

  const matchingMajors = allMajors.filter(major => 
    major.careerPathwayIds?.includes(career.id)
  );

  return matchingMajors.map(m => ({
    majorName: m.majorName,
    degreeType: m.degreeType,
    credits: m.credits,
  }));
}
