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
import CheerioTree { type CheerioTreeOptions, type CheerioTreeConfig } from 'cheerio-tree';

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

## YAML Sample

Google SERP Config

```yaml
regexToI: &regexToI
  regex: '[^\d]'
  replace:
regexToF: &regexToF
  regex: '[^\d\.]'
  replace:

regexToK: &regexToK
  regex: 'K'
  replace: "000"

regexToM: &regexToM
  regex: 'M'
  replace: "000"
  
regexToB: &regexToB
  regex: 'B'
  replace: "000"

# string to int
# eg. 1.1K will be 1100
toI: &toI
  - <<: *regexToK
  - <<: *regexToM
  - <<: *regexToB
  - <<: *regexToI

# serp item source
# ====================================
source: &source
  wrapper:
    list: false
    selector: a[jsname="UWckNb"]
    normal:
      title: 
        selector: h3
      name:
        selector: a[jsname="UWckNb"] span.VuuXrf
      display_link:
        selector: a[jsname="UWckNb"] .byrV5b cite
      link:
        selector: SELF
        attr: href

link: &link
  selector: a
  attr: href

rich_snippet: &rich_snippet
  wrapper:
    list: false
    selector: SELF
    normal:
      rated:
        wrapper:
          list: false
          selector: div[data-snf="mCCBcf"]
          other_types:
            - name: store
              validate:
                selector: span.z3HNkc.fUNJzc
            - name: normal
              validate:
                selector: span.z3HNkc:not(.fUNJzc)
          store:
            link:
              <<: *link
            label:
              selector: span[aria-label]
              attr: aria-label
            rating:
              to_f:
              selector: span[aria-hidden]
            reviews:
              selector: a
              to_i:
              after_regular: *toI 

            reviews_origin:
              selector: a
          normal:
            display_price:
              selector: span.LI0TWe.wHYlTd
            rating:
              selector: div > span:nth-child(2)
              to_f:
              after_regular:
                - <<: *regexToF
            label:
              selector: span[aria-label]
              attr: aria-label
            reviews:
              selector: div > span:nth-child(3)
              to_i:
              after_regular: *toI
            reviews_origin:
              selector: div > span:nth-child(3)
      extensions:
        selector: div[data-snf="mCCBcf"]

origin_search_normal: &origin_search_normal
  other_types:
    - name: twitter
      validate:
        selector: div.g.eejeod
    - name: site_links
      validate:
        selector: .BYM4Nd
    - name: video
      validate:
        selector: div[jscontroller="rTuANe"]
        except: '[jscontroller="UzbKLd"]'
    - name: book
      validate:
        selector: div.ChPIuf a[href*="tbm=bks"]
    - name: normal
      validate:
        selector: .g
        except: product-viewer-group
  normal:
    title:
      selector: .yuRUbf a[jsname="UWckNb"] h3
    snippet:
      selector: div[data-snf="nke7rc"]
      attr: html
      to_markdown: true
    source:
      <<: *source
    thumbnail:
      selector: div[data-snf="Vjbam"] img
      attr: src
    snippet_highlighted_words:
      selector: em
      is_array: true
    rich_snippet:
      <<: *rich_snippet
    links:
      wrapper:
        list: true
        selector:  div[data-snf="gdePb"] a
        normal:
          title: 
            selector: SELF
          link:
            selector: SELF
            attr: href


# Main
# ====================================================
# ====================================================
tree:
  url:
    match: https://www.google.com/search
    params: 
      q:
        name: query
        required: true
      gl:
        name: Country Code
      hl:
        name: lang code
      num:
        name: serp results
      start:
        name: offset

  nodes:
    meta:
      wrapper:
        list: false
        selector: body
        normal:
          query_displayed:
            selector: '#tsf textarea'
          result_stats:
            wrapper:
              list: false
              selector: div#result-stats
              normal:
                total_results:
                  selector: SELF
                  attr: html
                  after_regular:
                    - regex: '<nobr>.*</nobr>'
                      replace:
                    - regex: '[^\d]'
                      replace:
                time_taken_displayed:
                  selector: nobr
                  after_regular:
                    - regex: '[^\d\.]'
                      replace:
    origin_results:
      wrapper:
        list: false
        selector: div[id="rcnt"]
        normal:
          results:
            wrapper:
              remove_children_node:
                selector: .LEwnzc.Sqrs4e
              position: true
              list: true
              selector: '#rso > .MjjYud, #rso div > .MjjYud, #Odp5De'
              <<: *origin_search_normal
```

[src/__tests__/data/google/config.yml](src/__tests__/data/google/config.yml)
