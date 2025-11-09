// run with npx tsx scripts/seed/seed-campuses.ts

import dotenv from 'dotenv';
import { db } from '../../app/db/index';
import { campus } from '../../app/db/schema';

dotenv.config();

const campuses = [
  {
    id: 'kapiolani_cc',
    name: "Kapiʻolani Community College",
    instIpeds: '141796',
    description:
      "Kapiʻolani Community College is part of the University of Hawaiʻi system, offering associate degrees and certificates in health sciences, business, hospitality, STEM and liberal arts. Located on the slopes of Diamond Head just minutes from Waikīkī, it is known for its Culinary Institute of the Pacific and strong workforce-training programs.",
    aliases: ['Kapiolani', 'Kapiolani CC', 'KCC'],
    type: 'community_college',
    website: "https://www.kapiolani.hawaii.edu/",
    contact: { phone: '(808) 734-9000', email: 'kccinfo@hawaii.edu' },
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
    description:
      "The University of Hawaiʻi at Mānoa is the flagship campus of the UH system, offering undergraduate, graduate and professional degrees. A major research university known for earth & environmental sciences, tropical agriculture, astronomy and Asian-Pacific studies, located in Mānoa Valley near Honolulu.",
    aliases: ['UH Mānoa', 'UH Manoa', 'University of Hawaiʻi at Mānoa'],
    type: 'university',
    website: "https://manoa.hawaii.edu/",
    contact: { phone: '(808) 956-8111', email: 'uhinfo@hawaii.edu' },
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
    description:
      "UH Maui College serves the island of Maui (and surrounding islands), providing associate and bachelor’s degrees in applied business, sustainable science, hospitality and technology, along with community education and workforce training programs.",
    aliases: ['Maui College', 'UH Maui', 'UHMC'],
    type: 'community_college',
    website: "https://maui.hawaii.edu/",
    contact: { phone: '(808) 984-3500', email: 'uhmaui@hawaii.edu' },
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
    description:
      "Leeward Community College is a two-year college located in Pearl City, Oʻahu, offering associate degrees and certificates in liberal arts, IT, teacher education and transfer pathways to UH Mānoa and UH West Oʻahu.",
    aliases: ['Leeward CC', 'Leeward'],
    type: 'community_college',
    website: "https://www.leeward.hawaii.edu/",
    contact: { phone: '(808) 455-0011', email: 'info@leeward.hawaii.edu' },
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
    description:
      "UH Hilo offers undergraduate and graduate programs, with strengths in experiential learning, environmental studies, marine science and Hawaiian language. It serves as the main campus on Hawaiʻi Island (the Big Island).",
    aliases: ['UH Hilo', 'Hilo'],
    type: 'university',
    website: "https://hilo.hawaii.edu/",
    contact: { phone: '(808) 932-7446', email: 'uhhinfo@hawaii.edu' },
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
    description:
      "Honolulu Community College provides technical and career-focused education in fields like aeronautics, computing, architecture, and automotive technology, located in Honolulu, Oʻahu.",
    aliases: ['Honolulu CC', 'HCC'],
    type: 'community_college',
    website: "https://www.honolulu.hawaii.edu/",
    contact: { phone: '(808) 845-9211', email: 'hccinfo@hawaii.edu' },
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
    description:
      "Hawaiʻi Community College provides associate degrees and certificates across academic and technical programs; operates campuses in Hilo and Pālamanui, and emphasizes community partnerships and sustainability on Hawaiʻi Island.",
    aliases: ['Hawaiʻi CC', 'Hawaii CC', 'HawCC'],
    type: 'community_college',
    website: "https://hawaii.hawaii.edu/",
    contact: { phone: '(808) 934-2500', email: 'hawccinfo@hawaii.edu' },
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
    description:
      "Kauaʻi Community College offers associate degrees and certificate programs focused on business, hospitality, technology and liberal arts on the island of Kauaʻi, supporting the local workforce and sustainability efforts.",
    aliases: ['Kauai CC', 'Kauaʻi CC'],
    type: 'community_college',
    website: "https://www.kauai.hawaii.edu/",
    contact: { phone: '(808) 245-8311', email: 'kauaicc@hawaii.edu' },
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
    description:
      "UH West Oʻahu is a four-year university offering applied-learning bachelor’s programs in business, creative media, education and social sciences. It serves students on Oʻahu’s west side and neighbor islands from its campus in Kapolei.",
    aliases: ['UH West Oahu', 'West Oahu', 'UHWO'],
    type: 'university',
    website: "https://westoahu.hawaii.edu/",
    contact: { phone: '(808) 689-2800', email: 'uhwoinfo@hawaii.edu' },
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
    description:
      "The Pacific Center for Advanced Technology Training, based at Honolulu Community College, provides workforce training and certifications in IT, networking, cybersecurity and advanced manufacturing technology.",
    aliases: ['PCATT'],
    type: 'training_center',
    website: "https://pcatt.org/",
    contact: { phone: '(808) 845-9296', email: 'pcatt@hawaii.edu' },
    metadata: {
      island: "Oʻahu",
      city: "Honolulu",
      address: "874 Dillingham Blvd, Honolulu, HI 96817",
      established: 2000,
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
        contact: c.contact as any,
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
