// run with: npx tsx scripts/seed/seed-campuses.ts

import dotenv from 'dotenv';
import { db } from '../../app/db/index';
import { campus } from '../../app/db/schema';

dotenv.config();

const campuses = [
  {
    id: 'kapiolani_cc',
    name: "Kapiʻolani Community College",
    instIpeds: '141796',
    description: "Community college in Honolulu offering associate degrees and certificates in health sciences, business, hospitality, and STEM. Known for Culinary Institute of the Pacific and workforce training programs.",
    aliases: ['Kapiolani', 'Kapiolani CC', 'KCC'],
    type: 'community_college',
    website: "https://www.kapiolani.hawaii.edu/",
    metadata: {
      island: "Oʻahu",
      city: "Honolulu",
      address: "4303 Diamond Head Rd, Honolulu, HI 96816",
      established: 1946,
    },
  },
  {
    id: 'uh_manoa',
    name: "University of Hawaiʻi at Mānoa",
    instIpeds: '141574',
    description: "Flagship research university in Honolulu offering undergraduate, graduate and professional degrees. Strong programs in earth sciences, tropical agriculture, astronomy, and Asian-Pacific studies.",
    aliases: ['UH Mānoa', 'UH Manoa', 'University of Hawaiʻi at Mānoa'],
    type: 'university',
    website: "https://manoa.hawaii.edu/",
    metadata: {
      island: "Oʻahu",
      city: "Honolulu",
      address: "2500 Campus Rd, Honolulu, HI 96822",
      established: 1907,
    },
  },
  {
    id: 'uh_maui',
    name: "University of Hawaiʻi Maui College",
    instIpeds: '141839',
    description: "Maui-based college offering associate and bachelor's degrees in applied business, sustainable science, hospitality and technology. Provides workforce training and community education programs.",
    aliases: ['Maui College', 'UH Maui', 'UHMC'],
    type: 'community_college',
    website: "https://maui.hawaii.edu/",
    metadata: {
      island: "Maui",
      city: "Kahului",
      address: "310 W Kaʻahumanu Ave, Kahului, HI 96732",
      established: 1931,
    },
  },
  {
    id: 'leeward_cc',
    name: "Leeward Community College",
    instIpeds: '141811',
    description: "Two-year college in Pearl City offering associate degrees and certificates in liberal arts, IT, and teacher education. Provides transfer pathways to UH Mānoa and UH West Oʻahu.",
    aliases: ['Leeward CC', 'Leeward'],
    type: 'community_college',
    website: "https://www.leeward.hawaii.edu/",
    metadata: {
      island: "Oʻahu",
      city: "Pearl City",
      address: "96-045 Ala Ike, Pearl City, HI 96782",
      established: 1968,
    },
  },
  {
    id: 'uh_hilo',
    name: "University of Hawaiʻi at Hilo",
    instIpeds: '141565',
    description: "University on Hawaiʻi Island offering undergraduate and graduate programs. Known for experiential learning, environmental studies, marine science, and Hawaiian language programs.",
    aliases: ['UH Hilo', 'Hilo'],
    type: 'university',
    website: "https://hilo.hawaii.edu/",
    metadata: {
      island: "Hawaiʻi",
      city: "Hilo",
      address: "200 W Kāwili St, Hilo, HI 96720",
      established: 1947,
    },
  },
  {
    id: 'honolulu_cc',
    name: "Honolulu Community College",
    instIpeds: '141680',
    description: "Technical and career-focused community college in Honolulu. Programs include aeronautics, computing, architecture, and automotive technology.",
    aliases: ['Honolulu CC', 'HCC'],
    type: 'community_college',
    website: "https://www.honolulu.hawaii.edu/",
    metadata: {
      island: "Oʻahu",
      city: "Honolulu",
      address: "874 Dillingham Blvd, Honolulu, HI 96817",
      established: 1920,
    },
  },
  {
    id: 'hawaii_cc',
    name: "Hawaiʻi Community College",
    instIpeds: '383190',
    description: "Community college on Hawaiʻi Island with campuses in Hilo and Pālamanui. Offers associate degrees and certificates with focus on community partnerships and sustainability.",
    aliases: ['Hawaiʻi CC', 'Hawaii CC', 'HawCC'],
    type: 'community_college',
    website: "https://hawaii.hawaii.edu/",
    metadata: {
      island: "Hawaiʻi",
      city: "Hilo",
      address: "1175 Manono St, Hilo, HI 96720",
      established: 1941,
    },
  },
  {
    id: 'kauai_cc',
    name: "Kauaʻi Community College",
    instIpeds: '141802',
    description: "Community college on Kauaʻi offering associate degrees and certificates in business, hospitality, technology and liberal arts. Supports local workforce and sustainability efforts.",
    aliases: ['Kauai CC', 'Kauaʻi CC'],
    type: 'community_college',
    website: "https://www.kauai.hawaii.edu/",
    metadata: {
      island: "Kauaʻi",
      city: "Līhuʻe",
      address: "3-2656 Kaumualiʻi Hwy, Līhuʻe, HI 96766",
      established: 1965,
    },
  },
  {
    id: 'uh_west_oahu',
    name: "University of Hawaiʻi – West Oʻahu",
    instIpeds: '141981',
    description: "Four-year university in Kapolei offering applied-learning bachelor's programs in business, creative media, education and social sciences. Serves west Oʻahu and neighbor islands.",
    aliases: ['UH West Oahu', 'West Oahu', 'UHWO'],
    type: 'university',
    website: "https://westoahu.hawaii.edu/",
    metadata: {
      island: "Oʻahu",
      city: "Kapolei",
      address: "91-1001 Farrington Hwy, Kapolei, HI 96707",
      established: 1976,
    },
  },
  {
    id: 'pcatt',
    name: "Pacific Center for Advanced Technology Training (PCATT)",
    instIpeds: '383190',
    description: "Technology training center based at Honolulu CC providing workforce training and certifications in IT, networking, cybersecurity and advanced manufacturing.",
    aliases: ['PCATT'],
    type: 'training_center',
    website: "https://pcatt.org/",
    metadata: {
      island: "Oʻahu",
      city: "Honolulu",
      address: "874 Dillingham Blvd, Honolulu, HI 96817",
      established: 2000,
    },
  },
  {
    id: 'windward_cc',
    name: "Windward Community College",
    instIpeds: '141990',
    description: "Community college in Kaneohe offering programs in liberal arts, Hawaiian studies, and environmental sustainability. Serves Windward Oʻahu region.",
    aliases: ['Windward CC'],
    type: 'community_college',
    website: "https://windward.hawaii.edu/",
    metadata: {
      island: "Oʻahu",
      city: "Kaneohe",
      address: "45-720 Keaahala Rd, Kaneohe, HI 96744",
      established: 1972,
    },
  },
];

async function seed() {
  for (const c of campuses) {
    await db
      .insert(campus)
      .values({
        id: c.id,
        name: c.name,
        instIpeds: c.instIpeds,
        description: c.description,
        aliases: c.aliases as any,
        type: c.type,
        website: c.website,
        metadata: c.metadata as any,
      })
      .onConflictDoNothing();
    console.log('Upserted campus', c.id);
  }
  console.log('✅ Done seeding campuses');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed error', e);
  process.exit(1);
});
