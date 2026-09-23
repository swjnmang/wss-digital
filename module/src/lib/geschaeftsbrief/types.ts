export interface AnschriftLineOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface AnschriftLine {
  id: string;
  caption: string;
  options: AnschriftLineOption[];
  explanation: string;
  zone: 'zusatz' | 'anschrift';
}

export interface AnschriftenfeldTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  scenario: string;
  facts: string[];
  senderLine: string;
  lines: AnschriftLine[];
}
