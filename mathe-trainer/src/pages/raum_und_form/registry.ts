import type { TopicConfig } from './engine/types';
import { anwendung } from './topics/anwendung';
import { einheiten } from './topics/einheiten';
import { flaechengeometrie } from './topics/flaeche';
import { kegel } from './topics/kegel';
import { kugel } from './topics/kugel';
import { prisma } from './topics/prisma';
import { pyramide } from './topics/pyramide';
import { pythagoras } from './topics/pythagoras';
import { strahlensaetze } from './topics/strahlensaetze';
import { zylinder } from './topics/zylinder';

export const TOPICS: TopicConfig[] = [einheiten, flaechengeometrie, pythagoras, strahlensaetze, kugel, prisma, kegel, pyramide, zylinder, anwendung];

export function findTopic(slug?: string) {
  return TOPICS.find((t) => t.slug === slug);
}
