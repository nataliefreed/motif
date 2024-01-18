import * as p5 from 'p5';

export interface Action {
  name: string;
  uuid: string;
  type: 'number' | 'color' | 'string' | 'list' | 'effect';
  category: string;
  value?: string | number | Action[];
  parent?: string;
  children?: Action[];
  effect?: string;
  textLabel?: string;
  params: { [key: string]: any };
  value?: string | number | Action[];
  thumbnail?: string;
  children?: Action[];
  obscured?: boolean;
  pinned?: boolean;
}

export type Effect = {
  name: string;
  textLabel: string;
  category: string;
  tags: string,
  init?: string;
  cursor?: string;
  mouseActionType?: string;
  params: { [key: string]: any;};
  thumbnail?: string;
  render?: (p5Instance: p5, params?: { [key: string]: any }) => void;
  pinnedByDefault?: boolean;
  nestedActions?: { [key: string]: any }[Action];
};

export type ActionEffect = {
  uuid: string,
  effectName: string,
  buttonLabel: string,
  category: string,

  

}