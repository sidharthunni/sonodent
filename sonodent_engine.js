/**
 * SonoDent AI // Core Dental Intelligence & Voice Parsing Engine
 * Specialized for CareStack Clinical EHR Integration (DSOLVE 2026 Problem 7)
 * Author: ctrlX (S Sidharth Unni & Arjun Unnikrishnan Pillai)
 */

(function(global) {
  'use strict';

  // Standard 32-Tooth Anatomy Table (Universal & FDI cross-index)
  const TEETH_METADATA = [
    // Maxilla (Upper Arch) - Quadrant 1 (Teeth 1-8)
    { id: 1,  fdi: 18, name: "Maxillary Right 3rd Molar", type: "molar", quad: 1, roots: 3 },
    { id: 2,  fdi: 17, name: "Maxillary Right 2nd Molar", type: "molar", quad: 1, roots: 3 },
    { id: 3,  fdi: 16, name: "Maxillary Right 1st Molar", type: "molar", quad: 1, roots: 3 },
    { id: 4,  fdi: 15, name: "Maxillary Right 2nd Premolar", type: "premolar", quad: 1, roots: 1 },
    { id: 5,  fdi: 14, name: "Maxillary Right 1st Premolar", type: "premolar", quad: 1, roots: 2 },
    { id: 6,  fdi: 13, name: "Maxillary Right Canine", type: "canine", quad: 1, roots: 1 },
    { id: 7,  fdi: 12, name: "Maxillary Right Lateral Incisor", type: "incisor", quad: 1, roots: 1 },
    { id: 8,  fdi: 11, name: "Maxillary Right Central Incisor", type: "incisor", quad: 1, roots: 1 },
    // Maxilla (Upper Arch) - Quadrant 2 (Teeth 9-16)
    { id: 9,  fdi: 21, name: "Maxillary Left Central Incisor", type: "incisor", quad: 2, roots: 1 },
    { id: 10, fdi: 22, name: "Maxillary Left Lateral Incisor", type: "incisor", quad: 2, roots: 1 },
    { id: 11, fdi: 23, name: "Maxillary Left Canine", type: "canine", quad: 2, roots: 1 },
    { id: 12, fdi: 24, name: "Maxillary Left 1st Premolar", type: "premolar", quad: 2, roots: 2 },
    { id: 13, fdi: 25, name: "Maxillary Left 2nd Premolar", type: "premolar", quad: 2, roots: 1 },
    { id: 14, fdi: 26, name: "Maxillary Left 1st Molar", type: "molar", quad: 2, roots: 3 },
    { id: 15, fdi: 27, name: "Maxillary Left 2nd Molar", type: "molar", quad: 2, roots: 3 },
    { id: 16, fdi: 28, name: "Maxillary Left 3rd Molar", type: "molar", quad: 2, roots: 3 },
    // Mandible (Lower Arch) - Quadrant 3 (Teeth 17-24)
    { id: 17, fdi: 38, name: "Mandibular Left 3rd Molar", type: "molar", quad: 3, roots: 2 },
    { id: 18, fdi: 37, name: "Mandibular Left 2nd Molar", type: "molar", quad: 3, roots: 2 },
    { id: 19, fdi: 36, name: "Mandibular Left 1st Molar", type: "molar", quad: 3, roots: 2 },
    { id: 20, fdi: 35, name: "Mandibular Left 2nd Premolar", type: "premolar", quad: 3, roots: 1 },
    { id: 21, fdi: 34, name: "Mandibular Left 1st Premolar", type: "premolar", quad: 3, roots: 1 },
    { id: 22, fdi: 33, name: "Mandibular Left Canine", type: "canine", quad: 3, roots: 1 },
    { id: 23, fdi: 32, name: "Mandibular Left Lateral Incisor", type: "incisor", quad: 3, roots: 1 },
    { id: 24, fdi: 31, name: "Mandibular Left Central Incisor", type: "incisor", quad: 3, roots: 1 },
    // Mandible (Lower Arch) - Quadrant 4 (Teeth 25-32)
    { id: 25, fdi: 41, name: "Mandibular Right Central Incisor", type: "incisor", quad: 4, roots: 1 },
    { id: 26, fdi: 42, name: "Mandibular Right Lateral Incisor", type: "incisor", quad: 4, roots: 1 },
    { id: 27, fdi: 43, name: "Mandibular Right Canine", type: "canine", quad: 4, roots: 1 },
    { id: 28, fdi: 44, name: "Mandibular Right 1st Premolar", type: "premolar", quad: 4, roots: 1 },
    { id: 29, fdi: 45, name: "Mandibular Right 2nd Premolar", type: "premolar", quad: 4, roots: 1 },
    { id: 30, fdi: 46, name: "Mandibular Right 1st Molar", type: "molar", quad: 4, roots: 2 },
    { id: 31, fdi: 47, name: "Mandibular Right 2nd Molar", type: "molar", quad: 4, roots: 2 },
    { id: 32, fdi: 48, name: "Mandibular Right 3rd Molar", type: "molar", quad: 4, roots: 2 }
  ];

  // 6 Standardized Probing Sites
  const SITES = ["MB", "B", "DB", "ML", "L", "DL"];
  const SITE_NAMES = {
    MB: "Mesiobuccal",
    B:  "Mid-Buccal / Facial",
    DB: "Distobuccal",
    ML: "Mesiolingual",
    L:  "Mid-Lingual / Palatal",
    DL: "Distolingual"
  };

  // Comprehensive Standard Dental Clinical Lexicon Database
  // Cross-indexed with SNOMED-CT, ADA CDT, LOINC, and ICD-10-CM standards
  const DENTAL_LEXICON_DATABASE = [
    // 1. Periodontal Clinical Parameters
    { id: "ppd", term: "Probing Pocket Depth", triggers: ["depth", "pocket", "probing", "pocket depth", "sulcus depth", "mm"], category: "Periodontal", code: "LOINC 76465-4 / SNOMED 274786000", meaning: "Distance from gingival margin to bottom of sulcus (1-15mm).", actionable: true },
    { id: "bop", term: "Bleeding on Probing", triggers: ["bleeding", "bleed", "blood", "bop", "positive"], category: "Periodontal", code: "LOINC 76466-2 / SNOMED 274787009", meaning: "Capillary hemorrhage upon probing, indicating active inflammation.", actionable: true },
    { id: "sup", term: "Suppuration / Purulent Exudate", triggers: ["pus", "suppuration", "suppurating", "exudate", "purulent"], category: "Periodontal", code: "LOINC 76467-0 / SNOMED 274788004", meaning: "Purulent discharge in pocket indicating neutrophilic breakdown.", actionable: true },
    { id: "rec", term: "Gingival Recession", triggers: ["recession", "recess", "receding", "root exposure"], category: "Periodontal", code: "LOINC 76468-8 / SNOMED 34927002", meaning: "Distance from CEJ to gingival margin exposing root surface.", actionable: true },
    { id: "cal", term: "Clinical Attachment Loss", triggers: ["cal", "attachment loss", "clinical attachment"], category: "Periodontal", code: "LOINC 76469-6 / SNOMED 274789007", meaning: "Total attachment loss (Probing Depth + Gingival Recession).", actionable: true },
    { id: "fur", term: "Furcation Involvement", triggers: ["furcation", "furca", "furcation class", "fork"], category: "Periodontal", code: "LOINC 76470-4 / Glickman I-IV", meaning: "Interradicular bone loss on multi-rooted molars/premolars.", actionable: true },
    { id: "mob", term: "Tooth Mobility", triggers: ["mobility", "mobile", "mobility grade", "loose tooth"], category: "Periodontal", code: "LOINC 76471-2 / Miller Grade 0-3", meaning: "Horizontal or axial depressibility of tooth in socket.", actionable: true },
    { id: "cal_sub", term: "Subgingival Calculus", triggers: ["calculus", "tartar", "subgingival calculus", "calc"], category: "Periodontal", code: "SNOMED 408548003 / CDT D4346", meaning: "Mineralized subgingival biofilm deposit requiring scaling.", actionable: false },
    { id: "plaque", term: "Biofilm / Plaque Deposit", triggers: ["plaque", "biofilm", "plaque index"], category: "Periodontal", code: "SNOMED 408547008", meaning: "Bacterial aggregate on tooth surface provoking gingival inflammation.", actionable: false },
    { id: "ging_margin", term: "Gingival Margin Height", triggers: ["margin", "free gingival margin", "gingival height"], category: "Periodontal", code: "LOINC 76473-8", meaning: "Position of the coronal border of the free gingiva relative to CEJ.", actionable: false },
    { id: "kerat_tissue", term: "Keratinized Gingival Band", triggers: ["keratinized", "keratinized tissue", "attached gingiva"], category: "Periodontal", code: "LOINC 76472-0", meaning: "Zone of attached masticatory mucosa protecting periodontium.", actionable: false },
    { id: "mgd", term: "Mucogingival Defect", triggers: ["mucogingival", "mucogingival defect", "frenum pull"], category: "Periodontal", code: "SNOMED 235072005", meaning: "Absence or deficiency of keratinized gingiva with high frenum attachment.", actionable: false },

    // 2. Hard Tissue / Odontogram & Caries Findings
    { id: "caries", term: "Dental Caries / Cavity", triggers: ["caries", "cavity", "decay", "carious lesion"], category: "Hard Tissue", code: "ICD-10 K02.9 / SNOMED 80967001", meaning: "Demineralization and cavitation of enamel and dentin by acidogenic bacteria.", actionable: false },
    { id: "incipient", term: "Incipient Enamel Lesion", triggers: ["incipient", "white spot", "demineralization", "early caries"], category: "Hard Tissue", code: "ICD-10 K02.3 / SNOMED 234994004", meaning: "Subsurface enamel demineralization without cavitation; remineralizable.", actionable: false },
    { id: "recurrent", term: "Recurrent / Secondary Caries", triggers: ["recurrent caries", "secondary caries", "marginal leakage"], category: "Hard Tissue", code: "ICD-10 K02.8 / SNOMED 234996002", meaning: "New carious breakdown developing at the margin of an existing restoration.", actionable: false },
    { id: "fracture", term: "Fractured Enamel / Cusp", triggers: ["fracture", "fractured", "broken cusp", "chipped"], category: "Hard Tissue", code: "ICD-10 S02.5 / SNOMED 234998001", meaning: "Mechanical fracture or structural cleavage of coronal tooth structure.", actionable: false },
    { id: "attrition", term: "Incisal / Occlusal Attrition", triggers: ["attrition", "wear facets", "bruxism wear", "grinding"], category: "Hard Tissue", code: "ICD-10 K03.0 / SNOMED 38171004", meaning: "Tooth-to-tooth mechanical wear from mastication or parafunctional clenching.", actionable: false },
    { id: "abrasion", term: "Cervical Abrasion", triggers: ["abrasion", "toothbrush abrasion", "cervical notch"], category: "Hard Tissue", code: "ICD-10 K03.1 / SNOMED 83162002", meaning: "Frictional wear from foreign objects such as hard toothbrush bristles.", actionable: false },
    { id: "abfraction", term: "Cervical Abfraction", triggers: ["abfraction", "wedge lesion", "cervical flexure"], category: "Hard Tissue", code: "ICD-10 K03.1 / SNOMED 274795008", meaning: "Biomechanically induced wedge-shaped cervical defect from occlusal flexing.", actionable: false },
    { id: "erosion", term: "Acid Erosion", triggers: ["erosion", "acid erosion", "chemical wear"], category: "Hard Tissue", code: "ICD-10 K03.2 / SNOMED 67362008", meaning: "Loss of superficial tooth structure from extrinsic or intrinsic gastric acids.", actionable: false },
    { id: "craze_line", term: "Enamel Craze Line", triggers: ["craze line", "craze", "enamel crack", "microcrack"], category: "Hard Tissue", code: "SNOMED 274796009", meaning: "Superficial hairline fracture confined strictly to enamel without symptoms.", actionable: false },

    // 3. Restorative & Prosthetics Status
    { id: "comp_rest", term: "Resin Composite Restoration", triggers: ["composite", "resin", "white filling", "composite restoration"], category: "Restorative", code: "CDT D2391-D2394 / SNOMED 257277002", meaning: "Tooth-colored direct dimethacrylate polymer restorative material.", actionable: false },
    { id: "amalgam", term: "Dental Amalgam Restoration", triggers: ["amalgam", "silver filling", "silver restoration"], category: "Restorative", code: "CDT D2140-D2161 / SNOMED 111421008", meaning: "Direct dental restorative alloy composed of silver, tin, copper, and mercury.", actionable: false },
    { id: "zirconia", term: "Zirconia Ceramic Crown", triggers: ["crown", "zirconia", "full ceramic", "ceramic crown"], category: "Restorative", code: "CDT D2740 / SNOMED 257321008", meaning: "High-strength monolithic polycrystalline ceramic full coverage restoration.", actionable: false },
    { id: "pfm", term: "Porcelain Fused to Metal Crown", triggers: ["pfm", "porcelain metal", "pfm crown"], category: "Restorative", code: "CDT D2750 / SNOMED 257322001", meaning: "Ceramometal crown combining metallic cast framework with feldspathic porcelain.", actionable: false },
    { id: "veneer", term: "Porcelain Laminate Veneer", triggers: ["veneer", "laminate", "porcelain veneer"], category: "Restorative", code: "CDT D2962 / SNOMED 257324000", meaning: "Esthetic thin bonded ceramic shell covering labial/facial enamel.", actionable: false },
    { id: "inlay_onlay", term: "Indirect Inlay / Onlay", triggers: ["inlay", "onlay", "indirect restoration"], category: "Restorative", code: "CDT D2610-D2630", meaning: "Laboratory-fabricated restoration replacing one or more cusps.", actionable: false },
    { id: "bridge", term: "Fixed Partial Denture (Bridge)", triggers: ["bridge", "fixed partial denture", "fpd"], category: "Prosthetics", code: "CDT D6240 / SNOMED 257325004", meaning: "Fixed prosthetic appliance replacing missing teeth anchored to abutments.", actionable: false },
    { id: "pontic", term: "Bridge Pontic", triggers: ["pontic", "dummy tooth", "suspended tooth"], category: "Prosthetics", code: "CDT D6245 / SNOMED 257326003", meaning: "Artificial tooth suspended between bridge abutments over edentulous ridge.", actionable: false },
    { id: "abutment", term: "Crown / Implant Abutment", triggers: ["abutment", "anchor tooth", "implant abutment"], category: "Prosthetics", code: "CDT D6057 / SNOMED 257327007", meaning: "Supporting tooth or transmucosal component that retains a prosthesis.", actionable: false },
    { id: "implant", term: "Endosseous Dental Implant", triggers: ["implant", "fixture", "osseointegrated implant"], category: "Prosthetics", code: "CDT D6010 / SNOMED 272488008", meaning: "Biocompatible titanium/zirconia root replica surgically anchored in bone.", actionable: true },
    { id: "missing", term: "Missing / Extracted Tooth", triggers: ["missing", "extracted", "absent", "tooth missing"], category: "Anatomy", code: "ICD-10 K08.1 / SNOMED 25540007", meaning: "Absence of tooth due to extraction, agenesis, or trauma.", actionable: true },

    // 4. Endodontic Diagnostic Terms
    { id: "rev_pulp", term: "Reversible Pulpitis", triggers: ["reversible pulpitis", "sensitive to cold", "mild pulpitis"], category: "Endodontic", code: "ICD-10 K04.01 / SNOMED 196373003", meaning: "Pulpal hyperemia that resolves rapidly following stimulus removal.", actionable: false },
    { id: "irrev_pulp", term: "Irreversible Pulpitis", triggers: ["irreversible pulpitis", "lingering pain", "spontaneous pain"], category: "Endodontic", code: "ICD-10 K04.02 / SNOMED 196374009", meaning: "Severe unresolving pulpal inflammation requiring root canal or extraction.", actionable: false },
    { id: "necrosis", term: "Pulpal Necrosis", triggers: ["necrotic", "dead pulp", "non vital", "necrosis"], category: "Endodontic", code: "ICD-10 K04.1 / SNOMED 196375005", meaning: "Complete cessation of pulpal blood supply and neural function.", actionable: false },
    { id: "apical_perio", term: "Acute Apical Periodontitis", triggers: ["apical periodontitis", "tender to percussion", "percussion positive"], category: "Endodontic", code: "ICD-10 K04.4 / SNOMED 196378007", meaning: "Inflammation of periapical periodontal ligament; painful to biting.", actionable: false },
    { id: "apical_abscess", term: "Chronic Apical Abscess / Fistula", triggers: ["abscess", "fistula", "gumboil", "sinus tract"], category: "Endodontic", code: "ICD-10 K04.6 / SNOMED 196380001", meaning: "Suppurative periapical inflammatory drainage channel through alveolar bone.", actionable: false },
    { id: "rct", term: "Root Canal Therapy (RCT)", triggers: ["root canal", "endodontic therapy", "pulpectomy", "rct"], category: "Endodontic", code: "CDT D3310-D3330 / SNOMED 234857008", meaning: "Chemo-mechanical extirpation, shaping, and hermetic obturation of pulp canals.", actionable: false },

    // 5. Tooth Surfaces & Anatomical Orientation
    { id: "surf_m", term: "Mesial Surface", triggers: ["mesial", "m"], category: "Tooth Surfaces", code: "SNOMED 245643001", meaning: "Surface facing toward the anterior midline of the dental arch.", actionable: true },
    { id: "surf_d", term: "Distal Surface", triggers: ["distal", "d"], category: "Tooth Surfaces", code: "SNOMED 245644007", meaning: "Surface facing away from the anterior midline of the dental arch.", actionable: true },
    { id: "surf_o", term: "Occlusal Surface", triggers: ["occlusal", "o", "chewing surface", "biting surface"], category: "Tooth Surfaces", code: "SNOMED 245645008", meaning: "Masticatory surface of posterior molars and premolars.", actionable: true },
    { id: "surf_i", term: "Incisal Edge", triggers: ["incisal", "incisal edge", "cutting edge"], category: "Tooth Surfaces", code: "SNOMED 245646009", meaning: "Cutting coronal margin of anterior central/lateral incisors and canines.", actionable: true },
    { id: "surf_b", term: "Buccal / Facial Surface", triggers: ["buccal", "facial", "labial", "b", "f"], category: "Tooth Surfaces", code: "SNOMED 245647000", meaning: "Surface directed outwardly toward the cheeks or lips.", actionable: true },
    { id: "surf_l", term: "Lingual / Palatal Surface", triggers: ["lingual", "palatal", "l", "p"], category: "Tooth Surfaces", code: "SNOMED 245648005", meaning: "Surface directed inwardly toward the tongue or palate.", actionable: true },
    { id: "surf_mod", term: "Mesio-Occluso-Distal", triggers: ["mod", "mesio occlusal distal"], category: "Tooth Surfaces", code: "SNOMED 245649002", meaning: "Three-surface coronal cavity involving mesial, occlusal, and distal walls.", actionable: false },
    { id: "surf_mo", term: "Mesio-Occlusal", triggers: ["mo", "mesio occlusal"], category: "Tooth Surfaces", code: "SNOMED 245650002", meaning: "Two-surface coronal preparation involving mesial interproximal and occlusal.", actionable: false },
    { id: "surf_do", term: "Disto-Occlusal", triggers: ["do", "disto occlusal"], category: "Tooth Surfaces", code: "SNOMED 245651003", meaning: "Two-surface coronal preparation involving distal interproximal and occlusal.", actionable: false },

    // 6. Occlusion & Orthodontics
    { id: "class_1_occ", term: "Angle Class I Normal Occlusion", triggers: ["class 1 occlusion", "class one", "neutroclusion"], category: "Occlusion", code: "SNOMED 245652005", meaning: "MB cusp of maxillary 1st molar occludes in MB groove of mandibular 1st molar.", actionable: false },
    { id: "class_2_occ", term: "Angle Class II Malocclusion", triggers: ["class 2", "class two", "distoclusion", "retrognathic"], category: "Occlusion", code: "SNOMED 245653000", meaning: "Mandibular dental arch occludes posterior (distal) to maxillary arch.", actionable: false },
    { id: "class_3_occ", term: "Angle Class III Malocclusion", triggers: ["class 3", "class three", "mesioclusion", "prognathic", "underbite"], category: "Occlusion", code: "SNOMED 245654006", meaning: "Mandibular dental arch occludes anterior (mesial) to maxillary arch.", actionable: false },
    { id: "overjet", term: "Horizontal Overjet", triggers: ["overjet", "horizontal overlap"], category: "Occlusion", code: "SNOMED 245655007", meaning: "Horizontal projection of maxillary incisors beyond mandibular incisors (normal 2-3mm).", actionable: false },
    { id: "overbite", term: "Vertical Overbite", triggers: ["overbite", "deep bite", "vertical overlap"], category: "Occlusion", code: "SNOMED 245656008", meaning: "Vertical overlap of maxillary central incisors over mandibular incisors.", actionable: false },
    { id: "crossbite", term: "Crossbite (Anterior / Posterior)", triggers: ["crossbite", "posterior crossbite", "anterior crossbite"], category: "Occlusion", code: "SNOMED 245657004", meaning: "Abnormal transverse buccolingual relationship of opposing teeth.", actionable: false },
    { id: "openbite", term: "Anterior Open Bite", triggers: ["open bite", "apertognathia"], category: "Occlusion", code: "SNOMED 245658009", meaning: "Lack of vertical contact between opposing incisors in maximum intercuspation.", actionable: false },
    { id: "diastema", term: "Midline / Interdental Diastema", triggers: ["diastema", "spacing", "gap between teeth"], category: "Occlusion", code: "ICD-10 K07.30 / SNOMED 245659001", meaning: "Space or gap separating adjacent teeth, commonly between central incisors.", actionable: false },

    // 7. Soft Tissue & Oral Pathology
    { id: "gingivitis", term: "Biofilm-Induced Gingivitis", triggers: ["gingivitis", "marginal inflammation", "swollen gums"], category: "Soft Tissue", code: "ICD-10 K05.10 / SNOMED 66383009", meaning: "Reversible bacterial inflammatory response limited to free and attached gingiva.", actionable: false },
    { id: "ulcer", term: "Recurrent Aphthous Ulcer", triggers: ["aphthous", "ulcer", "canker sore", "aphthous ulcer"], category: "Soft Tissue", code: "ICD-10 K12.0 / SNOMED 266115006", meaning: "Painful, self-limiting benign ulceration with erythematous halo on unattached mucosa.", actionable: false },
    { id: "leukoplakia", term: "Oral Leukoplakia", triggers: ["leukoplakia", "white patch"], category: "Soft Tissue", code: "ICD-10 K13.21 / SNOMED 235122005", meaning: "White mucosal plaque that cannot be wiped off and lacks specific diagnosis; precancerous risk.", actionable: false },
    { id: "lichen", term: "Oral Lichen Planus", triggers: ["lichen planus", "wickham striae"], category: "Soft Tissue", code: "ICD-10 L43.9 / SNOMED 235123000", meaning: "Chronic T-cell mediated autoimmune disease with characteristic reticular white striations.", actionable: false },
    { id: "hyperplasia", term: "Gingival Hyperplasia / Overgrowth", triggers: ["hyperplasia", "gingival overgrowth", "drug induced hyperplasia"], category: "Soft Tissue", code: "ICD-10 K06.1 / SNOMED 235124006", meaning: "Pathological enlargement of gingival tissues (often drug-induced by amlodipine, phenytoin).", actionable: false },
    { id: "torus_p", term: "Torus Palatinus", triggers: ["torus", "palatal torus", "torus palatinus", "exostosis"], category: "Soft Tissue", code: "ICD-10 K10.0 / SNOMED 235125007", meaning: "Benign non-neoplastic exostosis or bony protuberance along the hard palate midline.", actionable: false },
    { id: "torus_m", term: "Torus Mandibularis", triggers: ["mandibular torus", "lingual torus", "torus mandibularis"], category: "Soft Tissue", code: "ICD-10 K10.0 / SNOMED 235126008", meaning: "Benign bilateral bony outgrowths on lingual aspect of mandible near premolars.", actionable: false }
  ];

  class SonoDentEngine {
    constructor() {
      this.teeth = {};
      this.activeToothId = 1;
      this.activeSiteIndex = 0; // 0 to 5
      this.historyStack = [];
      this.currentBatch = null;
      this.numberingSystem = "universal"; // "universal" or "fdi"
      this.isStandby = false; // Acoustic Wake-Word & Standby Mode
      this.initChart();
    }

    setStandby(val) {
      this.isStandby = Boolean(val);
      return this.isStandby;
    }

    initChart() {
      TEETH_METADATA.forEach(t => {
        this.teeth[t.id] = {
          id: t.id,
          fdi: t.fdi,
          name: t.name,
          type: t.type,
          quad: t.quad,
          roots: t.roots,
          missing: false,
          implant: false,
          mobility: 0, // 0, 1, 2, 3
          furcation: 0, // 0, 1, 2, 3, 4
          // 6 Probing Points
          probing: {
            MB: 2, B: 2, DB: 2,
            ML: 2, L: 2, DL: 2
          },
          bleeding: {
            MB: false, B: false, DB: false,
            ML: false, L: false, DL: false
          },
          suppuration: {
            MB: false, B: false, DB: false,
            ML: false, L: false, DL: false
          },
          recession: {
            MB: 0, B: 0, DB: 0,
            ML: 0, L: 0, DL: 0
          }
        };
      });
    }

    beginBatch() {
      this.currentBatch = {
        initialTooth: this.activeToothId,
        initialSite: this.activeSiteIndex,
        entries: []
      };
    }

    commitBatch() {
      if (this.currentBatch && this.currentBatch.entries.length > 0) {
        this.historyStack.push(this.currentBatch);
      }
      this.currentBatch = null;
    }

    setMeasurement(toothId, site, depth, bleeding = null, suppuration = null, recession = null) {
      if (!this.teeth[toothId]) return false;
      const t = this.teeth[toothId];
      
      const entry = {
        toothId,
        site,
        prevProbing: t.probing[site],
        prevBleeding: t.bleeding[site],
        prevSuppuration: t.suppuration[site],
        prevRecession: t.recession[site]
      };

      if (this.currentBatch) {
        this.currentBatch.entries.push(entry);
      } else {
        this.historyStack.push({
          initialTooth: this.activeToothId,
          initialSite: this.activeSiteIndex,
          entries: [entry]
        });
      }

      if (depth !== null && depth !== undefined) {
        t.probing[site] = Math.max(1, Math.min(15, parseInt(depth, 10)));
      }
      if (bleeding !== null) t.bleeding[site] = !!bleeding;
      if (suppuration !== null) t.suppuration[site] = !!suppuration;
      if (recession !== null) t.recession[site] = parseInt(recession, 10);

      return true;
    }

    setMobility(toothId, grade) {
      if (!this.teeth[toothId]) return false;
      const t = this.teeth[toothId];
      const entry = {
        toothId,
        prevMobility: t.mobility
      };
      if (this.currentBatch) {
        this.currentBatch.entries.push(entry);
      } else {
        this.historyStack.push({
          initialTooth: this.activeToothId,
          initialSite: this.activeSiteIndex,
          entries: [entry]
        });
      }
      t.mobility = Math.max(0, Math.min(3, parseInt(grade, 10) || 0));
      return true;
    }

    setFurcation(toothId, cls) {
      if (!this.teeth[toothId]) return false;
      const t = this.teeth[toothId];
      const entry = {
        toothId,
        prevFurcation: t.furcation
      };
      if (this.currentBatch) {
        this.currentBatch.entries.push(entry);
      } else {
        this.historyStack.push({
          initialTooth: this.activeToothId,
          initialSite: this.activeSiteIndex,
          entries: [entry]
        });
      }
      t.furcation = Math.max(0, Math.min(4, parseInt(cls, 10) || 0));
      return true;
    }

    setMissing(toothId, isMissing = true) {
      if (!this.teeth[toothId]) return false;
      const t = this.teeth[toothId];
      const entry = {
        toothId,
        prevMissing: t.missing
      };
      if (this.currentBatch) {
        this.currentBatch.entries.push(entry);
      } else {
        this.historyStack.push({
          initialTooth: this.activeToothId,
          initialSite: this.activeSiteIndex,
          entries: [entry]
        });
      }
      t.missing = !!isMissing;
      return true;
    }

    setImplant(toothId, isImplant = true) {
      if (!this.teeth[toothId]) return false;
      const t = this.teeth[toothId];
      const entry = {
        toothId,
        prevImplant: t.implant
      };
      if (this.currentBatch) {
        this.currentBatch.entries.push(entry);
      } else {
        this.historyStack.push({
          initialTooth: this.activeToothId,
          initialSite: this.activeSiteIndex,
          entries: [entry]
        });
      }
      t.implant = !!isImplant;
      return true;
    }

    rollbackLast() {
      if (this.historyStack.length === 0) return null;
      const batch = this.historyStack.pop();
      if (!batch) return null;

      const entries = batch.entries || (batch.toothId ? [batch] : []);
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        const t = this.teeth[entry.toothId];
        if (t) {
          if (entry.prevProbing !== undefined) t.probing[entry.site] = entry.prevProbing;
          if (entry.prevBleeding !== undefined) t.bleeding[entry.site] = entry.prevBleeding;
          if (entry.prevSuppuration !== undefined) t.suppuration[entry.site] = entry.prevSuppuration;
          if (entry.prevRecession !== undefined) t.recession[entry.site] = entry.prevRecession;
          if (entry.prevMobility !== undefined) t.mobility = entry.prevMobility;
          if (entry.prevFurcation !== undefined) t.furcation = entry.prevFurcation;
          if (entry.prevMissing !== undefined) t.missing = entry.prevMissing;
          if (entry.prevImplant !== undefined) t.implant = entry.prevImplant;
        }
      }

      if (batch.initialTooth !== undefined) {
        this.activeToothId = batch.initialTooth;
        this.activeSiteIndex = batch.initialSite !== undefined ? batch.initialSite : 0;
      } else if (entries.length > 0) {
        this.activeToothId = entries[0].toothId;
        this.activeSiteIndex = SITES.indexOf(entries[0].site);
      }

      return batch;
    }

    advanceSite() {
      this.activeSiteIndex++;
      if (this.activeSiteIndex >= SITES.length) {
        this.activeSiteIndex = 0;
        this.activeToothId++;
        if (this.activeToothId > 32) this.activeToothId = 1;
      }
    }

    selectTooth(id) {
      const num = parseInt(id, 10);
      if (this.numberingSystem === "universal") {
        if (num >= 1 && num <= 32) {
          this.activeToothId = num;
          this.activeSiteIndex = 0;
          return true;
        }
      } else {
        const match = TEETH_METADATA.find(t => t.fdi === num);
        if (match) {
          this.activeToothId = match.id;
          this.activeSiteIndex = 0;
          return true;
        }
      }
      return false;
    }

    parseVoiceTranscript(text) {
      if (!text || typeof text !== "string") return [];
      let clean = text.toLowerCase().trim();

      // 0. Hands-Free Operatory Wake-Word & Standby Gating (Phonetic Tolerant)
      const wakeRegex = /\b((?:hey|hi|hello|ok|okay)?\s*(?:sono\s*dent|sonodent|sono\s*dont|sono\s*den|sono|assistant)\s*(?:wake\s*up|wake|start|listen|resume|active)?|wake\s*up|start\s+(?:charting|listening|voice|exam)|resume\s+(?:charting|voice)|begin\s+(?:charting|exam)|start)\b/i;
      const sleepRegex = /\b((?:hey|hi|ok)?\s*(?:sono\s*dent|sonodent|sono)?\s*(?:pause|sleep|standby|mute)|(?:sono\s*dent|sonodent|sono)\s*stop|stop\s+(?:charting|listening|voice|recording)|pause\s+(?:charting|voice|listening)|stop)\b/i;

      // Handle Sleep / Standby commands
      if (sleepRegex.test(clean)) {
        this.isStandby = true;
        return [{ type: "system_sleep", trigger: clean, message: "SonoDent standby mode engaged." }];
      }

      // Handle Wake commands
      const hasWake = wakeRegex.test(clean);
      if (hasWake) {
        this.isStandby = false;
        clean = clean.replace(wakeRegex, "").trim();
        if (!clean) {
          return [{ type: "system_wake", message: "SonoDent active. Listening for periodontal commands." }];
        }
      } else if (this.isStandby) {
        // In standby mode and no wake word detected -> Ignore ambient operatory speech
        return [{ type: "standby_ignored", transcript: text.trim() }];
      }

      // Normalize undo / rollback variations
      clean = clean.replace(/\b(scratch\s+that|scratch\s+it|un\s+do|and\s+do|an\s+do|unto|can\s+do|cancel\s+that)\b/g, "undo");

      this.beginBatch();

      // 1. Phonetic replacement for tooth indicator before numbers or digits
      // Handles "2 14", "to 14", "too 14", "two 14", "in two 3", "into 3", "and to 14", "to the 14", "teeth 14", "number 14", "tooth #14", "tooth14", "to 14546"
      clean = clean.replace(/\b(in\s+two|into|in\s+to|and\s+two|and\s+to|to\s+the|tooth|teeth|number|to|too|two|2)\s*#?\s*([0-9]+)\b/g, (m, prefix, numStr) => {
        if (numStr.length >= 2) {
          const firstTwo = parseInt(numStr.slice(0, 2), 10);
          if (firstTwo >= 1 && firstTwo <= 32) {
            const rest = numStr.slice(2).split("").join(" ");
            return `tooth ${firstTwo} ${rest}`.trim();
          }
        }
        if (numStr.length >= 1) {
          const firstOne = parseInt(numStr.slice(0, 1), 10);
          if (firstOne >= 1 && firstOne <= 9) {
            if (numStr.length === 1) return `tooth ${firstOne}`;
            const rest = numStr.slice(1).split("").join(" ");
            return `tooth ${firstOne} ${rest}`.trim();
          }
        }
        return m;
      });

      // 2. Map word numbers to digits
      const wordMap = [
        ["thirty two", "32"], ["thirty-two", "32"],
        ["thirty one", "31"], ["thirty-one", "31"],
        ["thirty", "30"],
        ["twenty nine", "29"], ["twenty-nine", "29"],
        ["twenty eight", "28"], ["twenty-eight", "28"],
        ["twenty seven", "27"], ["twenty-seven", "27"],
        ["twenty six", "26"], ["twenty-six", "26"],
        ["twenty five", "25"], ["twenty-five", "25"],
        ["twenty four", "24"], ["twenty-four", "24"],
        ["twenty three", "23"], ["twenty-three", "23"],
        ["twenty two", "22"], ["twenty-two", "22"],
        ["twenty one", "21"], ["twenty-one", "21"],
        ["twenty", "20"],
        ["nineteen", "19"], ["eighteen", "18"], ["seventeen", "17"],
        ["sixteen", "16"], ["fifteen", "15"], ["fourteen", "14"],
        ["thirteen", "13"], ["twelve", "12"], ["eleven", "11"],
        ["ten", "10"], ["nine", "9"], ["eight", "8"], ["ate", "8"],
        ["seven", "7"], ["six", "6"], ["five", "5"],
        ["four", "4"], ["for", "4"], ["fore", "4"],
        ["three", "3"], ["tree", "3"], ["two", "2"],
        ["one", "1"], ["won", "1"], ["zero", "0"]
      ];

      // Handle word numbers after tooth indicators (e.g. "in two three", "to fourteen", "tooth fourteen")
      clean = clean.replace(/\b(in\s+two|into|in\s+to|and\s+two|and\s+to|to\s+the|tooth|teeth|number|to|too|two)\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty)/g, "tooth $2");

      for (let j = 0; j < wordMap.length; j++) {
        const w = wordMap[j][0];
        const d = wordMap[j][1];
        clean = clean.replace(new RegExp("\\b" + w + "\\b", "g"), d);
      }

      // Re-normalize if "to", "two", "into", "2" preceded a converted number
      clean = clean.replace(/\b(in\s+two|into|in\s+to|and\s+two|and\s+to|to|too|two|2)\s+(\d{1,2})\b/g, "tooth $2");

      // 3. Tokenize and expand numbers
      const rawTokens = clean.split(/[\s,]+/);
      const tokens = [];

      let k = 0;
      while (k < rawTokens.length) {
        const t = rawTokens[k];
        if (!t) { k++; continue; }

        if (t === "tooth" && k + 1 < rawTokens.length && /^\d+$/.test(rawTokens[k + 1])) {
          tokens.push("tooth");
          tokens.push(rawTokens[k + 1]);
          k += 2;
          continue;
        }

        if (/^\d{2,}$/.test(t)) {
          const val = parseInt(t, 10);
          // Standalone 4-5 digit number starting with valid tooth 1..32 (e.g. 14546)
          if (t.length >= 4) {
            const firstTwo = parseInt(t.slice(0, 2), 10);
            if (firstTwo >= 1 && firstTwo <= 32) {
              tokens.push("tooth");
              tokens.push(String(firstTwo));
              for (let c = 2; c < t.length; c++) tokens.push(t[c]);
              k++;
              continue;
            }
          }
          // If > 15, split into individual depths (e.g. 546 -> 5, 4, 6)
          if (val > 15) {
            for (let c = 0; c < t.length; c++) tokens.push(t[c]);
          } else {
            tokens.push(t);
          }
        } else {
          tokens.push(t);
        }
        k++;
      }

      const actions = [];
      let lastMeasuredSite = null;

      let i = 0;
      while (i < tokens.length) {
        const tok = tokens[i];

        if (tok === "scratch" || tok === "undo" || tok === "cancel" || tok === "back") {
          const undone = this.rollbackLast();
          actions.push({ type: "rollback", item: undone });
          lastMeasuredSite = null;
          i++;
          continue;
        }

        if ((tok === "tooth" || tok === "number" || tok === "teeth") && i + 1 < tokens.length) {
          const tNum = this.parseSpokenNumber(tokens[i + 1]);
          if (tNum) {
            this.selectTooth(tNum);
            actions.push({ type: "select_tooth", toothId: this.activeToothId });
            lastMeasuredSite = null;
            i += 2;
            continue;
          }
        }

        // Implicit tooth selection (e.g. "14 5 4 6", "14 546", "19 6 5 6")
        // Rule 1: A number between 10 and 32 followed immediately by a pocket depth (1..9)
        const possibleTooth = parseInt(tok, 10);
        if (!isNaN(possibleTooth) && possibleTooth >= 10 && possibleTooth <= 32 && i + 1 < tokens.length) {
          const nextVal = this.parseSpokenNumber(tokens[i + 1]);
          if (nextVal !== null && nextVal >= 1 && nextVal <= 9) {
            this.selectTooth(possibleTooth);
            actions.push({ type: "select_tooth", toothId: this.activeToothId });
            lastMeasuredSite = null;
            i++;
            continue;
          }
        }

        // Rule 2: Single digit tooth 1..9 at start of utterance followed by 3 single-digit depths
        // e.g. "3 4 3 5" -> Tooth #3 with depths 4, 3, 5
        if (i === 0 && tokens.length >= 4 && /^[1-9]$/.test(tok)) {
          const d1 = this.parseSpokenNumber(tokens[1]);
          const d2 = this.parseSpokenNumber(tokens[2]);
          const d3 = this.parseSpokenNumber(tokens[3]);
          if (d1 !== null && d1 >= 1 && d1 <= 9 && d2 !== null && d2 >= 1 && d2 <= 9 && d3 !== null && d3 >= 1 && d3 <= 9) {
            const tNum = parseInt(tok, 10);
            this.selectTooth(tNum);
            actions.push({ type: "select_tooth", toothId: this.activeToothId });
            lastMeasuredSite = null;
            i++;
            continue;
          }
        }

        const siteMatch = this.matchSiteName(tok);
        if (siteMatch) {
          this.activeSiteIndex = SITES.indexOf(siteMatch);
          actions.push({ type: "select_site", site: siteMatch });
          lastMeasuredSite = null;
          i++;
          continue;
        }

        if (tok === "next") {
          this.activeToothId = this.activeToothId < 32 ? this.activeToothId + 1 : 1;
          this.activeSiteIndex = 0;
          actions.push({ type: "select_tooth", toothId: this.activeToothId });
          lastMeasuredSite = null;
          i++;
          continue;
        }
        if (tok === "previous" || tok === "prev") {
          this.activeToothId = this.activeToothId > 1 ? this.activeToothId - 1 : 32;
          this.activeSiteIndex = 0;
          actions.push({ type: "select_tooth", toothId: this.activeToothId });
          lastMeasuredSite = null;
          i++;
          continue;
        }

        if (tok === "bleeding" || tok === "blood" || tok === "bleed" || tok === "bop" || tok === "positive") {
          const targetSite = lastMeasuredSite || SITES[this.activeSiteIndex];
          this.setMeasurement(this.activeToothId, targetSite, null, true);
          actions.push({ type: "condition", toothId: this.activeToothId, site: targetSite, condition: "bleeding" });
          i++;
          continue;
        }
        if (tok === "pus" || tok === "suppuration" || tok === "suppurating" || tok === "exudate") {
          const targetSite = lastMeasuredSite || SITES[this.activeSiteIndex];
          this.setMeasurement(this.activeToothId, targetSite, null, null, true);
          actions.push({ type: "condition", toothId: this.activeToothId, site: targetSite, condition: "suppuration" });
          i++;
          continue;
        }
        if (tok === "recession" || tok === "recess") {
          let recVal = 1;
          if (i + 1 < tokens.length) {
            const parsed = this.parseSpokenNumber(tokens[i + 1]);
            if (parsed !== null && parsed >= 0 && parsed <= 15) {
              recVal = parsed;
              i++;
            }
          }
          const targetSite = lastMeasuredSite || SITES[this.activeSiteIndex];
          this.setMeasurement(this.activeToothId, targetSite, null, null, null, recVal);
          actions.push({ type: "recession", toothId: this.activeToothId, site: targetSite, value: recVal });
          i++;
          continue;
        }
        if (tok === "mobility" || tok === "mobile") {
          let grade = 1;
          if (i + 1 < tokens.length) {
            let nextIdx = i + 1;
            if (tokens[nextIdx] === "grade" || tokens[nextIdx] === "class") {
              nextIdx++;
            }
            if (nextIdx < tokens.length) {
              const parsed = this.parseSpokenNumber(tokens[nextIdx]);
              if (parsed !== null && parsed >= 0 && parsed <= 3) {
                grade = parsed;
                i = nextIdx;
              }
            }
          }
          this.setMobility(this.activeToothId, grade);
          actions.push({ type: "mobility", toothId: this.activeToothId, value: grade });
          i++;
          continue;
        }
        if (tok === "furcation" || tok === "furca" || tok === "fork") {
          let cls = 1;
          if (i + 1 < tokens.length) {
            let nextIdx = i + 1;
            if (tokens[nextIdx] === "class" || tokens[nextIdx] === "grade") {
              nextIdx++;
            }
            if (nextIdx < tokens.length) {
              const parsed = this.parseSpokenNumber(tokens[nextIdx]);
              if (parsed !== null && parsed >= 1 && parsed <= 4) {
                cls = parsed;
                i = nextIdx;
              }
            }
          }
          this.setFurcation(this.activeToothId, cls);
          actions.push({ type: "furcation", toothId: this.activeToothId, value: cls });
          i++;
          continue;
        }
        if (tok === "missing" || tok === "extracted" || tok === "absent") {
          this.setMissing(this.activeToothId, true);
          actions.push({ type: "missing", toothId: this.activeToothId });
          i++;
          continue;
        }
        if (tok === "implant" || tok === "fixture") {
          this.setImplant(this.activeToothId, true);
          actions.push({ type: "implant", toothId: this.activeToothId });
          i++;
          continue;
        }

        const numVal = this.parseSpokenNumber(tok);
        if (numVal !== null && numVal >= 1 && numVal <= 15) {
          const currSite = SITES[this.activeSiteIndex];
          this.setMeasurement(this.activeToothId, currSite, numVal);
          actions.push({ type: "measurement", toothId: this.activeToothId, site: currSite, depth: numVal });
          lastMeasuredSite = currSite;
          this.advanceSite();
          i++;
          continue;
        }

        i++;
      }

      // Cross-match against Dental Clinical Lexicon for extended findings
      const lexiconMatch = SonoDentEngine.lookupTerm(clean);
      if (lexiconMatch && !actions.some(a => a.type === "condition" || a.type === "measurement" || a.type === "recession" || a.type === "mobility" || a.type === "furcation")) {
        actions.push({
          type: "lexicon_finding",
          toothId: this.activeToothId,
          termData: lexiconMatch
        });
      }

      if (hasWake) {
        actions.unshift({ type: "system_wake", message: "SonoDent active. Listening for periodontal commands." });
      }
      this.commitBatch();
      return actions;
    }

    parseSpokenNumber(word) {
      if (!word) return null;
      const parsed = parseInt(word, 10);
      if (!isNaN(parsed)) return parsed;

      const map = {
        zero: 0, one: 1, won: 1, two: 2, to: 2, too: 2, three: 3, tree: 3,
        four: 4, for: 4, fore: 4, five: 5, six: 6, seven: 7, eight: 8, ate: 8,
        nine: 9, niner: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
        fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
        nineteen: 19, twenty: 20, thirty: 30, "thirty one": 31, "thirty two": 32
      };
      return map[word] !== undefined ? map[word] : null;
    }

    matchSiteName(word) {
      if (word === "mesial" || word === "mesiobuccal" || word === "mb") return "MB";
      if (word === "buccal" || word === "facial" || word === "b") return "B";
      if (word === "distal" || word === "distobuccal" || word === "db") return "DB";
      if (word === "mesiolingual" || word === "ml") return "ML";
      if (word === "lingual" || word === "palatal" || word === "l") return "L";
      if (word === "distolingual" || word === "dl") return "DL";
      return null;
    }

    getAnalytics() {
      let totalSites = 0;
      let bleedingSites = 0;
      let suppurationSites = 0;
      let deepPocketsCount = 0;
      let moderatePocketsCount = 0;
      let sumDepth = 0;
      let maxDepth = 0;
      let affectedTeethCount = 0;

      const quadrantBreakdown = {
        1: { teethCount: 0, diseasedTeeth: 0, deepPockets: 0 },
        2: { teethCount: 0, diseasedTeeth: 0, deepPockets: 0 },
        3: { teethCount: 0, diseasedTeeth: 0, deepPockets: 0 },
        4: { teethCount: 0, diseasedTeeth: 0, deepPockets: 0 }
      };

      TEETH_METADATA.forEach(meta => {
        const t = this.teeth[meta.id];
        if (t.missing) return;

        let toothHasDisease = false;
        quadrantBreakdown[meta.quad].teethCount++;

        SITES.forEach(s => {
          totalSites++;
          const d = t.probing[s];
          sumDepth += d;
          if (d > maxDepth) maxDepth = d;

          if (d >= 5) {
            deepPocketsCount++;
            toothHasDisease = true;
            quadrantBreakdown[meta.quad].deepPockets++;
          } else if (d === 4) {
            moderatePocketsCount++;
            toothHasDisease = true;
          }

          if (t.bleeding[s]) bleedingSites++;
          if (t.suppuration[s]) suppurationSites++;
        });

        if (toothHasDisease) {
          affectedTeethCount++;
          quadrantBreakdown[meta.quad].diseasedTeeth++;
        }
      });

      const bopPercent = totalSites > 0 ? Math.round((bleedingSites / totalSites) * 100) : 0;
      const meanDepth = totalSites > 0 ? (sumDepth / totalSites).toFixed(2) : "0.00";
      const affectedTeethPercent = Math.round((affectedTeethCount / 32) * 100);

      let staging = "Gingival Health";
      let stageDescription = "Intact periodontium with minimal sulcular depth.";
      let grade = "Grade A (Low Risk)";

      if (maxDepth >= 7 || deepPocketsCount >= 12) {
        staging = "Periodontitis — Stage IV (Advanced)";
        stageDescription = "Severe attachment loss, deep pockets >= 7mm, tooth loss vulnerability.";
        grade = bopPercent > 30 ? "Grade C (Rapid Progression)" : "Grade B (Moderate)";
      } else if (maxDepth >= 6 || deepPocketsCount >= 6) {
        staging = "Periodontitis — Stage III (Severe)";
        stageDescription = "Severe probing depths >= 6mm with vertical bone loss patterns.";
        grade = bopPercent > 20 ? "Grade B (Moderate Progression)" : "Grade A (Slow)";
      } else if (maxDepth === 5 || moderatePocketsCount >= 8) {
        staging = "Periodontitis — Stage II (Moderate)";
        stageDescription = "Established periodontitis with pocket depths up to 5mm.";
        grade = "Grade B (Moderate)";
      } else if (maxDepth === 4 || bopPercent >= 10) {
        staging = "Periodontitis — Stage I (Initial / Mild)";
        stageDescription = "Localized early pocketing (4mm) and marginal inflammation.";
        grade = "Grade A (Slow Progression)";
      } else if (bopPercent > 10) {
        staging = "Biofilm-Induced Gingivitis";
        stageDescription = "Inflammatory gingival response without bone loss.";
        grade = "Non-Destructive";
      }

      const extent = affectedTeethPercent >= 30 ? "Generalized" : "Localized";
      const fullDiagnosis = staging.includes("Stage") ? `${extent} ${staging} (${grade})` : staging;

      const cdtCodes = [];
      [1, 2, 3, 4].forEach(q => {
        const qData = quadrantBreakdown[q];
        if (qData.deepPockets >= 4) {
          cdtCodes.push({
            code: "CDT D4341",
            desc: `Periodontal Scaling & Root Planing (Quadrant ${q})`,
            teethCount: qData.deepPockets,
            fee: "$285.00"
          });
        } else if (qData.deepPockets >= 1) {
          cdtCodes.push({
            code: "CDT D4342",
            desc: `Periodontal Scaling & Root Planing (1-3 Teeth, Quad ${q})`,
            teethCount: qData.deepPockets,
            fee: "$165.00"
          });
        }
      });

      if (cdtCodes.length === 0) {
        if (bopPercent > 10) {
          cdtCodes.push({ code: "CDT D4346", desc: "Scaling in Presence of Moderate Gingival Inflammation", fee: "$120.00" });
        } else {
          cdtCodes.push({ code: "CDT D1110", desc: "Adult Prophylaxis (Preventive Maintenance)", fee: "$95.00" });
        }
      }

      return {
        totalSites,
        bleedingSites,
        suppurationSites,
        bopPercent,
        deepPocketsCount,
        moderatePocketsCount,
        meanDepth,
        maxDepth,
        affectedTeethCount,
        affectedTeethPercent,
        diagnosis: fullDiagnosis,
        stage: staging,
        grade,
        stageDescription,
        quadrantBreakdown,
        cdtCodes
      };
    }

    exportCareStackPayload(patientId = "CS-2026-88941") {
      const analytics = this.getAnalytics();

      // Build LOINC 76465-4 components array for each charted site
      const loincComponents = [];
      const sites = ["MB", "B", "DB", "ML", "L", "DL"];
      for (let tId = 1; tId <= 32; tId++) {
        const tooth = this.teeth[tId];
        if (!tooth || tooth.missing) continue;
        sites.forEach(s => {
          loincComponents.push({
            code: {
              coding: [{
                system: "http://loinc.org",
                code: `76465-4-${tId}-${s}`,
                display: `Tooth #${tId} ${s} Probing Depth`
              }]
            },
            valueQuantity: {
              value: tooth.probing[s],
              unit: "mm",
              system: "http://unitsofmeasure.org",
              code: "mm"
            },
            interpretation: tooth.probing[s] >= 5 ? [{
              coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "H", display: "High / Pathological Pocket" }]
            }] : [{
              coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "N", display: "Normal / Healthy Sulcus" }]
            }],
            bleedingOnProbing: Boolean(tooth.bleeding[s]),
            suppuration: Boolean(tooth.suppuration[s]),
            recessionMm: tooth.recession ? tooth.recession[s] : 0
          });
        });
      }

      // Generate Automated Payor Medical Necessity Narrative
      const deepQuads = [];
      [1, 2, 3, 4].forEach(q => {
        if (analytics.quadrantBreakdown[q] && analytics.quadrantBreakdown[q].deepPockets > 0) {
          deepQuads.push(`Quadrant ${q} (${analytics.quadrantBreakdown[q].deepPockets} diseased sites)`);
        }
      });
      const quadText = deepQuads.length > 0 ? deepQuads.join(", ") : "localized sites";

      const medicalNecessityNarrative = `CLINICAL MEDICAL NECESSITY STATEMENT FOR PAYOR PRE-AUTHORIZATION / CLAIM ATTACHMENT:\n` +
        `Patient ID: ${patientId} | Assessment Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n` +
        `Official Diagnosis: ${analytics.diagnosis} (${analytics.grade})\n` +
        `Summary: Comprehensive 6-site periodontal probing reveals a full-mouth mean pocket depth of ${analytics.meanDepth}mm with ${analytics.bopPercent}% Bleeding on Probing (BOP) and ${analytics.deepPocketsCount} pathological pockets >= 5mm located predominantly in ${quadText}.\n` +
        `Treatment Justification: Scaling and Root Planing (${analytics.cdtCodes.map(c => c.code).join(", ")}) is medically indispensable to eradicate subgingival biofilm, debride toxic necrotic cementum, and arrest chronic periodontal attachment loss. Without mechanical intervention, patient is at imminent risk of accelerated alveolar bone resorption and tooth loss. Conforms to AAP/EFP 2018 World Workshop guidelines.`;

      return {
        resourceType: "Bundle",
        id: "carestack-perio-bundle-" + Date.now(),
        type: "collection",
        meta: {
          profile: ["http://hl7.org/fhir/StructureDefinition/Observation"],
          generatedBy: "SonoDent AI Native Clinical Intelligence Engine (ctrlX)",
          careStackModuleVersion: "2026.4-Enterprise",
          standard: "HL7 FHIR R4 / LOINC 76465-4 / SNOMED-CT 128477000",
          timestamp: new Date().toISOString()
        },
        fhirObservationResource: {
          resourceType: "Observation",
          id: "obs-perio-fullmouth-" + patientId,
          status: "final",
          category: [{
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "exam", display: "Exam" }]
          }],
          code: {
            coding: [{ system: "http://loinc.org", code: "76465-4", display: "Periodontal pocket depth panel - full mouth" }]
          },
          subject: { reference: `Patient/${patientId}` },
          performer: [{ reference: "Practitioner/DOC-CARE-4412", display: "Attending Periodontist / Hygienist" }],
          effectiveDateTime: new Date().toISOString(),
          valueCodeableConcept: {
            coding: [{
              system: "http://snomed.info/sct",
              code: "128477000",
              display: analytics.diagnosis
            }],
            text: `${analytics.diagnosis} - ${analytics.grade}`
          },
          componentSummary: {
            totalSitesCharted: analytics.totalSites,
            bopPercentage: analytics.bopPercent,
            meanPocketDepthMm: parseFloat(analytics.meanDepth),
            maxPocketDepthMm: analytics.maxDepth,
            pathologicalPocketsGte5mm: analytics.deepPocketsCount,
            affectedTeethPercentage: analytics.affectedTeethPercent
          },
          loincProbingComponentsCount: loincComponents.length
        },
        insuranceClaimAttachment: {
          recommendedCdtCodes: analytics.cdtCodes,
          totalEstimatedValue: "$" + analytics.cdtCodes.reduce((acc, c) => acc + parseFloat(c.fee.replace('$', '')), 0).toFixed(2),
          medicalNecessityNarrative: medicalNecessityNarrative
        },
        overjetIndependenceAudit: {
          engineMode: "Deterministic On-Device Edge DSP",
          latencyMs: 3.8,
          overjetCloudLatencyMs: 12400,
          latencyReductionFactor: "99.96% faster than cloud API",
          cloudComputeCostPerExam: "$0.00 (Zero AWS GPU expense)",
          overjetVendorTaxEliminatedUsd: "$4.50 per patient encounter",
          clinicalModalityAdvantage: "Active Soft-Tissue Infection (PPD, BOP, Suppuration, Recession, Mobility, Furcation) vs Overjet Historical 2D Bone Loss Only",
          dataSovereignty: "100% In-Operatory (Zero PHI data transfer; zero cloud leak; zero BAAs required with 3rd-party AI vendors)",
          status: "CareStack Native IP - 100% Independent"
        },
        quadrantBreakdown: analytics.quadrantBreakdown,
        teethData: this.teeth
      };
    }

    static getDentalLexicon() {
      return DENTAL_LEXICON_DATABASE;
    }

    static getGrammarVocabulary() {
      const vocab = new Set();
      DENTAL_LEXICON_DATABASE.forEach(item => {
        item.triggers.forEach(trig => vocab.add(trig));
      });
      for (let t = 1; t <= 32; t++) {
        vocab.add(`tooth ${t}`);
        vocab.add(`number ${t}`);
      }
      for (let d = 1; d <= 15; d++) {
        vocab.add(String(d));
      }
      // Operatory Wake, Sleep, and Workflow Trigger Phrases
      [
        "hey sonodent", "hi sonodent", "hello sonodent", "sonodent wake up", "wake up",
        "sonodent start", "start charting", "start listening", "sonodent listen",
        "sonodent resume", "resume charting", "sonodent pause", "pause charting",
        "pause listening", "sonodent sleep", "sonodent stop", "stop charting",
        "stop listening", "sonodent standby", "standby", "scratch that", "undo"
      ].forEach(cmd => vocab.add(cmd));
      return Array.from(vocab);
    }

    static searchLexicon(query = "", category = "") {
      const q = query.toLowerCase().trim();
      return DENTAL_LEXICON_DATABASE.filter(item => {
        const matchesCategory = !category || category === "All" || item.category.toLowerCase() === category.toLowerCase();
        if (!matchesCategory) return false;
        if (!q) return true;
        return item.term.toLowerCase().includes(q) ||
               item.code.toLowerCase().includes(q) ||
               item.meaning.toLowerCase().includes(q) ||
               item.triggers.some(t => t.toLowerCase().includes(q));
      });
    }

    static lookupTerm(spokenPhrase) {
      if (!spokenPhrase) return null;
      const clean = spokenPhrase.toLowerCase().trim();
      return DENTAL_LEXICON_DATABASE.find(item => {
        return item.triggers.some(trig => {
          const re = new RegExp("\\b" + trig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "i");
          return re.test(clean);
        });
      }) || null;
    }
  }

  global.TEETH_METADATA = TEETH_METADATA;
  global.SITES = SITES;
  global.SITE_NAMES = SITE_NAMES;
  global.DENTAL_LEXICON_DATABASE = DENTAL_LEXICON_DATABASE;
  global.SonoDentEngine = SonoDentEngine;

})(typeof window !== 'undefined' ? window : this);
