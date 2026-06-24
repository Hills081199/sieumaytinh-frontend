export type Pos = { label: string; x: number; y: number };

// y is 0 (bottom) -> 50 (midline) for home; positions are in home half coordinates
// x is 0 (left) -> 100 (right)
export const FORMATIONS: Record<string, Pos[]> = {
  "4-4-2": [
    { label: "GK", x: 50, y: 6 },
    { label: "LB", x: 15, y: 20 }, { label: "CB", x: 38, y: 18 }, { label: "CB", x: 62, y: 18 }, { label: "RB", x: 85, y: 20 },
    { label: "LM", x: 15, y: 35 }, { label: "CM", x: 38, y: 33 }, { label: "CM", x: 62, y: 33 }, { label: "RM", x: 85, y: 35 },
    { label: "ST", x: 38, y: 46 }, { label: "ST", x: 62, y: 46 },
  ],
  "4-3-3": [
    { label: "GK", x: 50, y: 6 },
    { label: "LB", x: 15, y: 20 }, { label: "CB", x: 38, y: 18 }, { label: "CB", x: 62, y: 18 }, { label: "RB", x: 85, y: 20 },
    { label: "CM", x: 28, y: 33 }, { label: "CM", x: 50, y: 31 }, { label: "CM", x: 72, y: 33 },
    { label: "LW", x: 18, y: 46 }, { label: "ST", x: 50, y: 47 }, { label: "RW", x: 82, y: 46 },
  ],
  "4-2-3-1": [
    { label: "GK", x: 50, y: 6 },
    { label: "LB", x: 15, y: 20 }, { label: "CB", x: 38, y: 18 }, { label: "CB", x: 62, y: 18 }, { label: "RB", x: 85, y: 20 },
    { label: "CDM", x: 38, y: 30 }, { label: "CDM", x: 62, y: 30 },
    { label: "LAM", x: 20, y: 42 }, { label: "CAM", x: 50, y: 41 }, { label: "RAM", x: 80, y: 42 },
    { label: "ST", x: 50, y: 48 },
  ],
  "3-5-2": [
    { label: "GK", x: 50, y: 6 },
    { label: "CB", x: 28, y: 18 }, { label: "CB", x: 50, y: 16 }, { label: "CB", x: 72, y: 18 },
    { label: "LWB", x: 12, y: 32 }, { label: "CM", x: 35, y: 32 }, { label: "CM", x: 50, y: 30 }, { label: "CM", x: 65, y: 32 }, { label: "RWB", x: 88, y: 32 },
    { label: "ST", x: 38, y: 46 }, { label: "ST", x: 62, y: 46 },
  ],
  "5-3-2": [
    { label: "GK", x: 50, y: 6 },
    { label: "LWB", x: 12, y: 20 }, { label: "CB", x: 30, y: 18 }, { label: "CB", x: 50, y: 16 }, { label: "CB", x: 70, y: 18 }, { label: "RWB", x: 88, y: 20 },
    { label: "CM", x: 30, y: 34 }, { label: "CM", x: 50, y: 32 }, { label: "CM", x: 70, y: 34 },
    { label: "ST", x: 38, y: 46 }, { label: "ST", x: 62, y: 46 },
  ],
  "3-4-3": [
    { label: "GK", x: 50, y: 6 },
    { label: "CB", x: 28, y: 18 }, { label: "CB", x: 50, y: 16 }, { label: "CB", x: 72, y: 18 },
    { label: "LM", x: 15, y: 32 }, { label: "CM", x: 38, y: 32 }, { label: "CM", x: 62, y: 32 }, { label: "RM", x: 85, y: 32 },
    { label: "LW", x: 22, y: 46 }, { label: "ST", x: 50, y: 47 }, { label: "RW", x: 78, y: 46 },
  ],
  "4-1-4-1": [
    { label: "GK", x: 50, y: 6 },
    { label: "LB", x: 15, y: 20 }, { label: "CB", x: 38, y: 18 }, { label: "CB", x: 62, y: 18 }, { label: "RB", x: 85, y: 20 },
    { label: "CDM", x: 50, y: 28 },
    { label: "LM", x: 15, y: 38 }, { label: "CM", x: 38, y: 38 }, { label: "CM", x: 62, y: 38 }, { label: "RM", x: 85, y: 38 },
    { label: "ST", x: 50, y: 48 },
  ],
  "4-5-1": [
    { label: "GK", x: 50, y: 6 },
    { label: "LB", x: 15, y: 20 }, { label: "CB", x: 38, y: 18 }, { label: "CB", x: 62, y: 18 }, { label: "RB", x: 85, y: 20 },
    { label: "LM", x: 12, y: 35 }, { label: "CM", x: 32, y: 33 }, { label: "CM", x: 50, y: 32 }, { label: "CM", x: 68, y: 33 }, { label: "RM", x: 88, y: 35 },
    { label: "ST", x: 50, y: 47 },
  ],
};

export const FORMATION_OPTIONS = Object.keys(FORMATIONS);
