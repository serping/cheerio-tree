import type { Cheerio } from 'cheerio'; 
export type RequiredKeys = ({keys, item}:{keys: string[]; item: Record<string, any> }) => boolean;
export type HasElement = ({element, selector}:{element: Cheerio<any>; selector: string}) => boolean;
export type ParseNode = ({
  item, 
  parentElement, 
  parentKey
}:{
  item: Record<string, any>, 
  parentElement: Cheerio<any> | null, 
  parentKey: string 
}) => any[] | string | null;

export type ParseWrapper =({
  item,
  parentElement,
  parentKey
}:{
  item: Record<string, any>,
  parentElement: Cheerio<any> | null,
  parentKey: string
}) => any | any[] | null;

export type RegularNode = {
  name?: string;
  regex: string;
  replace: string;
}
export type SelectorNode = {
  name?: string;
  selector: string;
  is_array?: boolean;
  to_markdown?: boolean;
  split_str?: string;
  attr?: string;
  after_regular?: RegularNode[];
}
export type  CheerioTreeConfig = {
  tree: {
    url?: {
      match: string;
      params?: { [key: string]: Record<string, any> };
    },
    nodes: { [key: string]: Record<string, any> };
  }
}

export type CheerioTreeOptions = {
  body: string;
  base64Img?: boolean;
  clear?: boolean;
  debug?: boolean;
}
