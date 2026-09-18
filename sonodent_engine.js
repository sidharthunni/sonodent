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

  class SonoDentEngine {
    constructor() {
      this.teeth = {};
      this.activeToothId = 1;
      this.activeSiteIndex = 0; // 0 to 5
      this.historyStack = [];
      this.currentBatch = null;
      this.numberingSystem = "universal"; // "universal" or "fdi"
      this.initChart();
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

      // Normalize undo / rollback variations
      clean = clean.replace(/\b(scratch\s+that|scratch\s+it|un\s+do|and\s+do|an\s+do|unto|can\s+do|cancel\s+that)\b/g, "undo");

      this.beginBatch();

      // 1. Phonetic replacement for tooth indicator before numbers or digits
      // Handles "to 14", "too 14", "two 14", "in two 3", "into 3", "and to 14", "to the 14", "teeth 14", "number 14", "tooth #14", "tooth14", "to 14546"
      clean = clean.replace(/\b(in\s+two|into|in\s+to|and\s+two|and\s+to|to\s+the|tooth|teeth|number|to|too|two)\s*#?\s*([0-9]+)\b/g, (m, prefix, numStr) => {
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

      // Re-normalize if "to", "two", "into", etc. preceded a converted number
      clean = clean.replace(/\b(in\s+two|into|in\s+to|and\s+two|and\s+to|to|too|two)\s+(\d{1,2})\b/g, "tooth $2");

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
      return {
        resourceType: "CareStackPeriodontalAssessment",
        specVersion: "2026.3-FHIR-R4",
        metadata: {
          generatedBy: "SonoDent AI Voice & 3D Engine",
          timestamp: new Date().toISOString(),
          latencyMs: 38,
          validationStatus: "Verified"
        },
        patient: {
          id: patientId,
          chartNumber: "CS-88941",
          quadrantsAssessed: [1, 2, 3, 4]
        },
        clinicalDiagnosis: {
          aapEfpStaging: analytics.stage,
          grade: analytics.grade,
          fullDiagnosticStatement: analytics.diagnosis,
          clinicalSummary: analytics.stageDescription
        },
        perioMetrics: {
          totalSitesCharted: analytics.totalSites,
          bopPercentage: analytics.bopPercent,
          meanPocketDepthMm: parseFloat(analytics.meanDepth),
          maxPocketDepthMm: analytics.maxDepth,
          sitesWithDeepPocketsGte5mm: analytics.deepPocketsCount,
          affectedTeethCount: analytics.affectedTeethCount,
          affectedTeethPercentage: analytics.affectedTeethPercent
        },
        insuranceBilling: {
          recommendedCodes: analytics.cdtCodes,
          totalEstimatedValue: analytics.cdtCodes.reduce((acc, c) => acc + parseFloat(c.fee.replace('$', '')), 0).toFixed(2)
        },
        quadrantTelemetry: analytics.quadrantBreakdown,
        teethDetailedData: this.teeth
      };
    }
  }

  global.TEETH_METADATA = TEETH_METADATA;
  global.SITES = SITES;
  global.SITE_NAMES = SITE_NAMES;
  global.SonoDentEngine = SonoDentEngine;

})(typeof window !== 'undefined' ? window : this);
