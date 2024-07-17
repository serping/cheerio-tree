import yaml from 'js-yaml'; 
import CheerioTree from 'cheerio-tree';

const config = `
tree:
  nodes:
    title:
      selector: title
    body:
      selector: body
      attr: html
      to_markdown: true
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
const configYaml = yaml.load(config);

const cheerioTree = new CheerioTree({ body: html });
const data = cheerioTree.parse({config: configYaml});

console.log(JSON.stringify(data));