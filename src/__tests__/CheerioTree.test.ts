import CheerioTree from '@/index'; 
import type { CheerioTreeOptions, CheerioTreeConfig } from '@/index'; 
import fs from 'fs';
import yaml from 'js-yaml';
const cwd = process.cwd();

describe('CheerioTree', () => {
  let cheerioTree: CheerioTree;
  let cheerioTreeClear: CheerioTree;
  const body = fs.readFileSync( cwd + '/src/__tests__/data/google/serp.html').toString("utf8");
  const configYml = fs.readFileSync( cwd + '/src/__tests__/data/google/config.yml').toString("utf8");
  const defaultConfig: CheerioTreeOptions = { body: body };
  const config = yaml.load(configYml) as CheerioTreeConfig;

  beforeEach(() => {
    cheerioTree = new CheerioTree(defaultConfig);
    cheerioTreeClear = new CheerioTree({ body, clear: true });
  });

  it('origin_results.results test', async () => {
    const data = cheerioTree.parse({config});
    // console.log(JSON.stringify(data, null, 2))
    expect(data.meta.query_displayed).toEqual('cheerio');
    expect(data.origin_results.results.length).toBeGreaterThan(0);

    // test reload
    cheerioTree.load(body);
    const reload = cheerioTree.parse({config});
    expect(reload.meta.query_displayed).toEqual('cheerio');
    expect(reload.origin_results.results.length).toBeGreaterThan(0);
  });

  it('test clear', async () => {
    const data = cheerioTreeClear.parse({config, beforeParse: ({cheerio}) =>{ 
      expect(cheerio('style,noscript').length).toEqual(0);
    }}); 
    expect(data.meta.query_displayed).toEqual('cheerio');
    expect(data.origin_results.results.length).toBeGreaterThan(0); 
  });


  it('sample test', async () => {
    const config = `
tree:
  nodes:
    title:
      selector: title
    body:
      selector: body
      attr: html
      to_markdown: true
    footer:
      selector: .footer
`;
    const html = `
    <html lang="en">
      <head>
        <title>Cheerio Tree</title>
      </head>
      <body>
        <h1>Cheerio Tree</h1>
        <main>
          <h2>What is Cheerio Tree?</h2>
          <p><b>Cheerio Tree</b> is a powerful utility built on <b>Cheerio</b>, designed for efficient DOM parsing. It enables rapid conversion of HTML data into JSON format. When paired with YAML, it provides an intuitive and streamlined approach to data handling and transformation.</p>
        </main>
      </body>
    </html>
    `
    const configYaml = yaml.load(config) as CheerioTreeConfig;

    const cheerioTree = new CheerioTree({ body: html });
    const data = cheerioTree.parse({config: configYaml, beforeParse: ({cheerio}) =>{
      cheerio('body').append("<div class='footer'>Append Text..</div>")
    }});
    // console.log(JSON.stringify(data, null, 2))
    expect(data.title).toEqual('Cheerio Tree');
    expect(data.footer).toEqual('Append Text..');
  });

})