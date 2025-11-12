/**
 * Campus-specific course prefix mappings for UH System
 * Generated from database analysis of actual course data
 * 
 * This handles variations in how different UH campuses code their courses.
 * For example:
 * - UH Manoa uses "ICS" for Computer Science
 * - UH Hilo uses "CS" for Computer Science
 * - UH West Oahu uses "DATA" for Data Science courses
 */

export interface CampusPrefixMapping {
  [discipline: string]: string[];
}

// All unique prefixes by campus from database
export const CAMPUS_PREFIXES: Record<string, string[]> = {
  uh_manoa: ["MUS", "HIST", "KRS", "ENG", "NURS", "ART", "STE", "THEA", "ANTH", "POLS", "SPED", "ECE", "SUST", "ICS", "AMST", "LAW", "PH", "ARCH", "ASAN", "MATH", "SOC", "DNCE", "ERTH", "ME", "JPN", "PSY", "GEO", "PHIL", "EDCS", "WGSS", "CEE", "TIM", "ECON", "HWST", "CHN", "OCN", "EDEP", "TPSS", "REL", "LING", "PLAN", "HAW", "BIOL", "SW", "KOR", "CHEM", "NREM", "FSHN", "LTEC", "SPAN", "BOT", "SLS", "PHYS", "BUS", "COMG", "IP", "COM", "FR", "ES", "ZOOL", "EDEA", "MDED", "LLEA", "CINE", "FIN", "ASTR", "PACE", "TRMD", "LIS", "PEPS", "EDEF", "ATMO", "EALL", "ANSC", "MGT", "ACC", "MICR", "IS", "CMB", "DH", "LWPA", "CSD", "MBBE", "ITM", "ORE", "JOUR", "MKT", "PUBA", "BE", "MBIO", "MED", "CLAS", "HDFS", "PED", "GER", "FDM", "PACS", "RUS", "SURG", "HRM", "TI", "MEDT", "PSTY", "HON", "LAIS", "THAI", "BIOM", "DIS", "ESEE", "CAM", "FIL", "QHS", "AS", "GES", "IND", "MSL", "LWEV", "NHH", "ILO", "ITAL", "LWJT", "SAM", "ANAT", "LWLR", "PATH", "SOCS", "UNIV", "PHYL", "LATN", "NAVL", "OEST", "PHRM", "COA", "MAO", "OBGN", "DRB", "ENGR", "GRK", "MCB", "TAHT", "VIET", "CIS", "DATA", "FMCH", "PORT", "SNSK", "RE", "EDUC", "EPET", "ARAB", "ASL", "BIOC", "ELI", "HNDI", "NSCI", "REPR", "GERI", "BLAW", "CAAM", "CHAM", "PALI", "TAHR", "TONG", "AREC", "CUL", "INS", "LWLM", "LWLW", "HSSW", "LWUL", "PPC", "PRAK", "UROP", "CALL", "ESL", "MDHX", "NSEB", "PAS", "URDU"],
  
  uh_hilo: ["PHPS", "PSY", "ED", "HIST", "ENG", "KES", "WS", "ANTH", "MUS", "PHPP", "COM", "NURS", "BIOL", "MARE", "PHIL", "POLS", "CS", "MATH", "AJ", "JPST", "PHAR", "GEOG", "SOC", "CBES", "ART", "AERS", "JPNS", "KHAW", "LING", "KHWS", "CHEM", "PHYS", "CHNS", "DNCE", "DRAM", "ASTR", "KED", "DATA", "GEOL", "ECON", "ESL", "ACC", "KIND", "HWST", "MGT", "ELI", "FIL", "SPAN", "ENGR", "FIN", "KLAN", "MKT", "AG", "ENSC", "IS", "QBA", "AQUA", "NRES", "BUS", "FR", "HAW", "LANG", "AGBU", "AGEC", "ANSC", "KLIN", "TOUR", "CE", "FOR", "KOR", "PPHY", "UNIV", "AGRN", "ENTO", "HON", "NSCI", "PACS", "PPTH"],
  
  uh_west_oahu: ["ENG", "HIST", "CM", "ANTH", "HPST", "BUSA", "BIOL", "ECON", "HLTH", "ECED", "AS", "EDEE", "ACC", "HAW", "HIM", "GEOL", "HOST", "ART", "EDUC", "FIN", "CHEM", "APSC", "EDSE", "ENGR", "EDML", "CHNS", "EDEF", "DATA", "FMGT", "GEOG", "FIL", "HUM", "ILO", "BOT", "FORS", "HWST", "BIOC", "CYBR", "ETEC", "ASTR", "FMPC", "FSHN"],
  
  kapiolani_cc: ["ART", "ITS", "ENG", "CULN", "LAW", "RAD", "MEDA", "NURS", "OTA", "RESP", "HOST", "MATH", "MUS", "ACC", "MICT", "MLT", "HLTH", "PTA", "BIOL", "DENT", "HWST", "SCI", "BUS", "HIST", "PHYS", "SLT", "CHW", "ED", "CHEM", "JPN", "ESOL", "HAW", "HUM", "ICS", "PHIL", "PSY", "REL", "ASL", "BOT", "DNCE", "IS", "EALL", "KOR", "PHYL", "SOC", "CHN", "EMT", "MICR", "SPAN", "ANTH", "EE", "FIL", "FR", "GEOG", "JOUR", "POLS", "SP", "ASAN", "ECON", "ENT", "ESS", "MGT", "OCN", "PACS", "THEA", "BIOC", "CE", "GG", "LING", "PHRM", "SSCI", "AMST", "BLAW", "COM", "ES", "ESL", "FSHE", "ME", "SOCS"],
  
  leeward_cc: ["ICS", "ART", "ED", "DMED", "MUS", "HIT", "AG", "ENG", "HIST", "HWST", "CULN", "MECH", "AMT", "MATH", "HSER", "REL", "ACC", "BIOL", "PHIL", "THEA", "BUSN", "PSY", "SOC", "CHEM", "DNCE", "FIL", "IS", "PHYS", "ANTH", "ECE", "ESL", "MGT", "AMST", "FR", "GEO", "HAW", "JPN", "KOR", "OCN", "POLS", "SPAN", "WGSS", "ASTR", "BUS", "ECON", "ERTH", "HOST", "AQUA", "BOT", "CE", "ENT", "FSHN", "HLTH", "MKT", "PHYL", "SP", "ZOOL", "ATMO", "BIOC", "BLAW", "COM", "ECOM", "FIN", "HDFS", "LSK", "ME", "MICR", "OEST", "PACS", "PHRM", "QM", "SW"],
  
  windward_cc: ["MUS", "ART", "ANSC", "THEA", "HWST", "ICS", "MATH", "BIOL", "PSY", "CM", "CHEM", "AG", "BOT", "ENG", "HIST", "PHYS", "ASTR", "ERTH", "REL", "IS", "DNCE", "SCI", "HLTH", "OCN", "PHIL", "ZOOL", "ACC", "ANTH", "AQUA", "JOUR", "CHW", "GEO", "HAW", "JPN", "POLS", "SOC", "SP", "BUS", "HDFS", "PHYL", "SPAN", "BIOC", "ECON", "WGSS", "EE", "MICR", "SSCI", "ATMO", "BLAW", "BUSN", "CE", "FIN", "FSHN", "LING", "LSK", "MGT", "PACS", "PHRM", "SOCS", "SW"],
  
  honolulu_cc: ["ENG", "CSNT", "AEC", "FT", "MELE", "AJ", "ECED", "HWST", "MATH", "WELD", "CA", "OESM", "BIOL", "COSM", "FIRE", "PHYS", "HIST", "SMP", "AMT", "ART", "CHEM", "DISL", "PHIL", "PSY", "AS", "EIMT", "MUS", "ABRP", "AERO", "ESL", "JPN", "MSL", "ASAN", "ICS", "REL", "CARP", "HAW", "HDFS", "HSER", "SOC", "SP", "ANTH", "BOT", "EE", "KOR", "POLS", "ASL", "ENT", "GEO", "IS", "JOUR", "OCN", "PHYL", "RAC", "SSCI", "AMST", "ECON", "ERTH", "ACC", "ASTR", "ATMO", "BIOC", "CE", "EALL", "MICR", "SCI", "THEA", "WGSS", "ZOOL", "AG", "APTR", "BLAW", "FSHN", "HUM", "IEDB", "IEDD", "KLS", "LING", "SW", "WORK"],
  
  hawaii_cc: ["Art", "Nurs", "Ag", "AJ", "HwSt", "ECEd", "EngT", "Culn", "Eng", "Fire", "SUDs", "Acc", "Etro", "HSer", "HosT", "MATH", "Busn", "Phys", "Hist", "Biol", "Geo", "Phil", "Chem", "ICS", "MWIM", "Psy", "Soc", "Dnce", "Sp", "Bot", "ITS", "AMT", "Blpr", "Carp", "Haw", "QM", "SSci", "Sci", "ABRP", "Anth", "DiMc", "EIMT", "ESL", "IS", "Jpn", "Mkt", "Ocn", "Phyl", "Rel", "WGSS", "Zool", "AEC", "Asan", "Econ", "Hum", "Ling", "Math", "Mgt", "Astr", "Erth", "LSK", "Micr", "BLaw", "BUSN", "BioC", "Bus", "CM", "ECom", "Ent", "HD", "HDFS", "Hlth", "IEdB", "Mus", "PacS", "PolS", "Univ"],
  
  kauai_cc: ["AMT", "ART", "HWST", "CULN", "MATH", "ETRO", "ACC", "ECED", "EIMT", "NURS", "MEDA", "MUS", "CM", "ENG", "HIST", "PHIL", "HAW", "IS", "AG", "HOST", "PHYS", "SCI", "AEC", "CARP", "FENG", "GIS", "HPER", "SP", "WELD", "BIOL", "ECE", "JPN", "OCN", "PH", "SPAN", "BOT", "BUS", "CHEM", "ENT", "ERTH", "MGT", "REL", "SSM", "ANTH", "ECON", "ICS", "MARE", "MICR", "MKT", "PHYL", "PSY", "SOC", "SSCI", "THEA", "ASTR", "BLAW", "BLPR", "ELI", "HDFS", "HLTH", "POLS", "QM", "ZOOL"],
  
  uh_maui: ["NURS", "AG", "MUS", "DH", "ICS", "BIOL", "ENG", "CM", "HWST", "BUSN", "AJ", "ECED", "CULN", "ART", "MATH", "SSM", "AMT", "HSER", "BUS", "CHEM", "PHYS", "ACC", "ETRO", "FT", "HOST", "ANTH", "PSY", "HIST", "OCN", "MAIN", "SCI", "HAW", "IS", "ABRP", "PHIL", "PHRM", "SPAN", "MGT", "MKT", "SOC", "BOT", "CASE", "COM", "ECON", "FMGT", "HLTH", "JPN", "PHYL", "ZOOL", "BLAW", "CARP", "CVE", "ENRG", "FIL", "GEO", "GG", "OSH", "THEA", "AQUA", "ASTR", "BIOC", "DMED", "EE", "ELEC", "FSHN", "HUM", "ILO", "MICR", "POLS", "SP", "WELD", "AEC", "BLPR", "BUS/COM", "CHW", "COM/PSY", "FIN", "GIS", "GIS/ICS", "HDFS", "HWST/MUS", "JOUR", "LING", "LSK", "PACS", "PSY/COM", "QM", "REL", "SW", "TCOM", "WP"],
  
  pcatt: ["Com"],
};

// Campus-specific discipline to prefix mappings
// Handles variations in how different UH campuses code their courses
export const CAMPUS_DISCIPLINE_MAPPINGS: Record<string, CampusPrefixMapping> = {
  uh_manoa: {
    computer_science: ["ICS", "DATA"],
    information_computer_sciences: ["ICS"],
    data_science: ["DATA"],
    business: ["BUS"],
    accounting: ["ACC"],
    economics: ["ECON"],
    engineering: ["ENGR", "ME", "CEE", "EE"],
    biology: ["BIOL", "BOT", "ZOOL", "MICR"],
    chemistry: ["CHEM"],
    physics: ["PHYS"],
    mathematics: ["MATH"],
    english: ["ENG"],
    psychology: ["PSY"],
    nursing: ["NURS"],
    hawaiian: ["HWST", "HAW"],
    communication: ["COM", "COMG"],
    history: ["HIST"],
    sociology: ["SOC"],
    anthropology: ["ANTH"],
    art: ["ART"],
    music: ["MUS"],
    theater: ["THEA"],
    dance: ["DNCE"],
    philosophy: ["PHIL"],
    political_science: ["POLS"],
    education: ["EDCS", "EDEP", "EDEA", "EDEF"],
  },
  
  uh_hilo: {
    computer_science: ["CS", "DATA"],
    data_science: ["DATA"],
    business: ["BUS"],
    accounting: ["ACC"],
    economics: ["ECON"],
    engineering: ["ENGR"],
    biology: ["BIOL", "MARE"],
    chemistry: ["CHEM"],
    physics: ["PHYS"],
    mathematics: ["MATH"],
    english: ["ENG"],
    psychology: ["PSY"],
    nursing: ["NURS"],
    hawaiian: ["HWST", "HAW", "KHAW", "KHWS"],
    communication: ["COM"],
    history: ["HIST"],
    sociology: ["SOC"],
    anthropology: ["ANTH"],
    art: ["ART"],
    music: ["MUS"],
    theater: ["DRAM"],
    dance: ["DNCE"],
    philosophy: ["PHIL"],
    political_science: ["POLS"],
    education: ["ED", "KED"],
    pharmacy: ["PHAR"],
  },
  
  uh_west_oahu: {
    computer_science: ["DATA", "CYBR"],
    data_science: ["DATA"],
    cybersecurity: ["CYBR"],
    business: ["BUSA"],
    accounting: ["ACC"],
    economics: ["ECON"],
    engineering: ["ENGR", "APSC"],
    biology: ["BIOL", "BOT"],
    chemistry: ["CHEM"],
    mathematics: ["MATH"],
    english: ["ENG"],
    psychology: ["PSY"],
    hawaiian: ["HWST", "HAW"],
    communication: ["CM"],
    history: ["HIST"],
    anthropology: ["ANTH"],
    art: ["ART"],
    education: ["ECED", "EDEE", "EDSE", "EDML", "EDEF", "EDUC"],
    hospitality: ["HOST"],
  },
  
  // Community colleges - simplified mappings
  kapiolani_cc: {
    computer_science: ["ICS"],
    business: ["BUS"],
    accounting: ["ACC"],
    nursing: ["NURS"],
    culinary: ["CULN"],
    hospitality: ["HOST"],
    english: ["ENG"],
    mathematics: ["MATH"],
    hawaiian: ["HWST", "HAW"],
  },
  
  leeward_cc: {
    computer_science: ["ICS"],
    business: ["BUSN", "BUS"],
    accounting: ["ACC"],
    english: ["ENG"],
    mathematics: ["MATH"],
    hawaiian: ["HWST", "HAW"],
    education: ["ED", "ECE"],
  },
  
  windward_cc: {
    computer_science: ["ICS"],
    business: ["BUS", "BUSN"],
    agriculture: ["AG", "ANSC"],
    english: ["ENG"],
    mathematics: ["MATH"],
    hawaiian: ["HWST", "HAW"],
  },
  
  honolulu_cc: {
    computer_science: ["ICS"],
    business: ["BUS"],
    accounting: ["ACC"],
    english: ["ENG"],
    mathematics: ["MATH"],
    hawaiian: ["HWST", "HAW"],
  },
  
  hawaii_cc: {
    computer_science: ["ICS"],
    business: ["Busn", "Bus"],
    accounting: ["Acc"],
    english: ["Eng"],
    mathematics: ["MATH", "Math"],
    hawaiian: ["HwSt", "Haw"],
    nursing: ["Nurs"],
  },
  
  kauai_cc: {
    computer_science: ["ICS"],
    business: ["BUS"],
    accounting: ["ACC"],
    english: ["ENG"],
    mathematics: ["MATH"],
    hawaiian: ["HWST", "HAW"],
  },
  
  uh_maui: {
    computer_science: ["ICS"],
    business: ["BUSN", "BUS"],
    accounting: ["ACC"],
    nursing: ["NURS"],
    english: ["ENG"],
    mathematics: ["MATH"],
    hawaiian: ["HWST", "HAW"],
  },
};

// Default fallback for campuses not specifically configured
export const DEFAULT_DISCIPLINE_MAPPING: CampusPrefixMapping = {
  computer_science: ["CS", "ICS", "IT", "DATA"],
  information_technology: ["IT", "ITS", "ICS"],
  data_science: ["DATA"],
  business: ["BUS", "BUSN", "BUSA"],
  accounting: ["ACC"],
  economics: ["ECON"],
  engineering: ["ENGR", "EE", "ME", "CE", "CEE"],
  biology: ["BIOL", "BOT", "ZOOL", "MICR"],
  chemistry: ["CHEM"],
  physics: ["PHYS"],
  mathematics: ["MATH"],
  english: ["ENG", "ENGL"],
  psychology: ["PSY"],
  nursing: ["NURS"],
  hawaiian: ["HWST", "HAW", "KHAW"],
  communication: ["COM", "COMM", "COMG"],
  history: ["HIST"],
  sociology: ["SOC"],
  anthropology: ["ANTH"],
  art: ["ART"],
  music: ["MUS"],
  theater: ["THEA", "DRAM"],
  dance: ["DNCE"],
  philosophy: ["PHIL"],
  political_science: ["POLS"],
  education: ["ED", "EDUC"],
};

/**
 * Get campus-specific discipline mapping, falling back to default if not found
 */
export function getCampusDisciplineMapping(campusId: string): CampusPrefixMapping {
  return CAMPUS_DISCIPLINE_MAPPINGS[campusId] || DEFAULT_DISCIPLINE_MAPPING;
}

/**
 * Get all prefixes available at a specific campus
 */
export function getCampusPrefixes(campusId: string): string[] {
  return CAMPUS_PREFIXES[campusId] || [];
}
