# Cheerio Tree

What is Cheerio Tree?

**Cheerio Tree** is a powerful utility built on **Cheerio**, designed for efficient DOM parsing. It enables rapid conversion of **HTML data into JSON format**. When paired with **YAML**, it provides an intuitive and streamlined approach to data handling and transformation.

## Install

```bash
npm install cheerio-tree

# or
yarn add cheerio-tree

# or
pnpm install cheerio-tree
```

## Dependencies

- [cheerio](https://github.com/cheeriojs/cheerio)
- [turndown](https://github.com/mixmark-io/turndown)

## Usage

### Easy YAML Config

Just look like:

```yaml
# ./config.yml
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
```

### Typescript

```typescript
import fs from 'fs';
import yaml from 'js-yaml';
import CheerioTree, { type CheerioTreeConfig } from 'cheerio-tree';

const config = fs.readFileSync('./config.yml', "utf-8");
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
const data = cheerioTree.parse({
  config: configYaml,
  beforeParse: ({cheerio}) =>{
    cheerio('body').append("<footer class='footer'>Append Text..</footer>")
  }
});
console.log(data);

```

output

```json
{
  "title": "Cheerio Tree",
  "body": "Cheerio Tree\n============\n\nWhat is Cheerio Tree?\n---------------------\n\n**Cheerio Tree** is a powerful utility built on **Cheerio**, designed for efficient DOM parsing. It enables rapid conversion of HTML data into JSON format. When paired with YAML, it provides an intuitive and streamlined approach to data handling and transformation.\n\nAppend Text..",
  "footer": "Append Text.."
}
```

## Need More YAML Config Demo?

Here is a demo based on the **Cheerio Tree** Scraper API:

GITHUB: <https://github.com/serping/express-scraper>

- [Google SERP Scarper YAML](https://github.com/serping/express-scraper/blob/main/data/google/desktopSerp.yml)
- [https://wordpress.com/tags](https://github.com/serping/express-scraper/blob/main/data/wordpressCom/tags.yml)

![Yaml Nodes](doc/Cheerio-Tree.svg)