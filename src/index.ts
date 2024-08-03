import cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio'; 
import TurndownService from 'turndown';
import type { RequiredKeys, SelectorNode,  CheerioTreeConfig, CheerioTreeOptions, HasElement, ParseNode, ParseWrapper} from './types';

const turndownService = new TurndownService(); 
export default class CheerioTree{
    cheerio: CheerioAPI;
    debug: boolean;
    duration: boolean;
    base64Img: boolean;
    clear: boolean;
    clearBody: string;
    
    /**
     * 
     * @param body HTML
     * @param clear boolean, default true. if true the style, noscript html tags will be remove
     * @param base64Img boolean, default true. if false the image base64 data will output **imageBase64**, only for key: **thumbnail**
     * @param duration boolean, default false. add parse_duration to meta { meta: { ...meta, parse_duration: "** ms" } }
     * @param debug
     */
    constructor({body, debug = false, clear = false , base64Img = true, duration = false }: CheerioTreeOptions) {
      this.duration = duration; 
      this.debug = debug; 
      this.clear = clear; 
      this.base64Img = base64Img 

      this.clearBody = clear ? this.clearTags(body) : body;
      this.cheerio = cheerio.load(this.clearBody);
    }

    clearTags(body:string){
      return body.replace(/(<style.*?>[\S\s]*?<\/style>|<noscript.*?>[\S\s]*?<\/noscript>)/g,'');
    }

    /**
     * 
     * @param body reload this.cheerio
     */
    load(body:string){
      this.clearBody = this.clear ? this.clearTags(body) : body;
      this.cheerio = cheerio.load(this.clearBody);
    }

    decodeEncodedHTML(encodedText: string) {
      if(!encodedText) return "";

      let decodedText = encodedText.replace(/\\x([0-9A-Fa-f]{2})/g, function (__match, hex) {
          return String.fromCharCode(parseInt(hex, 16));
      });
    
      decodedText = decodedText.replace(/\\u([0-9A-Fa-f]{4})/gi, function (__match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
      });
    
      return decodedText;
    }
  
    html(): string{
      return this.cheerio.html();
    }
  
    parse({ config, beforeParse }: { config:  CheerioTreeConfig, beforeParse?: ({cheerio, body}:{cheerio: CheerioAPI, body?: string;}) => void}) {
      const startTime = new Date().getTime(); 
      const { tree: { nodes } } = config;
      let data: any = {};

      if(beforeParse) beforeParse({cheerio: this.cheerio, body: this.clearBody});

      for (const [key, value] of Object.entries(nodes)) {
        data[key] = this.parseWrapper({item: value, parentElement: null, parentKey: `nodes.${key}` }); 
      }
      const endTime = new Date().getTime();
      const execTimeMs = (endTime - startTime);
      
      if(this.duration){
        if(!data['meta']) data['meta'] = {};
        data['meta'] = {
          ...data['meta'],
          parse_duration: `${execTimeMs} ms`,
        }
      }
      
      return data;
    }

    requiredKeys: RequiredKeys =({ keys, item }) =>{
      return keys.every(key => key in item);
    }
  
    validateWrapper(item: Record<string, any>) {
      try{
        return this.requiredKeys({keys: ['selector', 'list', 'normal'], item}); 
      }catch(error){
        return false;
      }
    }
  
    hasElement: HasElement = ({element, selector}) => {
      return this.cheerio(element).find(selector).length > 0;
    }
   
    parseNode: ParseNode =({item, parentElement, parentKey} ) =>{
      try{
        if (typeof item !== 'object') {
          throw new Error('Invalid selector item');
        }
        let itemSelector = item as SelectorNode;
        
        const { selector, attr, after_regular, is_array, split_str, to_markdown } = itemSelector;
        
        if (!selector) {
          throw new Error(`Error >>>> ${parentKey}: selector is required`);
        }
        const initValue =(value: string)  =>{
          let splitValue: any[] = [];
          if (after_regular) {
            for (const replace_regex of after_regular) {
              const regex_str = replace_regex.regex;
              const replace_str = replace_regex.replace;
              if(regex_str){
                let regex = new RegExp(regex_str, 'g');
                value = value.replace(regex,(replace_str ? replace_str : ''));
              }else{
                // console.log("regex not set");
              }
            }
          }
          if(split_str){
            splitValue = value.split(split_str);
          }else{
            splitValue = [value]
          }
          
          splitValue = splitValue.map(val =>{
            if('to_i' in itemSelector){
              return parseInt(val, 10)
            }else if('to_f' in itemSelector){
              return parseFloat(val)
            }
            const isthumbnail = /thumbnail$/.test(parentKey);
            if( isthumbnail && !this.base64Img && val.includes('data:image/') ){
              val = "imageBase64";
            }else if(isthumbnail){
              val = this.decodeEncodedHTML(val);
            }
            return val.trim();
          })
          if(split_str) return splitValue;
          return splitValue[0];
        }
      
        const elements = parentElement ? (selector == 'SELF' ? this.cheerio(parentElement) : this.cheerio(parentElement).find(selector)) : this.cheerio(selector);
      
        let value: string | null  = null; 
        let values: any[] = [];
        
        if(elements.length == 0){
          return is_array ? [] : null;
        }

        if(is_array){ 
          elements.each((__index, element) => {
            let val: string | null = null;
            if (attr) {
              val = attr === 'html' ?  this.cheerio(element).html() : this.cheerio(element).attr(attr) || null;
              if(val && to_markdown){
                val = turndownService.turndown(val);
              }
            }else{
              val =  this.cheerio(element).text().trim(); 
            }
            if(val !== null) values.push(initValue(val));
          });
          return values;
        }else{
          if (attr) {
            value = attr === 'html' ? this.cheerio(elements).first().html() : this.cheerio(elements).first().attr(attr) || null;
            if(value && to_markdown){
              value = turndownService.turndown(value);
            }
          }else{
            value = this.cheerio(elements).first().text().trim();
          }
          return value ? initValue(value) : null;
        } 
      }catch(error: any){
        console.error("parentKey",parentKey, item);
        throw error;
      }
    }
  
    parseWrapper: ParseWrapper =({
      item,
      parentElement,
      parentKey
    }) =>{
        
      let data: any | any[] = [];
      if('wrapper' in item){
        parentKey = `${parentKey}.wrapper`;
        const wrapper = item.wrapper;
        let positionCount = 0;
        if(this.validateWrapper(wrapper)){
          
          try{
            const selector = wrapper.selector as string;
            const {  
              list, // boolean 
              normal, // default type: normal
              position, // boolean, 
              remove_children_node
            } = wrapper as {
              list: boolean;
              normal: Record<string, any>;
              position: boolean;
              remove_children_node: { selector: string; };
            };
            const elements = parentElement ? (selector == 'SELF' ? this.cheerio(parentElement) : this.cheerio(parentElement).find(selector)) : this.cheerio(selector);

            const other_types: Record<string, any>[]  = ('other_types' in wrapper) ? wrapper.other_types : [];
            if(elements.length == 0) return list ? data : null;
      
            
            elements.each((__index, element) => {
              if(remove_children_node && remove_children_node.selector) this.cheerio(element).find(remove_children_node.selector).remove();
              const itemData: any = {};
              let dataConfig: Record<string, any> | null = null;
    
              // data type match
              for (const type of other_types) {
                if(!type.validate || !type.validate.selector) throw `other_types validate required`;
                if(dataConfig) continue;
                
                // validate node
                if(type.name === 'normal' && (!this.hasElement({element, selector: type.validate.selector}) || (type.name === 'normal' && type.validate.except && this.hasElement({element, selector: type.validate.except})))){
                  return;
                }else if(this.hasElement({element, selector: type.validate.selector})){
                  // except node
                  if(type.validate.except && this.hasElement({element, selector: type.validate.except})) continue;
                  dataConfig = {index: (type.rename ?? type.name),...wrapper[type.name]};
                }
              }
              // default data type normal
              if(!dataConfig) dataConfig = {index: 'normal', ...normal} as Record<string, any>;
    
              // position
              if((dataConfig['position'] && dataConfig['position'] != false) || (dataConfig['position'] == undefined && position)){
                positionCount += 1;
                itemData['position'] = positionCount;
              }
    
              if('wrapper' in dataConfig){
                itemData[dataConfig['index']] = this.parseWrapper({item: dataConfig, parentElement: element, parentKey}); 
              }else{ 
                for (const [key, value] of  Object.entries(dataConfig)) {
                  // skip keys
                  if( ['remove_children_node', 'index', 'position'].includes(key) ) continue;
                  let keyPath = `${parentKey}.${dataConfig['index']}.${key}`;
                  let itemValue;
                   
                  if('wrapper' in value){
                    itemValue = this.parseWrapper({item: value, parentElement: element, parentKey: keyPath});
                    if(itemValue === null || (Object.keys(itemValue).length === 0 && !this.debug)) continue;
                  }else{
                    itemValue = this.parseNode({item: value, parentElement: element, parentKey: keyPath });
                  }
                  if(this.debug) itemValue = {value: itemValue, path: keyPath};
                  if(itemValue && itemValue !== '') itemData[key] = itemValue;
                }
              }
            
              // if has other types, add type to object
              if(other_types.length > 0){
                data.push({type: dataConfig['index'] ,...itemData});
              }else{
                data.push(itemData);
              }
            })
            return list ? data : (data[0] ?? null);
          }catch(error: any){
            console.error( `parentKey: ${parentKey}`);
            throw error;
          }
        }else{
          throw `wrapper format error: ${parentKey}`
        }
      }else{
        return this.parseNode({item, parentElement, parentKey} )
      }
    }
  }

export { CheerioTreeConfig, CheerioTreeOptions }