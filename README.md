# Cheerio Tree

What is Cheerio Tree?

**Cheerio Tree** is a powerful utility built on **Cheerio**, designed for efficient DOM parsing. It enables rapid conversion of **HTML data into JSON format**. When paired with **YAML**, it provides an intuitive and streamlined approach to data handling and transformation.

## Install

```bash
npm install cheerio-tree
```

## Usage

### Typescript

```typescript
import yaml from 'js-yaml';
import type { CheerioTreeOptions, CheerioTreeConfig } from 'cheerio-tree/types';

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
const configYaml = yaml.load(config) as CheerioTreeConfig;

const cheerioTree = new CheerioTree({ body: html });
const data = cheerioTree.parse({configYaml});

console.log(data);

// output {"title":"Cheerio Tree","body":"Cheerio Tree\n============\n\nWhat is Cheerio Tree?\n---------------------\n\n**Cheerio Tree** is a powerful utility built on **Cheerio**, designed for efficient DOM parsing. It enables rapid conversion of HTML data into JSON format. When paired with YAML, it provides an intuitive and streamlined approach to data handling and transformation.","meta":{"parse_duration":"1 ms"}}
```
