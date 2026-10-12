import type { TopicConfig } from '../raum_und_form/engine/types';
import { lb1 } from './topics/lb1';
import { lb2 } from './topics/lb2';
import { lb3 } from './topics/lb3';
import { lb4 } from './topics/lb4';
import { lb5 } from './topics/lb5';
import { lb6 } from './topics/lb6';
import { lb7 } from './topics/lb7';
import { lb8 } from './topics/lb8';

/** Lernbereiche 1–8 der FOS-Vorklasse (LehrplanPLUS Bayern, Mathematik M10) */
export const FOS_TOPICS: TopicConfig[] = [lb1, lb2, lb3, lb4, lb5, lb6, lb7, lb8];

export const FOS_BASE = '/fos-bos';

export function findFosTopic(slug?: string) {
  return FOS_TOPICS.find((t) => t.slug === slug);
}
