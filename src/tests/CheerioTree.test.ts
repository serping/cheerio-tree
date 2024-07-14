import CheerioTree from '@/index'; 
import type { CheerioTreeOptions, CheerioTreeConfig } from '@/types'; 
import fs from 'fs';
import yaml from 'js-yaml';
const cwd = process.cwd();

describe('CheerioTree', () => {
  let cheerioTree: CheerioTree;
  const body = fs.readFileSync( cwd + '/src/tests/data/google/serp.html').toString("utf8");
  const configYml = fs.readFileSync( cwd + '/src/tests/data/google/config.yml').toString("utf8");
  const defaultConfig: CheerioTreeOptions = { body: body, debug: true };
  const config = yaml.load(configYml) as CheerioTreeConfig;

  beforeEach(() => {
    cheerioTree = new CheerioTree(defaultConfig);
  });

  it('should throw error if query is empty', async () => {
    const data = cheerioTree.parse({config});
    expect(typeof data).rejects.toEqual('JSON');
  });

})