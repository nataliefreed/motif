import * as p5 from 'p5';

export interface Action {
  name: string;
  uuid: string;
  type: 'number' | 'color' | 'string' | 'list' | 'effect';
  category: string;
  value?: string | number | Action[];
  children?: Action[];
  effect?: string;
  dropdownName?: string;
  params?: { [key: string]: any };
  value?: string | number | Action[];
  thumbnail?: string;
  children?: Action[];
}

export type Effect = {
  name: string;
  dropdownName: string;
  category: string;
  tag: string;
  init?: string;
  cursor?: string;
  mouseActionType?: string;
  params?: { [key: string]: any;};
  thumbnail?: string;
  render?: (p5Instance: p5, params?: { [key: string]: any }) => void;
};