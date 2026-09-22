import {newAntiochVisuals} from './NewAntiochVisuals.js';
import {blackGrailVisuals} from './BlackGrailVisuals.js';
const visuals=new Map([[newAntiochVisuals.index,newAntiochVisuals],[blackGrailVisuals.index,blackGrailVisuals]]);
export const getFactionVisual=index=>visuals.get(index)??newAntiochVisuals;
export const FACTION_VISUALS=visuals;
